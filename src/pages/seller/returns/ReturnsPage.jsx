import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Package,
  Copy,
  Check,
  User,
  Truck,
  ShieldAlert,
  AlertCircle,
  Clock,
  ArrowUpDown,
  SlidersHorizontal,
  Upload,
  CheckCircle2,
} from "lucide-react";
import api from "../../../services/api";
import SellerPagination from "../SellerPagination";
import s from "./ReturnsPage.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const PRIORITY_FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "exp_1d", label: "Hết hạn trong 1 ngày" },
  { id: "exp_2d", label: "Hết hạn trong 2 ngày" },
];

const IMPORTANT_ACTIONS = [
  { id: "negotiate", label: "Thương lượng với Người mua" },
  { id: "provide_proof", label: "Cần cung cấp bằng chứng" },
  { id: "hold_package", label: "Giữ lại kiện hàng" },
  { id: "check_return", label: "Kiểm tra hàng hoàn" },
  { id: "respond_ruling", label: "Phản hồi quyết định hoàn tiền của Shopee" },
];

const STATUS_MAP = {
  REQUESTED: { label: "Chờ Người bán phản hồi", color: "#fa8c16", bg: "#fff7e6" },
  JUDGING: { label: "Shopee đang xem xét", color: "#1890ff", bg: "#e6f7ff" },
  PROCESSING: { label: "Đang xử lý đổi/trả", color: "#13c2c2", bg: "#e6fffb" },
  SELLER_DISPUTE: { label: "Người bán khiếu nại", color: "#fa541c", bg: "#fff2e8" },
  ACCEPTED: { label: "Chấp nhận hoàn tiền", color: "#52c41a", bg: "#f6ffed" },
  CANCELLED: { label: "Người mua đã hủy", color: "#8c8c8c", bg: "#f5f5f5" },
  CLOSED: { label: "Đã đóng khiếu nại", color: "#595959", bg: "#f0f0f0" },
};

const REASON_LABELS = {
  DAMAGED_FAULTY: "Hàng bị hư hỏng / bể vỡ",
  NOT_RECEIVED: "Chưa nhận được hàng",
  CHANGE_OF_MIND: "Đổi ý, không có nhu cầu",
  WRONG_ITEM: "Giao sai sản phẩm / phân loại",
  COUNTERFEIT: "Nghi ngờ hàng giả / nhái",
  MISSING_ITEMS: "Thiếu phụ kiện / quà tặng",
};

