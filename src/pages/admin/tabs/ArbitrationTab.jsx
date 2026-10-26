import React, { useState } from "react";
import {
  Gavel,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  PackageCheck,
  AlertTriangle,
  FileText,
  User,
  Store,
  X,
  Sparkles
} from "lucide-react";
import adminService from "../../../services/adminService";
import s from "./Arbitration.module.css";
import modalS from "../TestControl.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n || 0);

const disputeReasonMap = {
  1: "Hàng hoàn trả về không đúng với sản phẩm đã bán",
  2: "Hàng hoàn về bị hư hại, trầy xước hoặc móp méo",
  3: "Hàng hoàn về thiếu linh phụ kiện, quà tặng kèm",
  4: "Bưu kiện hoàn về là hộp rỗng, không có sản phẩm",
  5: "Lý do khiếu nại khác từ Người Bán",
};

export default function ArbitrationTab({ returns = [], summary = {}, onRefresh, showToast }) {
  const [filter, setFilter] = useState("ALL");
  const [activeModal, setActiveModal] = useState(null); // { type: "details"|"review"|"inbound"|"arbitrate", item: ... }
  const [loadingAction, setLoadingAction] = useState(false);

  // Form states
  const [reviewAction, setReviewAction] = useState("APPROVE");
  const [reviewReason, setReviewReason] = useState("");
  const [inboundResult, setInboundResult] = useState("PASS");
  const [inboundNotes, setInboundNotes] = useState("");
  const [verdict, setVerdict] = useState("BUYER_WIN");
  const [compensationAmount, setCompensationAmount] = useState(0);
  const [rulingNotes, setRulingNotes] = useState("");

  const filteredReturns = returns.filter((r) => {
    if (filter === "ALL") return true;
    if (filter === "SELLER_DISPUTE") return r.status === "SELLER_DISPUTE";
    return r.status === filter;
  });

  const handleOpenReview = (item) => {
    setReviewAction("APPROVE");
    setReviewReason("");
    setActiveModal({ type: "review", item });
  };

  const handleOpenInbound = (item) => {
    setInboundResult("PASS");
    setInboundNotes("Hàng hoàn nguyên vẹn niêm phong, đủ điều kiện hoàn tiền.");
    setActiveModal({ type: "inbound", item });
  };

  const handleOpenArbitrate = (item) => {
    setVerdict("BUYER_WIN");
    setCompensationAmount(0);
    setRulingNotes("Trọng tài Shopee xét duyệt chứng cứ: Người mua cung cấp đầy đủ video bóc hàng.");
    setActiveModal({ type: "arbitrate", item });
  };

  const submitReview = async () => {
    if (!activeModal?.item) return;
    setLoadingAction(true);
    try {
      await adminService.reviewReturn(activeModal.item.return_sn, reviewAction, reviewReason);
      showToast(reviewAction === "APPROVE" ? "Đã phê duyệt yêu cầu trả hàng" : "Đã từ chối yêu cầu trả hàng");
      setActiveModal(null);
      onRefresh?.();
    } catch (err) {
      showToast(err.message || "Lỗi khi xét duyệt yêu cầu", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const submitInbound = async () => {
    if (!activeModal?.item) return;
    setLoadingAction(true);
    try {
      await adminService.warehouseInbound(activeModal.item.return_sn, inboundResult, inboundNotes);
      showToast(inboundResult === "PASS" ? "Nghiệm thu kho đạt! Đã kích hoạt hoàn tiền" : "Nghiệm thu thất bại! Đã hủy hoàn tiền");
      setActiveModal(null);
      onRefresh?.();
    } catch (err) {
      showToast(err.message || "Lỗi khi nghiệm thu kho", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const submitArbitrate = async () => {
    if (!activeModal?.item) return;
    setLoadingAction(true);
    try {
      await adminService.arbitrateDispute(
        activeModal.item.return_sn,
        verdict,
        compensationAmount,
        rulingNotes
      );
      showToast(verdict === "BUYER_WIN" ? "Phán quyết: Người Mua Thắng (Hoàn tiền)" : "Phán quyết: Người Bán Thắng (Giải ngân & Bồi thường)");
      setActiveModal(null);
      onRefresh?.();
    } catch (err) {
      showToast(err.message || "Lỗi khi đưa ra phán quyết", "error");
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "JUDGING":
        return <span className={`${s.badge} ${s.badgeJudging}`}>Chờ duyệt CS</span>;
      case "PROCESSING":
        return <span className={`${s.badge} ${s.badgeProcessing}`}>Chờ kho nghiệm thu</span>;
      case "SELLER_DISPUTE":
        return <span className={`${s.badge} ${s.badgeDispute}`}>Shop khiếu nại</span>;
      case "ACCEPTED":
        return <span className={`${s.badge} ${s.badgeAccepted}`}>Đã hoàn tiền</span>;
      case "CLOSED":
        return <span className={`${s.badge} ${s.badgeClosed}`}>Đã kết thúc</span>;
      case "REQUESTED":
      default:
        return <span className={`${s.badge} ${s.badgeRequested}`}>{status}</span>;
    }
  };

  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <div>
          <h2 className={s.cardTitle}>
            <Gavel size={18} color="#7b2cbf" />
            Cổng Trọng Tài & Nghiệm Thu Kho Shopee Platform
          </h2>
          <p className={s.cardDesc}>
            Giám định khiếu nại đổi trả, xử lý nghiệm thu bưu phẩm hoàn về kho, và ban hành phán quyết trọng tài chính thức.
          </p>
        </div>
        <button type="button" className={s.btnPrimary} onClick={onRefresh}>
          Làm mới danh sách
        </button>
      </div>

      {/* Sub Filters */}
      <div className={s.filterTabs}>
        {[
          { id: "ALL", label: `Tất cả vụ án (${summary.total || 0})` },
          { id: "JUDGING", label: `Chờ CS duyệt (${summary.judging || 0})` },
          { id: "PROCESSING", label: `Chờ kho nghiệm thu (${summary.processing || 0})` },
          { id: "SELLER_DISPUTE", label: `Shop khiếu nại (${summary.disputed || 0})` },
          { id: "ACCEPTED", label: `Đã hoàn tiền (${summary.accepted || 0})` },
          { id: "CLOSED", label: `Đã đóng (${summary.closed || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`${s.filterBtn} ${filter === tab.id ? s.activeFilter : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Mã Trả Hàng / Đơn Hàng</th>
              <th>Gian Hàng / Khách Hàng</th>
              <th>Lý Do Yêu Cầu</th>
              <th>Số Tiền Hoàn</th>
              <th>Trạng Thái</th>
              <th>Khiếu Nại Shop</th>
              <th style={{ textAlign: "right" }}>Thao Tác Trọng Tài</th>
            </tr>
          </thead>
          <tbody>
            {filteredReturns.length > 0 ? (
              filteredReturns.map((r) => (
                <tr key={r.return_sn}>
                  <td>
                    <div className={`${s.mono} ${s.bold}`}>{r.return_sn}</div>
                    <div className={s.mono} style={{ color: "#888", fontSize: 11 }}>
                      {r.order_sn}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Store size={12} color="#6b7280" />
                      <span>Shop #{r.shop_id}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#6b7280", fontSize: 11 }}>
                      <User size={12} />
                      <span>{r.buyer_username || `Buyer #${r.buyer_id}`}</span>
                    </div>
                  </td>
                  <td>
                    <div className={s.bold}>{r.reason}</div>
                    {r.text_reason && <div style={{ color: "#666", fontSize: 11 }}>{r.text_reason}</div>}
                  </td>
                  <td>
                    <div className={s.bold} style={{ color: "#ee4d2d" }}>
                      {money(r.refund_amount)}
                    </div>
                  </td>
                  <td>{getStatusBadge(r.status)}</td>
                  <td>
                    {r.status === "SELLER_DISPUTE" || r.dispute_reason_id ? (
                      <div>
                        <div style={{ color: "#dc2626", fontWeight: 700, fontSize: 11 }}>
                          {disputeReasonMap[r.dispute_reason_id] || r.dispute_reason || "Đang khiếu nại"}
                        </div>
                        {r.compensation_status && (
                          <div style={{ fontSize: 10, color: "#888" }}>
                            Bồi thường: {r.compensation_status}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#9ca3af" }}>—</span>
                    )}
                  </td>
                  <td>
                    <div className={s.actionsCell}>
                      <button
                        type="button"
                        className={s.btnSecondary}
                        onClick={() => setActiveModal({ type: "details", item: r })}
                        title="Xem chi tiết hồ sơ"
                      >
                        <Eye size={12} style={{ display: "inline", marginRight: 4 }} />
                        Hồ sơ
                      </button>

                      {r.status === "JUDGING" && (
                        <button
                          type="button"
                          className={s.btnPrimary}
                          onClick={() => handleOpenReview(r)}
                          title="Xét duyệt sơ bộ"
                        >
                          Duyệt CS
                        </button>
                      )}

                      {r.status === "PROCESSING" && (
                        <button
                          type="button"
                          className={s.btnSuccess}
                          onClick={() => handleOpenInbound(r)}
                          title="Nghiệm thu bưu phẩm kho"
                        >
                          <PackageCheck size={12} style={{ display: "inline", marginRight: 4 }} />
                          Kho nhận
                        </button>
                      )}

                      {r.status === "SELLER_DISPUTE" && (
                        <button
                          type="button"
                          className={s.btnDispute}
                          onClick={() => handleOpenArbitrate(r)}
                          title="Ban hành phán quyết trọng tài"
                        >
                          <Gavel size={12} style={{ display: "inline", marginRight: 4 }} />
                          Phán quyết
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className={s.emptyState}>
                  <RotateCcw size={32} strokeWidth={1.5} style={{ marginBottom: 8, display: "inline" }} />
                  <div>Không tìm thấy hồ sơ khiếu nại hoàn trả nào trong mục này.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Case Details */}
      {activeModal?.type === "details" && (
        <div className={modalS.modalBackdrop}>
          <div className={modalS.modalBox} style={{ maxWidth: 720 }}>
            <div className={modalS.modalHeader}>
              <h3 className={modalS.modalTitle}>
                Hồ Sơ Khiếu Nại Hoàn Trả: {activeModal.item.return_sn}
              </h3>
              <button type="button" className={modalS.modalCloseBtn} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={modalS.modalBody}>
              {/* Product Info */}
              <div className={s.detailSection}>
                <div className={s.sectionHeader}>
                  <FileText size={14} /> Sản phẩm trong yêu cầu hoàn trả
                </div>
                {(activeModal.item.items || []).map((it, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0" }}>
                    <span>
                      <strong>{it.item_name}</strong> {it.model_name ? `(${it.model_name})` : ""} x{it.quantity}
                    </span>
                    <span style={{ fontWeight: 700, color: "#ee4d2d" }}>{money(it.refund_amount || it.item_price)}</span>
                  </div>
                ))}
              </div>

              {/* Buyer Claim */}
              <div className={s.detailSection}>
                <div className={s.sectionHeader}>
                  <User size={14} /> Khiếu nại từ Người Mua
                </div>
                <div>Lý do: <strong>{activeModal.item.reason}</strong></div>
                {activeModal.item.text_reason && <div style={{ color: "#555", marginTop: 4 }}>"{activeModal.item.text_reason}"</div>}

                {/* Buyer Proofs */}
                {(() => {
                  const bProofs = (activeModal.item.proofs || []).filter((p) => p.uploader_type === "BUYER");
                  if (bProofs.length === 0) return null;
                  return (
                    <div className={s.proofGrid}>
                      {bProofs.map((p, idx) => (
                        <a key={idx} href={p.image_url} target="_blank" rel="noreferrer">
                          <img src={p.image_url} alt="Buyer proof" className={s.proofThumb} />
                        </a>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Seller Dispute */}
              {activeModal.item.dispute_reason_id && (
                <div className={s.detailSection} style={{ background: "#fff5f5", borderColor: "#fecaca" }}>
                  <div className={s.sectionHeader} style={{ color: "#b91c1c" }}>
                    <ShieldAlert size={14} /> Khiếu nại từ Người Bán (Shop #{activeModal.item.shop_id})
                  </div>
                  <div>Lý do: <strong>{disputeReasonMap[activeModal.item.dispute_reason_id] || `Mã ${activeModal.item.dispute_reason_id}`}</strong></div>
                  {activeModal.item.dispute_text_reason && <div style={{ color: "#7f1d1d", marginTop: 4 }}>"{activeModal.item.dispute_text_reason}"</div>}

                  {/* Seller Proofs */}
                  {(() => {
                    const sProofs = (activeModal.item.proofs || []).filter((p) => p.uploader_type === "SELLER");
                    if (sProofs.length === 0) return null;
                    return (
                      <div className={s.proofGrid}>
                        {sProofs.map((p, idx) => (
                          <div key={idx}>
                            {p.image_url.includes(".mp4") || p.image_url.includes("video") ? (
                              <video src={p.image_url} controls className={s.proofVideo} />
                            ) : (
                              <a href={p.image_url} target="_blank" rel="noreferrer">
                                <img src={p.image_url} alt="Seller proof" className={s.proofThumb} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Platform Ruling if any */}
              {activeModal.item.ruling_notes && (
                <div className={s.detailSection} style={{ background: "#faf5ff", borderColor: "#e9d5ff" }}>
                  <div className={s.sectionHeader} style={{ color: "#6b21a8" }}>
                    <Gavel size={14} /> Phán Quyết Trọng Tài Shopee Platform
                  </div>
                  <div style={{ color: "#4c1d95", fontWeight: 600 }}>{activeModal.item.ruling_notes}</div>
                </div>
              )}
            </div>
            <div className={modalS.modalFooter}>
              <button type="button" className={s.btnSecondary} onClick={() => setActiveModal(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CS Review (APPROVE / REJECT) */}
      {activeModal?.type === "review" && (
        <div className={modalS.modalBackdrop}>
          <div className={modalS.modalBox}>
            <div className={modalS.modalHeader}>
              <h3 className={modalS.modalTitle}>Xét Duyệt Sơ Bộ CS: {activeModal.item.return_sn}</h3>
              <button type="button" className={modalS.modalCloseBtn} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={modalS.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Quyết định xét duyệt *</label>
                <select
                  className={s.formSelect}
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                >
                  <option value="APPROVE">Chấp thuận yêu cầu trả hàng (APPROVE)</option>
                  <option value="REJECT">Bác bỏ yêu cầu trả hàng (REJECT)</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Lý do / Ghi chú của CS (Tùy chọn)</label>
                <textarea
                  className={s.formTextarea}
                  rows={3}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Nhập ghi chú xét duyệt sơ bộ..."
                />
              </div>
            </div>
            <div className={modalS.modalFooter}>
              <button type="button" className={s.btnSecondary} onClick={() => setActiveModal(null)}>
                Hủy
              </button>
              <button type="button" className={s.btnPrimary} onClick={submitReview} disabled={loadingAction}>
                {loadingAction ? "Đang xử lý..." : "Xác nhận quyết định"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Warehouse Inbound (PASS / FAIL) */}
      {activeModal?.type === "inbound" && (
        <div className={modalS.modalBackdrop}>
          <div className={modalS.modalBox}>
            <div className={modalS.modalHeader}>
              <h3 className={modalS.modalTitle}>Nghiệm Thu Hàng Hoàn Kho: {activeModal.item.return_sn}</h3>
              <button type="button" className={modalS.modalCloseBtn} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={modalS.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Kết quả kiểm tra bưu phẩm tại kho *</label>
                <select
                  className={s.formSelect}
                  value={inboundResult}
                  onChange={(e) => setInboundResult(e.target.value)}
                >
                  <option value="PASS">Nghiệm thu ĐẠT (PASS - Kích hoạt hoàn tiền cho người mua)</option>
                  <option value="FAIL">Nghiệm thu LỖI / SAI HÀNG (FAIL - Từ chối hoàn tiền)</option>
                </select>
              </div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Biên bản kiểm tra kho</label>
                <textarea
                  className={s.formTextarea}
                  rows={3}
                  value={inboundNotes}
                  onChange={(e) => setInboundNotes(e.target.value)}
                  placeholder="Ghi nhận tình trạng ngoại quan sản phẩm..."
                />
              </div>
            </div>
            <div className={modalS.modalFooter}>
              <button type="button" className={s.btnSecondary} onClick={() => setActiveModal(null)}>
                Hủy
              </button>
              <button type="button" className={s.btnSuccess} onClick={submitInbound} disabled={loadingAction}>
                {loadingAction ? "Đang xử lý..." : "Lưu biên bản nghiệm thu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Arbitrate Dispute (GAVEL) */}
      {activeModal?.type === "arbitrate" && (
        <div className={modalS.modalBackdrop}>
          <div className={modalS.modalBox}>
            <div className={modalS.modalHeader}>
              <h3 className={modalS.modalTitle}>
                <Gavel size={18} color="#7b2cbf" style={{ display: "inline", marginRight: 6 }} />
                Phán Quyết Trọng Tài Shopee: {activeModal.item.return_sn}
              </h3>
              <button type="button" className={modalS.modalCloseBtn} onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={modalS.modalBody}>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Phán quyết bên thắng kiện *</label>
                <select
                  className={s.formSelect}
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                >
                  <option value="BUYER_WIN">Người Mua Thắng (BUYER_WIN - Hoàn lại tiền cho khách hàng)</option>
                  <option value="SELLER_WIN">Người Bán Thắng (SELLER_WIN - Giải ngân đơn hàng & bồi thường shop)</option>
                </select>
              </div>

              {verdict === "SELLER_WIN" && (
                <div className={s.formGroup}>
                  <label className={s.formLabel}>Số tiền sàn Shopee bồi thường cho Người Bán (VND)</label>
                  <input
                    type="number"
                    className={s.formInput}
                    value={compensationAmount}
                    onChange={(e) => setCompensationAmount(Number(e.target.value))}
                    min={0}
                    step={10000}
                  />
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                    Số tiền bồi thường thiệt hại hàng hoàn hỏng/mất mát do lỗi vận chuyển hoặc người mua.
                  </div>
                </div>
              )}

              <div className={s.formGroup}>
                <label className={s.formLabel}>Căn cứ phán quyết trọng tài (Ruling Notes) *</label>
                <textarea
                  className={s.formTextarea}
                  rows={4}
                  value={rulingNotes}
                  onChange={(e) => setRulingNotes(e.target.value)}
                  placeholder="Ghi rõ căn cứ phân giải dựa trên bằng chứng video bóc hàng của các bên..."
                />
              </div>
            </div>
            <div className={modalS.modalFooter}>
              <button type="button" className={s.btnSecondary} onClick={() => setActiveModal(null)}>
                Hủy
              </button>
              <button
                type="button"
                className={s.btnDispute}
                onClick={submitArbitrate}
                disabled={loadingAction || !rulingNotes.trim()}
              >
                {loadingAction ? "Đang ban hành..." : "Ban hành phán quyết chính thức"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
