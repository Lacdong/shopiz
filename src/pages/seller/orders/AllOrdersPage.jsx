import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  FileSpreadsheet,
  History,
  Package,
  Clock,
  Printer,
  Truck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import sellerService from "../../../services/sellerService";
import SellerPagination from "../SellerPagination";
import s from "./AllOrdersPage.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const STATUS_TABS = [
  { id: "all", label: "Tất cả" },
  { id: "unpaid", label: "Chờ xác nhận", backendStatuses: ["UNPAID"] },
  { id: "to_ship", label: "Chờ lấy hàng", backendStatuses: ["READY_TO_SHIP", "PROCESSED"] },
  { id: "shipping", label: "Đang giao", backendStatuses: ["SHIPPED"] },
  { id: "completed", label: "Đã giao", backendStatuses: ["COMPLETED"] },
  { id: "cancelled", label: "Trả hàng/Hoàn tiền/Hủy", backendStatuses: ["CANCELLED", "IN_CANCEL"] },
];

const STATUS_DISPLAY_MAP = {
  UNPAID: { text: "Chờ xác nhận", color: "#fa8c16", bg: "#fff7e6" },
  READY_TO_SHIP: { text: "Chờ lấy hàng", color: "#fa541c", bg: "#fff2e8" },
  PROCESSED: { text: "Đang chuẩn bị", color: "#1890ff", bg: "#e6f7ff" },
  SHIPPED: { text: "Đang giao", color: "#13c2c2", bg: "#e6fffb" },
  COMPLETED: { text: "Đã giao", color: "#52c41a", bg: "#f6ffed" },
  IN_CANCEL: { text: "Yêu cầu hủy", color: "#eb2f96", bg: "#fff0f6" },
  CANCELLED: { text: "Đã hủy", color: "#8c8c8c", bg: "#f5f5f5" },
};

function formatCountdown(shipByDateSeconds) {
  if (!shipByDateSeconds) return "—";
  const now = Math.floor(Date.now() / 1000);
  const diffSec = shipByDateSeconds - now;
  if (diffSec <= 0) return "Quá hạn gửi hàng";
  const hours = Math.floor(diffSec / 3600);
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `Còn ${days} ngày ${remHours} giờ`;
  return `Còn ${hours} giờ`;
}

