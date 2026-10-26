import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  AlertTriangle,
  Package,
  Layers,
  ChevronRight,
  ArrowRight,
  User,
  Store,
  DollarSign
} from "lucide-react";
import adminService from "../../../services/adminService";
import s from "./OrderLifecycle.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);

const STEP_STAGES = [
  { key: "UNPAID", label: "Chờ thanh toán" },
  { key: "READY_TO_SHIP", label: "Chờ lấy hàng" },
  { key: "PROCESSED", label: "Đã xử lý kho" },
  { key: "SHIPPED", label: "Đang giao" },
  { key: "COMPLETED", label: "Hoàn thành" },
];

function getStepIndex(status) {
  switch (status) {
    case "UNPAID":
      return 0;
    case "READY_TO_SHIP":
      return 1;
    case "PROCESSED":
      return 2;
    case "SHIPPED":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return -1;
  }
}

export default function OrderLifecycleTab({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [expiringOverdue, setExpiringOverdue] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders(selectedShopId, selectedStatus);
      const list = Array.isArray(data) ? data : [];
      setOrders(list);

      // Keep selected order updated or pick the first if current is lost
      if (selectedOrder) {
        const found = list.find((o) => o.order_sn === selectedOrder.order_sn);
        if (found) setSelectedOrder(found);
      } else if (list.length > 0) {
        setSelectedOrder(list[0]);
      }
    } catch (err) {
      showToast?.(`Lỗi tải danh sách đơn hàng: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedShopId, selectedStatus]);

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const snMatch = (order.order_sn || "").toLowerCase().includes(q);
    const buyerMatch = (order.buyer_username || "").toLowerCase().includes(q);
    return snMatch || buyerMatch;
  });

  const handlePay = async (order) => {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminService.advanceOrderPaid(order.order_sn, order.shop_id);
      showToast?.(`Đã đánh dấu thanh toán thành công: ${order.order_sn}`, "success");
      await fetchOrders();
    } catch (err) {
      showToast?.(`Lỗi thanh toán: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCarrierPickup = async (order) => {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminService.advanceOrderCarrierPickup(order.order_sn, order.shop_id);
      showToast?.(`Đơn vị vận chuyển đã lấy hàng: ${order.order_sn}`, "success");
      await fetchOrders();
    } catch (err) {
      showToast?.(`Lỗi lấy hàng: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async (order) => {
    if (!order) return;
    setActionLoading(true);
    try {
      await adminService.advanceOrderDelivered(order.order_sn, order.shop_id);
      showToast?.(`Đã giao thành công đơn hàng: ${order.order_sn}`, "success");
      await fetchOrders();
    } catch (err) {
      showToast?.(`Lỗi giao hàng: ${err.message}`, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleExpireOverdue = async () => {
    setExpiringOverdue(true);
    try {
      const targetShop = selectedShopId === "ALL" ? 727720655 : selectedShopId;
      const res = await adminService.expireOverdueOrders(targetShop);
      const count = res?.expired_count ?? 0;
      showToast?.(
        `Quét đơn quá hạn hoàn tất: đã huỷ ${count} đơn hàng vượt SLA`,
        count > 0 ? "warning" : "info"
      );
      await fetchOrders();
    } catch (err) {
      showToast?.(`Lỗi quét đơn quá hạn: ${err.message}`, "error");
    } finally {
      setExpiringOverdue(false);
    }
  };

  const currentStepIdx = selectedOrder ? getStepIndex(selectedOrder.order_status) : -1;

  const renderStatusBadge = (status) => {
    switch (status) {
      case "UNPAID":
        return <span className={`${s.badge} ${s.badgeUnpaid}`}>Chờ thanh toán</span>;
      case "READY_TO_SHIP":
        return <span className={`${s.badge} ${s.badgeReady}`}>Chờ lấy hàng</span>;
      case "PROCESSED":
        return <span className={`${s.badge} ${s.badgeProcessed}`}>Đã xử lý kho</span>;
      case "SHIPPED":
        return <span className={`${s.badge} ${s.badgeShipped}`}>Đang giao hàng</span>;
      case "COMPLETED":
        return <span className={`${s.badge} ${s.badgeCompleted}`}>Đã hoàn thành</span>;
      case "CANCELLED":
        return <span className={`${s.badge} ${s.badgeCancelled}`}>Đã huỷ</span>;
      case "TO_RETURN":
        return <span className={`${s.badge} ${s.badgeToReturn}`}>Trả hàng / Hoàn tiền</span>;
      default:
        return <span className={s.badge}>{status}</span>;
    }
  };

  return (
    <div className={s.container}>
      {/* Toolbar Filters & Action */}
      <div className={s.toolbar}>
        <div className={s.filterGroup}>
          <div className={s.searchBox}>
            <Search size={16} className={s.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo Order SN hoặc Người mua..."
              className={s.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={s.select}
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
          >
            <option value="ALL">Tất cả Shop (Multi-Shop)</option>
            <option value="727720655">727720655 - SmartOmni Official Flagship</option>
            <option value="839910244">839910244 - Hanoi Streetwear Co.</option>
            <option value="910283751">910283751 - Saigon Modern Living</option>
          </select>

          <select
            className={s.select}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="UNPAID">Chờ thanh toán (UNPAID)</option>
            <option value="READY_TO_SHIP">Chờ lấy hàng (READY_TO_SHIP)</option>
            <option value="PROCESSED">Đã xử lý kho (PROCESSED)</option>
            <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
            <option value="COMPLETED">Hoàn thành (COMPLETED)</option>
            <option value="CANCELLED">Đã huỷ (CANCELLED)</option>
            <option value="TO_RETURN">Khiếu nại / Hoàn trả (TO_RETURN)</option>
          </select>
        </div>

        <div className={s.toolbarActions}>
          <button
            className={s.btnOverdue}
            onClick={handleExpireOverdue}
            disabled={expiringOverdue}
            title="Quét các đơn hàng đã tạo quá thời hạn thanh toán hoặc xử lý và tự động huỷ theo SLA"
          >
            <Clock size={15} />
            {expiringOverdue ? "Đang quét..." : "Quét huỷ đơn quá hạn SLA"}
          </button>
          <button className={s.btnRefresh} onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={15} className={loading ? "spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Selected Order Fast-Forward Controller */}
      {selectedOrder && (
        <div className={s.controllerCard}>
          <div className={s.controllerHeader}>
            <div className={s.controllerTitle}>
              <Layers size={18} />
              Điều khiển Vòng đời Đơn hàng (Order Lifecycle Fast-Forward)
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>Trạng thái hiện tại:</span>
              {renderStatusBadge(selectedOrder.order_status)}
            </div>
          </div>

          <div className={s.orderMetaGrid}>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Mã đơn hàng</span>
              <span className={s.metaValueMono}>{selectedOrder.order_sn}</span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Cửa hàng</span>
              <span className={s.metaValue}>
                {selectedOrder.shop_name || `Shop #${selectedOrder.shop_id}`}
              </span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Người mua</span>
              <span className={s.metaValue}>
                {selectedOrder.recipient_name || selectedOrder.buyer_username || "Khách hàng"}
              </span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Tổng thanh toán</span>
              <span className={s.metaValue} style={{ color: "#d97706" }}>
                {money(selectedOrder.total_amount)}
              </span>
            </div>
            <div className={s.metaItem}>
              <span className={s.metaLabel}>Sản phẩm</span>
              <span className={s.metaValue}>
                {selectedOrder.items?.length || 0} sản phẩm (
                {selectedOrder.items?.map((it) => it.item_name).join(", ").slice(0, 45) || "N/A"}
                ...)
              </span>
            </div>
          </div>

          {/* Stepper Pipeline */}
          <div className={s.stepper}>
            <div className={s.stepperTrack} />
            <div
              className={s.stepperProgress}
              style={{
                width:
                  currentStepIdx >= 0
                    ? `${(currentStepIdx / (STEP_STAGES.length - 1)) * 100}%`
                    : "0%",
              }}
            />
            {STEP_STAGES.map((step, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div
                  key={step.key}
                  className={`${s.stepNode} ${isCurrent ? s.active : ""} ${
                    isPast && !isCurrent ? s.completed : ""
                  }`}
                >
                  <div className={s.stepCircle}>
                    {isPast && !isCurrent ? "✓" : idx + 1}
                  </div>
                  <div className={s.stepLabel}>{step.label}</div>
                </div>
              );
            })}
          </div>

          {/* Action Fast-Forward Buttons */}
          <div className={s.actionsRow}>
            <button
              className={s.btnActionPay}
              onClick={() => handlePay(selectedOrder)}
              disabled={actionLoading}
              title="Mô phỏng thanh toán thành công -> chuyển sang Chờ lấy hàng (READY_TO_SHIP)"
            >
              <CreditCard size={15} />
              1. Đánh dấu đã thanh toán (Mark Paid)
            </button>

            <button
              className={s.btnActionPickup}
              onClick={() => handleCarrierPickup(selectedOrder)}
              disabled={actionLoading}
              title="Mô phỏng shipper tới kho lấy hàng -> chuyển sang Đang giao (SHIPPED)"
            >
              <Truck size={15} />
              2. ĐVVC lấy hàng (Carrier Pickup)
            </button>

            <button
              className={s.btnActionDeliver}
              onClick={() => handleDeliver(selectedOrder)}
              disabled={actionLoading}
              title="Mô phỏng shipper giao kiện hàng thành công -> chuyển sang Hoàn thành (COMPLETED)"
            >
              <CheckCircle size={15} />
              3. Giao hàng thành công (Mark Delivered)
            </button>
          </div>
        </div>
      )}

      {/* Orders List Table */}
      <div className={s.tableCard}>
        <div className={s.tableHeaderBar}>
          <div className={s.tableTitle}>Danh sách đơn hàng trong Hệ thống</div>
          <div className={s.tableCount}>{filteredOrders.length} đơn hàng</div>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Cửa hàng</th>
                <th>Người mua</th>
                <th>Tổng tiền</th>
                <th>Trạng thái đơn</th>
                <th>Vận chuyển</th>
                <th>Thao tác nhanh</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className={s.emptyState}>
                    <Package size={36} className={s.emptyIcon} />
                    <div>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isSelected = selectedOrder?.order_sn === order.order_sn;
                  return (
                    <tr
                      key={order.order_sn}
                      className={`${s.tableRow} ${isSelected ? s.selected : ""}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td>
                        <strong style={{ color: "#7b2cbf" }}>{order.order_sn}</strong>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", fontWeight: "600" }}>
                          {order.shop_name}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>
                          ID: {order.shop_id}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "12px", fontWeight: "500" }}>
                          {order.recipient_name || order.buyer_username}
                        </div>
                        <div style={{ fontSize: "11px", color: "#6b7280" }}>
                          {order.shipping_carrier || "SPX Express"}
                        </div>
                      </td>
                      <td>
                        <strong>{money(order.total_amount)}</strong>
                      </td>
                      <td>{renderStatusBadge(order.order_status)}</td>
                      <td>
                        <span style={{ fontSize: "11px", color: "#4b5563" }}>
                          {order.packages?.[0]?.logistics_status || "Chưa phát hành"}
                        </span>
                      </td>
                      <td>
                        <div
                          className={s.inlineActions}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className={`${s.btnMini} ${s.btnMiniPay}`}
                            onClick={() => handlePay(order)}
                            title="Đánh dấu đã thanh toán"
                          >
                            Thanh toán
                          </button>
                          <button
                            className={`${s.btnMini} ${s.btnMiniPickup}`}
                            onClick={() => handleCarrierPickup(order)}
                            title="Lấy hàng"
                          >
                            Lấy hàng
                          </button>
                          <button
                            className={`${s.btnMini} ${s.btnMiniDeliver}`}
                            onClick={() => handleDeliver(order)}
                            title="Giao hàng"
                          >
                            Giao hàng
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
