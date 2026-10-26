import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import sellerService from "../../../services/sellerService";
import styles from "./VoucherOrdersModal.module.css";

const formatMoney = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  const date = new Date(ts * 1000);
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusBadge = (status) => {
  switch (status) {
    case "COMPLETED":
      return <span className={`${styles.badge} ${styles.badgeCompleted}`}>Đã hoàn thành</span>;
    case "READY_TO_SHIP":
    case "PROCESSED":
      return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ giao hàng</span>;
    case "SHIPPED":
      return <span className={`${styles.badge} ${styles.badgePending}`}>Đang giao</span>;
    case "CANCELLED":
      return <span className={`${styles.badge} ${styles.badgeCancelled}`}>Đã hủy</span>;
    case "TO_CONFIRM_RECEIVE":
      return <span className={`${styles.badge} ${styles.badgePending}`}>Chờ nhận hàng</span>;
    default:
      return <span className={styles.badge}>{status}</span>;
  }
};

export default function VoucherOrdersModal({ isOpen, shopId, voucherCode, onClose }) {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!isOpen || !voucherCode) return;
    setLoading(true);

    sellerService
      .getVoucherOrders(shopId, voucherCode)
      .then((res) => {
        setOrders(res.orders || []);
        setTotal(res.total || 0);
      })
      .catch((err) => {
        console.error("Failed to load voucher orders:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, shopId, voucherCode]);

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Đơn hàng sử dụng mã: {voucherCode}</h3>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.summaryBar}>
            Tổng số đơn hàng đã áp dụng mã: <strong>{total}</strong>
          </div>

          {loading ? (
            <div className={styles.loadingState}>Đang tải danh sách đơn hàng...</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>Chưa có đơn hàng nào áp dụng mã giảm giá này.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Người mua</th>
                  <th>Thời gian đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.order_sn}>
                    <td className={styles.orderSn}>{o.order_sn}</td>
                    <td>{o.buyer_username || "—"}</td>
                    <td>{formatTimestamp(o.create_time)}</td>
                    <td className={styles.amount}>{formatMoney(o.total_amount)}</td>
                    <td>{getStatusBadge(o.order_status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeModalBtn} onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
