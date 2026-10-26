import React from "react";
import { X } from "lucide-react";
import styles from "./VoucherDetailModal.module.css";

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

const USECASE_NAMES = {
  1: "Mã giảm giá toàn Shop",
  2: "Voucher sản phẩm",
  3: "Voucher Khách hàng mới",
  4: "Voucher Khách hàng mua lại",
  5: "Voucher riêng tư",
  6: "Voucher Shopee Live",
  7: "Voucher Shopee Video",
  9: "Voucher Ưu Đãi Follower",
};

export default function VoucherDetailModal({ isOpen, voucher, onClose }) {
  if (!isOpen || !voucher) return null;

  const isPercent = voucher.discount_percentage > 0;
  const statusClass =
    voucher.status === "ongoing"
      ? styles.statusOngoing
      : voucher.status === "upcoming"
      ? styles.statusUpcoming
      : styles.statusExpired;

  const statusLabel =
    voucher.status === "ongoing"
      ? "Đang diễn ra"
      : voucher.status === "upcoming"
      ? "Sắp diễn ra"
      : "Đã kết thúc";

  const targetLabel =
    voucher.usecase === 3
      ? "Khách hàng mới (chưa từng mua tại Shop)"
      : voucher.usecase === 4
      ? `Khách hàng mua lại (${voucher.target_voucher === 3 ? "Đã có 2+ đơn hàng" : "Đã có 1 đơn hàng"})`
      : voucher.usecase === 9
      ? "Người theo dõi mới (Followers)"
      : "Tất cả Người mua";

  const channelLabel =
    voucher.usecase === 5
      ? "Chia sẻ thông qua mã Voucher (Riêng tư)"
      : voucher.usecase === 6
      ? "Shopee Live"
      : voucher.usecase === 7
      ? "Shopee Video"
      : voucher.usecase === 9
      ? "Tự động gửi khi theo dõi Shop"
      : voucher.display_channel_list && voucher.display_channel_list.length === 0
      ? "Chia sẻ thông qua mã Voucher"
      : "Hiển thị nhiều nơi";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3>Chi tiết mã giảm giá</h3>
            <span className={`${styles.badge} ${statusClass}`}>{statusLabel}</span>
          </div>
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
          {/* Section 1: Thông tin cơ bản */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>1. Thông tin cơ bản</div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Tên chương trình:</span>
                <span className={styles.value}>{voucher.voucher_name}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Mã voucher:</span>
                <span className={styles.value} style={{ color: "#ee4d2d", fontWeight: 700 }}>
                  {voucher.voucher_code}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Loại mã giảm giá:</span>
                <span className={styles.value}>{USECASE_NAMES[voucher.usecase] || `Loại ${voucher.usecase}`}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Đối tượng người mua:</span>
                <span className={styles.value}>{targetLabel}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>{voucher.usecase === 9 ? "Thời hạn nhận Voucher:" : "Thời gian sử dụng:"}</span>
                <span className={styles.value}>
                  {formatTimestamp(voucher.start_time)} – {formatTimestamp(voucher.end_time)}
                </span>
              </div>
              {voucher.usecase === 9 ? (
                <div className={styles.field}>
                  <span className={styles.label}>Ngày Hết hạn:</span>
                  <span className={styles.value}>
                    7 ngày kể từ lúc Voucher được lưu vào Kho Voucher
                  </span>
                </div>
              ) : (
                <div className={styles.field}>
                  <span className={styles.label}>Lưu mã sớm:</span>
                  <span className={styles.value}>
                    {voucher.display_timing ? "Cho phép lưu trước khi sử dụng" : "Không áp dụng"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Thiết lập giảm giá */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>2. Thiết lập giảm giá</div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Loại ưu đãi:</span>
                <span className={styles.value}>
                  {voucher.reward_type === 3 ? "Hoàn Xu" : "Khuyến Mãi (Giảm trực tiếp)"}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Mức giảm:</span>
                <span className={styles.value} style={{ color: "#ee4d2d", fontWeight: 700 }}>
                  {isPercent
                    ? `Giảm ${voucher.discount_percentage}% ${
                        voucher.max_price > 0 ? `(Tối đa ${formatMoney(voucher.max_price)})` : "(Không giới hạn)"
                      }`
                    : `Giảm ${formatMoney(voucher.discount_amount)}`}
                </span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Giá trị đơn hàng tối thiểu:</span>
                <span className={styles.value}>{formatMoney(voucher.min_basket_price)}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Tổng lượt sử dụng tối đa:</span>
                <span className={styles.value}>{voucher.usage_quantity || "—"}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Đã sử dụng:</span>
                <span className={styles.value}>{voucher.current_usage || 0} lượt</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Lượt dùng tối đa/Người mua:</span>
                <span className={styles.value}>{voucher.max_distribution_per_buyer || 1} lượt</span>
              </div>
            </div>
          </div>

          {/* Section 3: Hiển thị & Sản phẩm áp dụng */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>3. Hiển thị & Sản phẩm áp dụng</div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Kênh hiển thị:</span>
                <span className={styles.value}>{channelLabel}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.label}>Phạm vi áp dụng:</span>
                <span className={styles.value}>
                  {voucher.usecase === 2
                    ? `Áp dụng cho ${voucher.item_count || voucher.items?.length || 0} sản phẩm`
                    : "Tất cả sản phẩm trong Shop"}
                </span>
              </div>
            </div>

            {voucher.usecase === 2 && voucher.items && voucher.items.length > 0 && (
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ width: 120 }}>Giá bán</th>
                    <th style={{ width: 100 }}>Kho hàng</th>
                  </tr>
                </thead>
                <tbody>
                  {voucher.items.map((it) => (
                    <tr key={it.item_id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {it.image && (
                            <img
                              src={it.image}
                              alt=""
                              style={{ width: 32, height: 32, objectFit: "cover", borderRadius: 4 }}
                            />
                          )}
                          <div>
                            <div>{it.item_name}</div>
                            <small style={{ color: "#888" }}>Mã: {it.item_id}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "#ee4d2d", fontWeight: 600 }}>{formatMoney(it.price)}</td>
                      <td>{it.stock ?? 50}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