export default function AllOrdersPage({ shopId = 727720655 }) {
  const [params, setParams] = useSearchParams();
  const activeTabId = params.get("order_status") || "all";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter controls
  const [searchType, setSearchType] = useState("order_sn");
  const [searchQuery, setSearchQuery] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("ALL");
  const [appliedFilters, setAppliedFilters] = useState({
    searchType: "order_sn",
    query: "",
    carrier: "ALL",
  });

  const [actionNotice, setActionNotice] = useState("");
  const [historyModal, setHistoryModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever activeTabId changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTabId]);

  // Fetch orders from simulator backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    sellerService
      .getOrders(shopId)
      .then((data) => {
        setOrders(data || []);
      })
      .catch((err) => {
        setError(err.message || "Không thể tải danh sách đơn hàng.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shopId]);

  // Available carriers derived dynamically from orders
  const availableCarriers = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      if (o.shipping_carrier) set.add(o.shipping_carrier);
    });
    return Array.from(set);
  }, [orders]);

  // Tab switching
  const handleSelectTab = (tabId) => {
    setCurrentPage(1);
    const next = new URLSearchParams(params);
    next.set("order_status", tabId);
    setParams(next);
  };

  // Filter application
  const handleApplyFilter = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    setAppliedFilters({
      searchType,
      query: searchQuery.trim(),
      carrier: carrierFilter,
    });
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setCarrierFilter("ALL");
    setAppliedFilters({
      searchType: "order_sn",
      query: "",
      carrier: "ALL",
    });
  };

  // Filtered orders calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Status Tab filter
      const tab = STATUS_TABS.find((t) => t.id === activeTabId);
      if (tab && tab.backendStatuses) {
        if (!tab.backendStatuses.includes(o.order_status)) return false;
      }

      // 2. Shipping Carrier filter
      if (appliedFilters.carrier !== "ALL" && o.shipping_carrier !== appliedFilters.carrier) {
        return false;
      }

      // 3. Search query filter
      if (appliedFilters.query) {
        const q = appliedFilters.query.toLowerCase();
        if (appliedFilters.searchType === "order_sn") {
          return o.order_sn?.toLowerCase().includes(q);
        } else if (appliedFilters.searchType === "buyer") {
          return (
            o.buyer_username?.toLowerCase().includes(q) ||
            o.recipient_name?.toLowerCase().includes(q)
          );
        } else if (appliedFilters.searchType === "product") {
          return (o.items || []).some((item) => item.item_name?.toLowerCase().includes(q));
        }
      }

      return true;
    });
  }, [orders, activeTabId, appliedFilters]);

  // Paginated slice for current page
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: orders.length };
    STATUS_TABS.forEach((t) => {
      if (t.backendStatuses) {
        counts[t.id] = orders.filter((o) => t.backendStatuses.includes(o.order_status)).length;
      }
    });
    return counts;
  }, [orders]);

  // Arrange shipment
  const handleArrangeShipment = async (orderSn) => {
    try {
      const res = await sellerService.shipOrder(orderSn);
      const newStatus = res?.order_status || "PROCESSED";
      const trackingNo = res?.tracking_number;
      setActionNotice(`Đã sắp xếp giao hàng thành công cho đơn #${orderSn}!`);
      // Update local status to PROCESSED ("Đang chuẩn bị") and populate tracking number
      setOrders((prev) =>
        prev.map((o) => {
          if (o.order_sn !== orderSn) return o;
          const currentPackages = o.packages || [];
          const updatedPackages =
            currentPackages.length > 0
              ? currentPackages.map((pkg) => ({
                  ...pkg,
                  tracking_number: trackingNo || pkg.tracking_number,
                  logistics_status: "LOGISTICS_REQUEST_CREATED",
                  document_status: "READY",
                }))
              : trackingNo
              ? [
                  {
                    package_number: `PKG-${orderSn}`,
                    tracking_number: trackingNo,
                    logistics_status: "LOGISTICS_REQUEST_CREATED",
                    document_status: "READY",
                  },
                ]
              : [];

          return {
            ...o,
            order_status: newStatus,
            packages: updatedPackages,
          };
        }),
      );
    } catch (err) {
      setActionNotice(err.message || `Sắp xếp giao hàng cho đơn #${orderSn} thất bại.`);
    }
  };

  // Generate & Download AWB
  const handlePrintAwb = async (orderSn) => {
    try {
      await sellerService.generateAwb(orderSn);
      window.open(sellerService.getAwbDownloadUrl(orderSn), "_blank");
    } catch {
      window.open(sellerService.getAwbDownloadUrl(orderSn), "_blank");
    }
  };

  // Export CSV
  const handleExportOrders = () => {
    const headers = ["Mã đơn hàng", "Người mua", "Trạng thái", "ĐVVC", "Tổng tiền", "Ngày tạo"];
    const rows = filteredOrders.map((o) => [
      o.order_sn,
      o.buyer_username || o.recipient_name,
      STATUS_DISPLAY_MAP[o.order_status]?.text || o.order_status,
      o.shipping_carrier || "SPX Express",
      o.total_amount,
      new Date(o.create_time * 1000).toLocaleString("vi-VN"),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shopee_orders_${activeTabId}_${Date.now()}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={s.pageWrapper}>
      {/* 1. Main Panel Header */}
      <div className={s.headerRow}>
        <h1 className={s.pageTitle}>Tất cả</h1>
        <div className={s.headerActions}>
          <button
            type="button"
            className={s.btnSecondary}
            onClick={handleExportOrders}
            title="Xuất danh sách đơn hàng ra file CSV"
          >
            <FileSpreadsheet size={15} /> Xuất
          </button>
          <button
            type="button"
            className={s.btnSecondary}
            onClick={() => setHistoryModal(true)}
            title="Xem lịch sử xuất báo cáo"
          >
            <History size={15} /> Lịch sử Xuất Báo cáo
          </button>
        </div>
      </div>

      {/* Main Content White Panel */}
      <div className={s.mainPanel}>
        {/* 2. Order Status Tabs */}
        <div className={s.tabsRow} role="tablist">
          {STATUS_TABS.map((tab) => {
            const isSelected = activeTabId === tab.id;
            const count = tabCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                className={`${s.tabBtn} ${isSelected ? s.tabActive : ""}`}
                onClick={() => handleSelectTab(tab.id)}
              >
                <span>{tab.label}</span>
                {count > 0 && <span className={s.tabBadge}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* 3. Search and Filter Toolbar */}
        <form className={s.filterToolbar} onSubmit={handleApplyFilter}>
          {/* Combined order search control */}
          <div className={s.searchCombo}>
            <select
              className={s.searchSelect}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              aria-label="Loại tìm kiếm đơn hàng"
            >
              <option value="order_sn">Mã đơn hàng</option>
              <option value="buyer">Người mua</option>
              <option value="product">Tên sản phẩm</option>
            </select>
            <div className={s.inputWrap}>
              <Search size={16} className={s.searchIcon} />
              <input
                type="text"
                className={s.searchInput}
                placeholder={
                  searchType === "order_sn"
                    ? "Nhập Mã đơn hàng"
                    : searchType === "buyer"
                      ? "Nhập tên người mua"
                      : "Nhập tên sản phẩm"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Shipping provider filter */}
          <div className={s.carrierFilter}>
            <label className={s.carrierLabel}>Đơn vị vận chuyển</label>
            <select
              className={s.carrierSelect}
              value={carrierFilter}
              onChange={(e) => setCarrierFilter(e.target.value)}
              aria-label="Đơn vị vận chuyển"
            >
              <option value="ALL">Tất cả ĐVVC</option>
              <option value="Shopee Xpress">Shopee Xpress</option>
              <option value="SPX Express">SPX Express</option>
              <option value="SPX Instant">SPX Instant</option>
              <option value="SPX Economy">SPX Economy</option>
              {availableCarriers
                .filter((c) => !["Shopee Xpress", "SPX Express", "SPX Instant", "SPX Economy"].includes(c))
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter action buttons */}
          <div className={s.filterActions}>
            <button type="submit" className={s.btnApply}>
              Áp dụng
            </button>
            <button type="button" className={s.btnReset} onClick={handleResetFilter}>
              Đặt lại
            </button>
          </div>
        </form>

        {/* 4. Dynamic Order Count */}
        <div className={s.countRow}>
          <span className={s.countNumber}>
            {loading ? "Đang tải..." : `${filteredOrders.length} Đơn hàng`}
          </span>
        </div>

        {/* 5. Order Table */}
        <div className={s.tableContainer}>
          <table className={s.ordersTable}>
            <thead>
              <tr>
                <th style={{ width: "38%" }}>Sản phẩm</th>
                <th style={{ width: "16%" }}>Tổng số tiền Người mua thanh toán</th>
                <th style={{ width: "12%" }}>Trạng thái</th>
                <th style={{ width: "12%" }}>Đếm ngược</th>
                <th style={{ width: "12%" }}>Đơn vị vận chuyển</th>
                <th style={{ width: "10%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const statusMeta = STATUS_DISPLAY_MAP[order.order_status] || {
                  text: order.order_status,
                  color: "#595959",
                  bg: "#f5f5f5",
                };
                const hasAwb =
                  order.packages?.[0]?.document_status === "READY" ||
                  order.packages?.[0]?.tracking_number ||
                  ["SHIPPED", "COMPLETED"].includes(order.order_status);

                return (
                  <React.Fragment key={order.order_sn}>
                    {/* Order metadata banner row */}
                    <tr className={s.orderMetaRow}>
                      <td colSpan={6}>
                        <div className={s.metaContent}>
                          <span className={s.buyerName}>
                            Người mua: <strong>{order.buyer_username || order.recipient_name}</strong>
                          </span>
                          <span className={s.orderSn}>Mã đơn hàng: {order.order_sn}</span>
                          <span className={s.orderDate}>
                            {new Date(order.create_time * 1000).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Order items and data row */}
                    <tr className={s.orderDataRow} data-ordersn={order.order_sn}>
                      {/* Sản phẩm */}
                      <td className={s.productCol}>
                        {order.items && order.items.length > 0 ? (
                          <div className={s.itemList}>
                            {order.items.map((item) => (
                              <div key={item.order_item_id} className={s.productItem}>
                                <div className={s.thumbWrap}>
                                  <Package size={24} className={s.thumbIcon} />
                                </div>
                                <div className={s.itemInfo}>
                                  <span className={s.itemName}>{item.item_name}</span>
                                  {item.model_name && (
                                    <span className={s.modelName}>Phân loại: {item.model_name}</span>
                                  )}
                                  <span className={s.itemQty}>x{item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={s.productItem}>
                            <div className={s.thumbWrap}>
                              <Package size={24} className={s.thumbIcon} />
                            </div>
                            <div className={s.itemInfo}>
                              <span className={s.itemName}>Sản phẩm đơn hàng</span>
                              <span className={s.itemQty}>x1</span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Tổng số tiền Người mua thanh toán */}
                      <td className={s.paymentCol}>
                        <span className={s.paymentAmount}>{money(order.total_amount)}</span>
                        <span className={s.paymentMethod}>{order.payment_method || "ShopeePay"}</span>
                      </td>

                      {/* Trạng thái */}
                      <td className={s.statusCol}>
                        <span
                          className={s.statusBadge}
                          style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                        >
                          {statusMeta.text}
                        </span>
                      </td>

                      {/* Đếm ngược */}
                      <td className={s.countdownCol}>
                        {["READY_TO_SHIP", "UNPAID"].includes(order.order_status) && order.ship_by_date ? (
                          <div className={s.countdownBadge}>
                            <Clock size={12} />
                            <span>{formatCountdown(order.ship_by_date)}</span>
                          </div>
                        ) : (
                          <span className={s.noCountdown}>—</span>
                        )}
                      </td>

                      {/* Đơn vị vận chuyển */}
                      <td className={s.carrierCol}>
                        <div className={s.carrierWrap}>
                          <span className={s.carrierName}>{order.shipping_carrier || "SPX Express"}</span>
                          {order.packages?.[0]?.tracking_number && (
                            <span className={s.trackingNumber}>
                              {order.packages[0].tracking_number}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Thao tác */}
                      <td className={s.actionCol}>
                        <div className={s.actionList}>
                          {order.order_status === "UNPAID" || order.order_status === "READY_TO_SHIP" ? (
                            <button
                              type="button"
                              className={s.btnPrimaryAction}
                              onClick={() => handleArrangeShipment(order.order_sn)}
                            >
                              Chuẩn bị hàng
                            </button>
                          ) : null}

                          {order.order_status === "PROCESSED" ||
                          order.order_status === "SHIPPED" ||
                          order.order_status === "COMPLETED" ||
                          hasAwb ? (
                            <button
                              type="button"
                              className={s.btnAwbAction}
                              onClick={() => handlePrintAwb(order.order_sn)}
                              title="Tải & In phiếu giao hàng AWB (PDF)"
                            >
                              <Printer size={13} /> In phiếu AWB
                            </button>
                          ) : null}

                          {order.order_status === "CANCELLED" && (
                            <span className={s.cancelledNote}>Đã hủy</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* 6. Empty State */}
          {!loading && filteredOrders.length === 0 && (
            <div className={s.emptyState}>
              <div className={s.emptyIconWrap}>
                <Package size={52} strokeWidth={1.2} className={s.emptyIcon} />
              </div>
              <p className={s.emptyMessage}>
                Vui lòng Xuất báo cáo để xem các đơn hàng trước 24/10/2024.
              </p>
            </div>
          )}
        </div>

        {/* 7. Pagination */}
        <SellerPagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      {/* Action Toast Notice */}
      {actionNotice && (
        <div className={s.toast}>
          <CheckCircle2 size={16} color="#52c41a" />
          <span>{actionNotice}</span>
          <button type="button" className={s.toastClose} onClick={() => setActionNotice("")}>
            ×
          </button>
        </div>
      )}

      {/* Export History Dialog */}
      {historyModal && (
        <div className={s.modalOverlay} onClick={() => setHistoryModal(false)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Lịch sử Xuất Báo cáo</h3>
              <button
                type="button"
                className={s.modalClose}
                onClick={() => setHistoryModal(false)}
              >
                ×
              </button>
            </div>
            <div className={s.modalBody}>
              <p>Danh sách các báo cáo đã xuất trong 30 ngày qua:</p>
              <ul className={s.historyList}>
                <li>
                  <span>Báo cáo đơn hàng hoàn tất tháng 10/2026.csv</span>
                  <small>23/10/2026 14:20 · Thành công</small>
                </li>
                <li>
                  <span>Báo cáo vận chuyển SPX Express Q3/2026.csv</span>
                  <small>15/10/2026 09:12 · Thành công</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
