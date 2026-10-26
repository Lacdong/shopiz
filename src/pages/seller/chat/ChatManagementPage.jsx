import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  CircleHelp,
  TrendingUp,
  MessageSquare,
  MessageCircle,
  HelpCircle,
  X,
  Bot
} from "lucide-react";
import chatService from "../../../services/chatService";
import s from "./ChatManagement.module.css";

export default function ChatManagementPage({ shopId = 727720655, onNavigateTab }) {
  const [performance, setPerformance] = useState({
    chat_count: 4,
    chat_count_compare: "+300,00%",
    chat_count_trend: "up",
    response_rate: "-",
    response_rate_compare: "-",
    response_time: "00:00:00",
    response_time_compare: "0,00%"
  });
  const [loading, setLoading] = useState(true);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    chatService
      .getChatPerformance(shopId)
      .then((data) => {
        if (isMounted && data) {
          setPerformance((prev) => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(() => {
        // Use defaults if backend offline
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [shopId]);

  const navigateTo = (tab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <div className={s.container}>
      {/* 1. Breadcrumb */}
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        <Link to="/seller?tab=orders_all">Trang chủ</Link>
        <ChevronRight size={14} />
        <strong>Quản lý Chat</strong>
      </nav>

      {/* 2. Chat Performance Card */}
      <section className={s.card} aria-labelledby="chat-perf-heading">
        <div className={s.cardHeader}>
          <h2 id="chat-perf-heading" className={s.cardTitle}>
            Quản lý Chat <span className={s.cardSubtitle}>(Hiệu quả Chat)</span>
          </h2>
          <button
            type="button"
            className={s.seeMoreLink}
            onClick={() => setShowDetailModal(true)}
            aria-label="Xem thêm chi tiết hiệu quả chat"
          >
            <span>Xem thêm</span>
            <ChevronRight size={15} />
          </button>
        </div>

        <div className={s.metricGrid}>
          {/* Metric 1: Lượt chat */}
          <div className={s.metricCol}>
            <div className={s.metricLabel}>
              <span>Lượt chat</span>
              <CircleHelp size={15} className={s.helpIcon} title="Tổng số lượt hội thoại chat với người mua trong 30 ngày qua" />
            </div>
            <div className={s.metricValue}>{performance.chat_count}</div>
            <div className={s.metricComparison}>
              <span>so với 30 ngày trước đó</span>
              <span className={s.trendGreen}>
                <TrendingUp size={14} />
                <span>{performance.chat_count_compare}</span>
              </span>
            </div>
          </div>

          {/* Metric 2: Chat Response Rate */}
          <div className={s.metricCol}>
            <div className={s.metricLabel}>
              <span>Chat Response Rate</span>
              <CircleHelp size={15} className={s.helpIcon} title="Tỷ lệ phản hồi tin nhắn trong vòng 12 giờ của Shop" />
            </div>
            <div className={s.metricValue}>{performance.response_rate}</div>
            <div className={s.metricComparison}>
              <span>so với 30 ngày trước đó</span>
              <span>{performance.response_rate_compare}</span>
            </div>
          </div>

          {/* Metric 3: Thời gian phản hồi */}
          <div className={s.metricCol}>
            <div className={s.metricLabel}>
              <span>Thời gian phản hồi</span>
              <CircleHelp size={15} className={s.helpIcon} title="Thời gian phản hồi tin nhắn trung bình của Người bán" />
            </div>
            <div className={s.metricValue}>{performance.response_time}</div>
            <div className={s.metricComparison}>
              <span>so với 30 ngày trước đó</span>
              <span>{performance.response_time_compare}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Chat Assistant Section */}
      <section className={s.card} aria-labelledby="chat-assistant-heading">
        <h2 id="chat-assistant-heading" className={s.cardTitle}>
          Trợ lý Chat
        </h2>

        <div className={s.assistantGrid}>
          {/* Card 1: Tin nhắn tự động */}
          <div className={s.assistantCard}>
            <div className={s.assistantHead}>
              <div className={s.iconCircle} aria-hidden="true">
                <Bot size={22} />
              </div>
              <div className={s.assistantContent}>
                <h3 className={s.assistantTitle}>
                  Tin nhắn tự động
                  <CircleHelp size={14} className={s.helpIcon} title="Thiết lập lời chào tự động khi khách hàng bắt đầu nhắn tin" />
                </h3>
                <p className={s.assistantDesc}>
                  Tự động gửi lời chào khi người mua bắt đầu cuộc trò chuyện.
                </p>
              </div>
            </div>
            <div className={s.assistantAction}>
              <button
                type="button"
                className={s.actionButton}
                onClick={() => navigateTo("chat_auto_reply")}
              >
                Bắt đầu
              </button>
            </div>
          </div>

          {/* Card 2: Tin nhắn nhanh */}
          <div className={s.assistantCard}>
            <div className={s.assistantHead}>
              <div className={s.iconCircle} aria-hidden="true">
                <MessageSquare size={22} />
              </div>
              <div className={s.assistantContent}>
                <h3 className={s.assistantTitle}>
                  Tin nhắn nhanh
                  <CircleHelp size={14} className={s.helpIcon} title="Mẫu câu trả lời nhanh để tư vấn thuận tiện hơn" />
                </h3>
                <p className={s.assistantDesc}>
                  Giúp bộ phận chăm sóc khách hàng phản hồi nhanh hơn thông qua mẫu tin nhắn có sẵn.
                </p>
              </div>
            </div>
            <div className={s.assistantAction}>
              <button
                type="button"
                className={s.actionButton}
                onClick={() => navigateTo("chat_quick_reply")}
              >
                Chỉnh sửa
              </button>
            </div>
          </div>

          {/* Card 3: Hỏi - Đáp */}
          <div className={s.assistantCard}>
            <div className={s.assistantHead}>
              <div className={s.iconCircle} aria-hidden="true">
                <HelpCircle size={22} />
              </div>
              <div className={s.assistantContent}>
                <h3 className={s.assistantTitle}>
                  Hỏi - Đáp
                  <CircleHelp size={14} className={s.helpIcon} title="Tự động hiển thị câu hỏi thường gặp cho người mua" />
                </h3>
                <p className={s.assistantDesc}>
                  Tự động gửi thẻ Câu hỏi thường gặp khi người mua bắt đầu trò chuyện để giúp trả lời các câu hỏi thường gặp.
                </p>
              </div>
            </div>
            <div className={s.assistantAction}>
              <button
                type="button"
                className={s.actionButton}
                onClick={() => setShowFaqModal(true)}
              >
                Bắt đầu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Setup Modal */}
      {showFaqModal && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="faq-title">
          <div className={s.modalContent}>
            <div className={s.modalHeader}>
              <h3 id="faq-title">Thiết lập Câu hỏi thường gặp (Hỏi - Đáp)</h3>
              <button
                type="button"
                className={s.closeButton}
                onClick={() => setShowFaqModal(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <div className={s.modalBody}>
              <p style={{ marginTop: 0, color: "#666" }}>
                Thẻ Hỏi - Đáp giúp người mua tự tìm câu trả lời cho các thắc mắc thông dụng trước khi gặp nhân viên tư vấn:
              </p>
              <div className={s.faqItem}>
                <div className={s.faqQuestion}>1. Shop có hỗ trợ xem hàng trước khi nhận không?</div>
                <div className={s.faqAnswer}>Shopee áp dụng chính sách Đồng kiểm khi nhận hàng. Quý khách có thể kiểm tra ngoại quan cùng shipper trước khi thanh toán.</div>
              </div>
              <div className={s.faqItem}>
                <div className={s.faqQuestion}>2. Thời gian giao hàng dự kiến là bao lâu?</div>
                <div className={s.faqAnswer}>Đơn hàng nội thành giao trong 1-2 ngày, ngoại thành và các tỉnh từ 2-4 ngày làm việc.</div>
              </div>
              <div className={s.faqItem}>
                <div className={s.faqQuestion}>3. Chính sách đổi trả hàng như thế nào?</div>
                <div className={s.faqAnswer}>Hỗ trợ đổi trả miễn phí trong 15 ngày đối với sản phẩm Shopee Mall hoặc theo quy định trả hàng của sàn.</div>
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.primaryBtn}
                onClick={() => setShowFaqModal(false)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Performance Modal */}
      {showDetailModal && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="detail-title">
          <div className={s.modalContent}>
            <div className={s.modalHeader}>
              <h3 id="detail-title">Chi tiết Hiệu quả Vận hành Chat</h3>
              <button
                type="button"
                className={s.closeButton}
                onClick={() => setShowDetailModal(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <div className={s.modalBody}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span>Tổng số lượt hội thoại 30 ngày:</span>
                  <strong>{performance.chat_count} lượt</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span>Tăng trưởng so với kỳ trước:</span>
                  <span style={{ color: "#26aa99", fontWeight: 600 }}>{performance.chat_count_compare}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span>Tỷ lệ phản hồi tin nhắn:</span>
                  <strong>{performance.response_rate}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", paddingBottom: 8 }}>
                  <span>Thời gian phản hồi trung bình:</span>
                  <strong>{performance.response_time}</strong>
                </div>
                <p style={{ fontSize: 12, color: "#888", margin: "8px 0 0" }}>
                  * Dữ liệu được tính toán dựa trên các tin nhắn nhận được trong vòng 30 ngày gần nhất theo chuẩn Shopee Open Platform.
                </p>
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.primaryBtn}
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
