import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Search, Star } from "lucide-react";
import sellerService from "../../../services/sellerService";
import styles from "./ReviewsPage.module.css";

const PAGE_SIZE = 10;
const STATUS_FILTERS = [
  ["ALL", "Tất cả", "all"],
  ["NEED_REPLY", "Cần phản hồi", "need_reply"],
  ["REPLIED", "Đã trả lời", "replied"],
];
const RATING_FILTERS = [5, 4, 3, 2, 1];
const EMPTY_COUNTS = { all: 0, need_reply: 0, replied: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

function formatDate(seconds) {
  if (!seconds) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(seconds * 1000));
}

function formatPeriod(period) {
  if (!period?.current_from || !period?.current_to) return "30 ngày gần nhất";
  const formatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${formatter.format(new Date(period.current_from * 1000))} – ${formatter.format(new Date(period.current_to * 1000))}`;
}

function StarRating({ value }) {
  return <span className={styles.stars} aria-label={`${value} sao`}>{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill={star <= value ? "currentColor" : "none"} />)}</span>;
}

function Metric({ title, metric, suffix = "", info }) {
  const value = metric?.value;
  const change = metric?.change_percent;
  const direction = change === null || change === undefined ? "neutral" : change >= 0 ? "up" : "down";
  return <div className={styles.metric}>
    <div className={styles.metricLabel}>{title} <span title={info} aria-label={info}>ⓘ</span></div>
    <strong>{value === null || value === undefined ? "—" : `${Number(value).toFixed(title.includes("Tổng") ? 0 : 2)}${suffix}`}</strong>
    <div className={styles.metricCompare}>Kỳ trước: {metric?.previous === null || metric?.previous === undefined ? "—" : `${Number(metric.previous).toFixed(title.includes("Tổng") ? 0 : 2)}${suffix}`}</div>
    <div className={`${styles.metricChange} ${styles[direction]}`}>{change === null || change === undefined ? "—" : `${change > 0 ? "+" : ""}${Number(change).toFixed(2)}%`}</div>
  </div>;
}

export default function ReviewsPage({ shopId }) {
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [previousVisitAt, setPreviousVisitAt] = useState(null);
  const [status, setStatus] = useState("ALL");
  const [stars, setStars] = useState([]);
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dateDraft, setDateDraft] = useState({ from: "", to: "" });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [cursor, setCursor] = useState(0);
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [pagination, setPagination] = useState({ total_count: 0, more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replying, setReplying] = useState(null);
  const [replyError, setReplyError] = useState("");
  const requestNumber = useRef(0);
  const activeShopId = Number(shopId) || 727720655;

  useEffect(() => {
    let alive = true;
    const key = `shopiz-review-last-visit-${activeShopId}`;
    const previousVisit = previousVisitAt ?? (Number(localStorage.getItem(key)) || null);
    setPreviousVisitAt(previousVisit);
    setSummaryError("");
    const now = Math.floor(Date.now() / 1000);
    sellerService.getReviewSummary(activeShopId, previousVisit)
      .then((data) => { if (alive) setSummary(data); })
      .catch((err) => { if (alive) setSummaryError(err.message || "Không thể tải tổng quan đánh giá."); })
      .finally(() => { localStorage.setItem(key, String(now)); });
    return () => { alive = false; };
  }, [activeShopId, refresh]);

  useEffect(() => {
    const id = ++requestNumber.current;
    setLoading(true);
    setError("");
    sellerService.getReviews(activeShopId, {
      pageSize: PAGE_SIZE, cursor, status, ratings: stars,
      keyword, dateFrom: dateRange.from, dateTo: dateRange.to,
    }).then((data) => {
      if (requestNumber.current !== id) return;
      setList(data.reviews || []);
      setCounts(data.counts || EMPTY_COUNTS);
      setPagination(data.pagination || { total_count: 0, more: false });
    }).catch((err) => {
      if (requestNumber.current === id) setError(err.message || "Không thể tải danh sách đánh giá.");
    }).finally(() => { if (requestNumber.current === id) setLoading(false); });
  }, [activeShopId, cursor, status, stars, keyword, dateRange, refresh]);

  const submitSearch = useCallback((event) => {
    event.preventDefault();
    if (dateDraft.from && dateDraft.to && dateDraft.from > dateDraft.to) {
      setError("Ngày bắt đầu không thể sau ngày kết thúc.");
      return;
    }
    setKeyword(keywordDraft.trim());
    setDateRange({
      from: dateDraft.from ? new Date(`${dateDraft.from}T00:00:00`).toISOString() : "",
      to: dateDraft.to ? new Date(`${dateDraft.to}T23:59:59.999`).toISOString() : "",
    });
    setCursor(0);
  }, [dateDraft, keywordDraft]);

  const resetFilters = () => {
    setStatus("ALL"); setStars([]); setKeyword(""); setKeywordDraft("");
    setDateDraft({ from: "", to: "" }); setDateRange({ from: "", to: "" }); setCursor(0);
  };

  const selectStatus = (nextStatus) => { setStatus(nextStatus); setCursor(0); };
  const toggleStar = (rating) => {
    setStars((current) => current.includes(rating) ? current.filter((value) => value !== rating) : [...current, rating]);
    setCursor(0);
  };
  const openNegative = () => { setStatus("NEED_REPLY"); setStars([1, 2]); setCursor(0); };
  const openRecent = () => {
    const lastVisit = previousVisitAt || 0;
    if (lastVisit) {
      const date = new Date(lastVisit * 1000);
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      setDateDraft({ from: localDate, to: "" });
      setDateRange({ from: date.toISOString(), to: "" });
      setKeyword(""); setCursor(0);
    }
  };

  const copyOrder = async (orderSn) => {
    try { await navigator.clipboard.writeText(orderSn); } catch { setError("Không thể sao chép mã đơn hàng trên trình duyệt này."); }
  };

  const submitReply = async (review) => {
    const value = String(replyDrafts[review.comment_id] || "").trim();
    if (!value) { setReplyError("Vui lòng nhập nội dung phản hồi."); return; }
    setReplying(review.comment_id); setReplyError("");
    try {
      await sellerService.replyToReview(activeShopId, review.comment_id, value);
      setReplyDrafts((current) => ({ ...current, [review.comment_id]: "" }));
      setRefresh((count) => count + 1);
    } catch (err) { setReplyError(err.message || "Không thể gửi phản hồi."); }
    finally { setReplying(null); }
  };

  const pageIndex = Math.floor(cursor / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil((pagination.total_count || 0) / PAGE_SIZE));

  return <div className={styles.page}>
    <div className={styles.topGrid}>
      <section className={styles.overview}>
        <div className={styles.overviewHeader}>
          <h1>Đánh Giá Shop</h1>
          <span className={styles.shopRating}><Star size={20} fill="currentColor" /> {summary?.rating == null ? "—" : Number(summary.rating).toFixed(2)}<small>/5</small></span>
          <span className={styles.period}>{formatPeriod(summary?.period)}</span>
        </div>
        {summaryError && <div className={styles.inlineError}>{summaryError}</div>}
        <div className={styles.metrics}>
          <Metric title="Tổng lượt đánh giá" metric={summary?.metrics?.review_count} info="Số lượt đánh giá được tạo trong 30 ngày gần nhất." />
          <Metric title="Tỷ lệ đánh giá đơn hàng" metric={summary?.metrics?.review_rate} suffix="%" info="Đơn hoàn thành có ít nhất một đánh giá chia cho đơn hoàn thành trong cùng kỳ." />
          <Metric title="Tỷ lệ đánh giá tốt" metric={summary?.metrics?.positive_review_rate} suffix="%" info="Đánh giá 4–5 sao chia cho tổng đánh giá trong cùng kỳ." />
        </div>
        <div className={styles.actionSummary}>
          <button type="button" onClick={openNegative}>
            <span><strong>Đánh giá tiêu cực cần phản hồi</strong><b>{summary?.negative_reviews_needing_reply ?? "—"}</b></span>
            <span className={styles.actionLink}>Xem ›</span>
            <small>Các đánh giá có 1 &amp; 2 sao cần bạn phản hồi</small>
          </button>
          <button type="button" onClick={openRecent}>
            <span><strong>Đánh giá gần đây</strong><b>{summary?.recent_reviews_since_last_visit ?? "—"}</b></span>
            <span className={styles.actionLink}>Xem ›</span>
            <small>Đánh giá mới được cập nhật từ lần truy cập trước</small>
          </button>
        </div>
      </section>
    </div>

    <section className={styles.listCard}>
      <h2>Danh sách đánh giá shop</h2>
      <div className={styles.statusRow}>
        <strong>Trạng thái</strong>
        {STATUS_FILTERS.map(([value, label, countKey]) => <button key={value} type="button" className={status === value ? styles.statusActive : ""} onClick={() => selectStatus(value)}>{label} ({counts[countKey] ?? 0})</button>)}
      </div>
      <div className={styles.ratingFilters}>
        <strong>Số sao đánh giá</strong>
        <label><input type="checkbox" checked={stars.length === 0} onChange={() => { setStars([]); setCursor(0); }} /> Tất cả</label>
        {RATING_FILTERS.map((rating) => <label key={rating}><input type="checkbox" checked={stars.includes(rating)} onChange={() => toggleStar(rating)} /> {rating} Sao <span>({counts.stars?.[rating] ?? 0})</span></label>)}
      </div>
      <form className={styles.searchForm} onSubmit={submitSearch}>
        <label className={styles.searchField}>Tìm kiếm<input value={keywordDraft} onChange={(event) => setKeywordDraft(event.target.value)} placeholder="Tên Sản Phẩm, Mã Đơn Hàng, Tên đăng nhập người mua..." /></label>
        <label>Thời gian đánh giá<div className={styles.dateFields}><input aria-label="Từ ngày đánh giá" type="date" value={dateDraft.from} onChange={(event) => setDateDraft((value) => ({ ...value, from: event.target.value }))} /><span>–</span><input aria-label="Đến ngày đánh giá" type="date" value={dateDraft.to} onChange={(event) => setDateDraft((value) => ({ ...value, to: event.target.value }))} /></div></label>
        <div className={styles.searchActions}><button className={styles.searchButton} type="submit"><Search size={15} /> Tìm kiếm</button><button type="button" onClick={resetFilters}>Đặt lại</button></div>
      </form>
      {error && <div className={styles.errorBanner} role="alert">{error} <button type="button" onClick={() => setRefresh((count) => count + 1)}>Thử lại</button></div>}
      {replyError && <div className={styles.errorBanner} role="alert">{replyError}</div>}
      <div className={styles.tableHeader}><span>Thông tin Sản phẩm</span><span>Đánh giá của Người mua</span><span>Thao tác</span></div>
      {loading ? <div className={styles.stateMessage}>Đang tải đánh giá…</div> : list.length === 0 ? <div className={styles.stateMessage}>Chưa có đánh giá phù hợp với bộ lọc này.</div> : <div className={styles.records}>
        {list.map((review) => <article className={styles.record} key={review.comment_id}>
          <header className={styles.recordHeader}><strong>{review.buyer_username || "—"}</strong><span className={styles.orderId}>ID đơn hàng <b>{review.order_sn}</b></span><button type="button" aria-label={`Sao chép mã đơn ${review.order_sn}`} onClick={() => copyOrder(review.order_sn)}><Copy size={14} /></button></header>
          <div className={styles.recordBody}>
            <div className={styles.productInfo}>{review.item_image ? <img src={review.item_image} alt="" /> : <div className={styles.noImage}>Ảnh sản phẩm</div>}<div><strong>{review.item_name}</strong>{review.model_name && <small>{review.model_name}</small>}</div></div>
            <div className={styles.reviewBody}><div className={styles.ratingLine}><StarRating value={review.rating_star} /><time>{formatDate(review.create_time)}</time></div><p>{review.comment || "Người mua chỉ gửi đánh giá sao."}</p>
              {review.reply && <div className={styles.replySaved}><strong>Phản hồi của Shop</strong><p>{review.reply}</p><small>{formatDate(review.reply_time)}</small></div>}
              {!review.reply && <div className={styles.replyComposer}><textarea aria-label={`Phản hồi đánh giá của ${review.buyer_username}`} value={replyDrafts[review.comment_id] || ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [review.comment_id]: event.target.value }))} placeholder="Nhập phản hồi của Shop…" rows={2} /><button type="button" disabled={replying === review.comment_id} onClick={() => submitReply(review)}>{replying === review.comment_id ? "Đang gửi…" : "Trả lời"}</button></div>}
            </div>
            <div className={styles.actionCell}>{review.reply ? <span className={styles.replied}><Check size={15} /> Đã trả lời</span> : <span>Cần phản hồi</span>}</div>
          </div>
        </article>)}
      </div>}
      <div className={styles.pagination}><span>{pagination.total_count || 0} đánh giá</span><button type="button" aria-label="Trang trước" disabled={cursor <= 0 || loading} onClick={() => setCursor(Math.max(0, cursor - PAGE_SIZE))}><ChevronLeft size={17} /></button><span>{pageIndex} / {totalPages}</span><button type="button" aria-label="Trang sau" disabled={!pagination.more || loading} onClick={() => setCursor(cursor + PAGE_SIZE)}><ChevronRight size={17} /></button></div>
    </section>
  </div>;
}