export default function ReturnsPage({ shopId = 727720655 }) {
  const [params] = useSearchParams();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedAction, setSelectedAction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [operationFilter, setOperationFilter] = useState("ALL");
  const [appliedFilters, setAppliedFilters] = useState({
    query: "",
    operation: "ALL",
  });

  const [sortBy, setSortBy] = useState("created_desc");
  const [copiedSn, setCopiedSn] = useState("");
  const [toastNotice, setToastNotice] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when priority or action filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriority, selectedAction]);

  // Dispute Modal
  const [disputeModal, setDisputeModal] = useState(null); // return object
  const [disputeReason, setDisputeReason] = useState("");

  // Proof Modal
  const [proofModal, setProofModal] = useState(null); // return object
  const [proofComment, setProofComment] = useState("");

  const loadReturns = () => {
    setLoading(true);
    api
      .get(`/simulator/returns?shop_id=${shopId}`)
      .then((res) => {
        setReturns(res.returns || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReturns();
  }, [shopId]);

  // Apply filters
  const handleSearch = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    setAppliedFilters({
      query: searchQuery.trim(),
      operation: operationFilter,
    });
  };

  const handleReset = () => {
    setCurrentPage(1);
    setSearchQuery("");
    setOperationFilter("ALL");
    setSelectedPriority("all");
    setSelectedAction("");
    setAppliedFilters({ query: "", operation: "ALL" });
  };

  // Filtered dataset
  const filteredReturns = useMemo(() => {
    return returns
      .filter((r) => {
        // Priority deadline
        if (selectedPriority === "exp_1d" && r.due_date) {
          const now = Date.now() / 1000;
          if (r.due_date - now > 86400 || r.due_date < now) return false;
        } else if (selectedPriority === "exp_2d" && r.due_date) {
          const now = Date.now() / 1000;
          if (r.due_date - now > 172800 || r.due_date < now) return false;
        }

        // Action filter
        if (selectedAction === "provide_proof" && r.seller_proof_status !== "PENDING") {
          return false;
        } else if (selectedAction === "negotiate" && r.negotiation_status !== "PENDING") {
          return false;
        } else if (selectedAction === "check_return" && !r.reverse_tracking_number) {
          return false;
        }

        // Operation filter
        if (appliedFilters.operation !== "ALL") {
          if (appliedFilters.operation === "REFUND_ONLY" && r.solution !== "REFUND") return false;
          if (appliedFilters.operation === "RETURN_REFUND" && r.solution !== "RETURN_REFUND")
            return false;
        }

        // Text query
        if (appliedFilters.query) {
          const q = appliedFilters.query.toLowerCase();
          const matchRet = r.return_sn?.toLowerCase().includes(q);
          const matchOrd = r.order_sn?.toLowerCase().includes(q);
          const matchBuyer = r.buyer_username?.toLowerCase().includes(q);
          const matchTrack = r.reverse_tracking_number?.toLowerCase().includes(q);
          if (!matchRet && !matchOrd && !matchBuyer && !matchTrack) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "amount_desc") return (b.refund_amount || 0) - (a.refund_amount || 0);
        if (sortBy === "amount_asc") return (a.refund_amount || 0) - (b.refund_amount || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [returns, selectedPriority, selectedAction, appliedFilters, sortBy]);

  // Paginated slice for current page
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, currentPage, pageSize]);

  // Copy order SN
  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedSn(text);
    setTimeout(() => setCopiedSn(""), 2000);
  };

  // Seller confirm refund
  const handleConfirmRefund = async (returnSn) => {
    try {
      await api.post("/simulator/returns/seller_confirm", {
        return_sn: returnSn,
        shop_id: shopId,
      });
      setToastNotice(`Đã chấp thuận hoàn tiền cho yêu cầu #${returnSn}`);
      loadReturns();
    } catch (err) {
      setToastNotice(err.message || "Xác nhận hoàn tiền thất bại.");
    }
  };

  // Seller submit dispute
  const handleSubmitDispute = async () => {
    if (!disputeModal || !disputeReason) return;
    try {
      await api.post("/simulator/returns/seller_dispute", {
        return_sn: disputeModal.return_sn,
        shop_id: shopId,
        dispute_reason_id: 47,
        dispute_text_reason: disputeReason,
      });
      setToastNotice(`Đã gửi khiếu nại thành công cho yêu cầu #${disputeModal.return_sn}`);
      setDisputeModal(null);
      setDisputeReason("");
      loadReturns();
    } catch (err) {
      setToastNotice(err.message || "Gửi khiếu nại thất bại.");
    }
  };

  // Seller upload proof
  const handleSubmitProof = async () => {
    if (!proofModal) return;
    try {
      await api.post("/simulator/returns/seller_upload_proof", {
        return_sn: proofModal.return_sn,
        shop_id: shopId,
        comment: proofComment || "Bằng chứng người bán cung cấp",
        image_url: "https://cf.shopee.vn/file/seller_evidence.jpg",
      });
      setToastNotice(`Đã tải lên bằng chứng thành công!`);
      setProofModal(null);
      setProofComment("");
      loadReturns();
    } catch (err) {
      setToastNotice(err.message || "Không thể tải lên bằng chứng.");
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = [
      "Mã yêu cầu",
      "Mã đơn hàng",
      "Người mua",
      "Số tiền hoàn",
      "Lý do",
      "Trạng thái",
      "Phương án",
      "Ngày tạo",
    ];
    const rows = filteredReturns.map((r) => [
      r.return_sn,
      r.order_sn,
      r.buyer_username,
      r.refund_amount,
      REASON_LABELS[r.reason] || r.reason,
      STATUS_MAP[r.status]?.label || r.status,
      r.solution === "REFUND" ? "Hoàn tiền ngay" : "Trả hàng và Hoàn tiền",
      new Date(r.created_at).toLocaleString("vi-VN"),
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shopee_returns_${Date.now()}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className={s.pageWrapper}>
      {/* 1. Priority Filters */}
      <div className={s.priorityRow}>
        <span className={s.priorityLabel}>Ưu tiên</span>
        <div className={s.pillList}>
          {PRIORITY_FILTERS.map((p) => {
            const isSelected = selectedPriority === p.id;
            return (
              <button
                key={p.id}
                type="button"
                className={`${s.pillBtn} ${isSelected ? s.pillActive : ""}`}
                onClick={() => setSelectedPriority(p.id)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Important-Action Filters */}
      <div className={s.actionFiltersRow}>
        <span className={s.actionSectionLabel}>HÀNH ĐỘNG QUAN TRỌNG</span>
        <div className={s.pillList}>
          {IMPORTANT_ACTIONS.map((a) => {
            const isSelected = selectedAction === a.id;
            return (
              <button
                key={a.id}
                type="button"
                className={`${s.pillBtn} ${isSelected ? s.pillActive : ""}`}
                onClick={() => setSelectedAction(isSelected ? "" : a.id)}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={s.sectionDivider} />

      {/* 3. Search and Filter Toolbar */}
      <form className={s.searchToolbar} onSubmit={handleSearch}>
        <div className={s.searchInputWrap}>
          <span className={s.searchPreLabel}>Tìm yêu cầu</span>
          <input
            type="text"
            className={s.searchInput}
            placeholder="Điền Mã yêu cầu trả hàng/ Mã đơn hàng/ Mã vận đơn hàng hoàn/ Tài khoản Người mua..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={16} className={s.searchIcon} />
        </div>

        <div className={s.operationFilterWrap}>
          <label className={s.opLabel}>Toàn bộ thao tác</label>
          <select
            className={s.opSelect}
            value={operationFilter}
            onChange={(e) => setOperationFilter(e.target.value)}
          >
            <option value="ALL">Vui lòng chọn</option>
            <option value="REFUND_ONLY">Chỉ hoàn tiền</option>
            <option value="RETURN_REFUND">Trả hàng & Hoàn tiền</option>
          </select>
        </div>

        <div className={s.searchButtons}>
          <button type="submit" className={s.btnSearch}>
            Tìm kiếm
          </button>
          <button type="button" className={s.btnReset} onClick={handleReset}>
            Đặt lại
          </button>
        </div>
      </form>

      {/* 4. Results Header & Actions */}
      <div className={s.resultsHeader}>
        <span className={s.resultCountBold}>
          {loading ? "Đang tải..." : `${filteredReturns.length} Yêu cầu`}
        </span>

        <div className={s.tableToolActions}>
          <div className={s.sortControlWrap}>
            <span className={s.sortLabel}>
              <ArrowUpDown size={14} /> Sắp xếp theo:
            </span>
            <select
              className={s.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_desc">Thời gian tạo mới nhất</option>
              <option value="amount_desc">Số tiền hoàn cao nhất</option>
              <option value="amount_asc">Số tiền hoàn thấp nhất</option>
            </select>
          </div>

          <button
            type="button"
            className={s.btnExport}
            onClick={handleExport}
            title="Xuất danh sách yêu cầu"
          >
            <FileSpreadsheet size={15} /> Export
          </button>
        </div>
      </div>

      {/* 5. Returns Table */}
      <div className={s.tableContainer}>
        <table className={s.returnsTable}>
          <thead>
            <tr>
              <th style={{ width: "22%" }}>Sản phẩm</th>
              <th style={{ width: "12%" }}>Số tiền hoàn cho Người mua</th>
              <th style={{ width: "12%" }}>Số tiền bồi thường cho Người bán</th>
              <th style={{ width: "12%" }}>Lý do</th>
              <th style={{ width: "12%" }}>Lý do điều chỉnh bởi Shopee</th>
              <th style={{ width: "10%" }}>Phương án cho Người mua</th>
              <th style={{ width: "10%" }}>Trạng thái</th>
              <th style={{ width: "10%" }}>Vận chuyển</th>
              <th style={{ width: "10%" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReturns.map((r) => {
              const statusMeta = STATUS_MAP[r.status] || {
                label: r.status,
                color: "#595959",
                bg: "#f5f5f5",
              };
              const reasonText = REASON_LABELS[r.reason] || r.reason;
              const isCopied = copiedSn === r.order_sn;

              return (
                <React.Fragment key={r.return_sn}>
                  {/* Grouped Request Header Row */}
                  <tr className={s.requestHeaderRow}>
                    <td colSpan={9}>
                      <div className={s.requestHeaderContent}>
                        <div className={s.buyerBadge}>
                          <div className={s.avatarSmall}>
                            <User size={13} />
                          </div>
                          <span className={s.buyerName}>{r.buyer_username}</span>
                        </div>

                        <span className={s.verticalBar}>|</span>

                        <div className={s.orderSnWrap}>
                          <span className={s.orderSnLabel}>Mã đơn hàng:</span>
                          <span className={s.orderSnVal}>{r.order_sn}</span>
                          <button
                            type="button"
                            className={s.btnCopy}
                            title="Sao chép mã đơn hàng"
                            onClick={() => handleCopy(r.order_sn)}
                          >
                            {isCopied ? <Check size={12} color="#52c41a" /> : <Copy size={12} />}
                          </button>
                        </div>

                        <span className={s.returnSnMeta}>
                          Mã yêu cầu: <strong>{r.return_sn}</strong>
                        </span>

                        <span className={s.requestDate}>
                          {new Date(r.created_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Grouped Request Details Row */}
                  <tr className={s.requestDataRow}>
                    {/* Sản phẩm */}
                    <td className={s.prodCell}>
                      {r.items && r.items.length > 0 ? (
                        <div className={s.itemsWrap}>
                          {r.items.map((it, idx) => (
                            <div key={idx} className={s.prodItem}>
                              <div className={s.prodThumb}>
                                <Package size={22} color="#bfbfbf" />
                              </div>
                              <div className={s.prodInfo}>
                                <span className={s.prodName}>{it.item_name}</span>
                                {it.model_name && (
                                  <span className={s.modelName}>Phân loại: {it.model_name}</span>
                                )}
                                <span className={s.prodQty}>x{it.quantity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={s.prodItem}>
                          <div className={s.prodThumb}>
                            <Package size={22} color="#bfbfbf" />
                          </div>
                          <div className={s.prodInfo}>
                            <span className={s.prodName}>Sản phẩm yêu cầu trả hàng</span>
                            <span className={s.prodQty}>x1</span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Số tiền hoàn cho Người mua */}
                    <td className={s.amountCell}>
                      <span className={s.refundAmount}>{money(r.refund_amount)}</span>
                      {r.offer_amount && (
                        <small className={s.offerText}>Đề xuất: {money(r.offer_amount)}</small>
                      )}
                    </td>

                    {/* Số tiền bồi thường cho Người bán */}
                    <td className={s.amountCell}>
                      {r.compensation_status === "COMPENSATION_APPROVED" ? (
                        <span className={s.compAmount}>{money(r.refund_amount)}</span>
                      ) : (
                        <span className={s.noComp}>—</span>
                      )}
                    </td>

                    {/* Lý do */}
                    <td className={s.reasonCell}>
                      <span className={s.reasonTitle}>{reasonText}</span>
                      {r.textReason && <p className={s.reasonDetail}>{r.textReason}</p>}
                    </td>

                    {/* Lý do điều chỉnh bởi Shopee */}
                    <td className={s.rulingCell}>
                      {r.ruling_notes ? (
                        <span className={s.rulingNotes}>{r.rulingNotes}</span>
                      ) : r.dispute_text_reason ? (
                        <span className={s.rulingNotes}>{r.dispute_text_reason}</span>
                      ) : (
                        <span className={s.noRuling}>—</span>
                      )}
                    </td>

                    {/* Phương án cho Người mua */}
                    <td className={s.solutionCell}>
                      <span className={s.solutionBadge}>
                        {r.solution === "REFUND" ? "Hoàn tiền ngay" : "Trả hàng & Hoàn tiền"}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className={s.statusCell}>
                      <span
                        className={s.statusPill}
                        style={{ color: statusMeta.color, backgroundColor: statusMeta.bg }}
                      >
                        {statusMeta.label}
                      </span>
                    </td>

                    {/* Vận chuyển */}
                    <td className={s.logisticsCell}>
                      {r.reverse_tracking_number ? (
                        <div className={s.trackingWrap}>
                          <Truck size={13} color="#1890ff" />
                          <span className={s.trackingNum}>{r.reverse_tracking_number}</span>
                        </div>
                      ) : (
                        <span className={s.noLogistics}>Không cần gửi hàng</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className={s.actionCell}>
                      <div className={s.actionStack}>
                        {r.status === "REQUESTED" && (
                          <button
                            type="button"
                            className={s.btnPrimaryAction}
                            onClick={() => handleConfirmRefund(r.return_sn)}
                          >
                            Đồng ý hoàn tiền
                          </button>
                        )}

                        {r.status === "REQUESTED" && (
                          <button
                            type="button"
                            className={s.btnDisputeAction}
                            onClick={() => setDisputeModal(r)}
                          >
                            Khiếu nại
                          </button>
                        )}

                        {r.status === "SELLER_DISPUTE" && r.seller_proof_status !== "UPLOADED" && (
                          <button
                            type="button"
                            className={s.btnProofAction}
                            onClick={() => setProofModal(r)}
                          >
                            <Upload size={12} /> Bổ sung bằng chứng
                          </button>
                        )}

                        {r.status === "ACCEPTED" && (
                          <span className={s.acceptedNote}>Đã giải ngân</span>
                        )}

                        {r.status === "CLOSED" && <span className={s.closedNote}>Đã xong</span>}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {!loading && filteredReturns.length === 0 && (
          <div className={s.emptyState}>
            <Package size={52} strokeWidth={1.2} color="#bfbfbf" />
            <p className={s.emptyMessage}>Không tìm thấy yêu cầu Trả hàng / Hoàn tiền nào.</p>
          </div>
        )}
      </div>

      {/* 6. Pagination */}
      <SellerPagination
        currentPage={currentPage}
        totalItems={filteredReturns.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {/* Dispute Modal */}
      {disputeModal && (
        <div className={s.modalOverlay} onClick={() => setDisputeModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Gửi khiếu nại tới Shopee</h3>
              <button
                type="button"
                className={s.modalClose}
                onClick={() => setDisputeModal(null)}
              >
                ×
              </button>
            </div>
            <div className={s.modalBody}>
              <p>
                Mã yêu cầu: <strong>{disputeModal.return_sn}</strong>
              </p>
              <label className={s.fieldLabel}>Lý do khiếu nại:</label>
              <textarea
                className={s.disputeTextarea}
                rows={4}
                placeholder="Nêu rõ lý do từ chối yêu cầu và bằng chứng đóng gói của Shop..."
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.btnCancel}
                onClick={() => setDisputeModal(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={s.btnConfirm}
                onClick={handleSubmitDispute}
                disabled={!disputeReason.trim()}
              >
                Gửi khiếu nại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {proofModal && (
        <div className={s.modalOverlay} onClick={() => setProofModal(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <h3>Cung cấp bằng chứng bổ sung</h3>
              <button
                type="button"
                className={s.modalClose}
                onClick={() => setProofModal(null)}
              >
                ×
              </button>
            </div>
            <div className={s.modalBody}>
              <p>
                Yêu cầu: <strong>{proofModal.return_sn}</strong>
              </p>
              <label className={s.fieldLabel}>Ghi chú giải trình:</label>
              <input
                type="text"
                className={s.proofInput}
                placeholder="Ảnh đóng hàng nguyên vẹn, video quay gửi bưu tá..."
                value={proofComment}
                onChange={(e) => setProofComment(e.target.value)}
              />
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.btnCancel}
                onClick={() => setProofModal(null)}
              >
                Hủy
              </button>
              <button type="button" className={s.btnConfirm} onClick={handleSubmitProof}>
                Tải lên
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notice */}
      {toastNotice && (
        <div className={s.toast}>
          <CheckCircle2 size={16} color="#52c41a" />
          <span>{toastNotice}</span>
          <button type="button" className={s.toastClose} onClick={() => setToastNotice("")}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
