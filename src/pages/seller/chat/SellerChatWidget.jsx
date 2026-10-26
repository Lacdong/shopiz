import React, { useEffect, useState, useRef } from "react";
import {
  MessageCircle,
  X,
  Minimize2,
  Send,
  Search,
  Zap,
  ShoppingBag
} from "lucide-react";
import chatService from "../../../services/chatService";
import { DEFAULT_QUICK_REPLY_GROUPS } from "../../../data/defaultQuickMessages";
import s from "./SellerChatWidget.module.css";

export default function SellerChatWidget({ shopId = 727720655, shopName = "SmartOmni Official Flagship" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputMessage, setInputMessage] = useState("");
  const [quickMessages, setQuickMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesScrollRef = useRef(null);

  // Poll / fetch shop conversations
  const loadConversations = () => {
    chatService
      .getShopConversations(shopId)
      .then((threads) => {
        setConversations(threads || []);
        if (threads && threads.length > 0 && !selectedBuyerId) {
          setSelectedBuyerId(threads[0].buyer_user_id);
        }
      })
      .catch(() => {
        // Handle error gracefully
      });
  };

  useEffect(() => {
    loadConversations();
    // Load quick replies for shortcut pills
    chatService
      .getQuickReplySettings(shopId)
      .then((data) => {
        const groups = data?.groups || DEFAULT_QUICK_REPLY_GROUPS;
        const allMsgs = groups.flatMap((g) => g.messages || []);
        setQuickMessages(allMsgs.slice(0, 8)); // Top 8 shortcut pills
      })
      .catch(() => {
        setQuickMessages(DEFAULT_QUICK_REPLY_GROUPS[0].messages.slice(0, 8));
      });
  }, [shopId]);

  // Load messages when selected buyer changes
  useEffect(() => {
    if (!selectedBuyerId || !isOpen) return;
    setLoadingMessages(true);
    chatService
      .getMessages(shopId, selectedBuyerId)
      .then((msgs) => {
        setMessages(msgs || []);
        // Mark as read
        chatService.markRead(shopId, selectedBuyerId, "SELLER");
        // Update unread count locally
        setConversations((prev) =>
          prev.map((c) =>
            c.buyer_user_id === selectedBuyerId ? { ...c, unread_count: 0 } : c
          )
        );
      })
      .catch(() => {
        setMessages([]);
      })
      .finally(() => {
        setLoadingMessages(false);
      });
  }, [shopId, selectedBuyerId, isOpen]);

  // Auto-scroll to bottom of messages container
  useEffect(() => {
    if (messagesScrollRef.current) {
      messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0
  );

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || !selectedBuyerId) return;

    setInputMessage("");

    // Optimistic UI update
    const tempId = Date.now();
    const tempMsg = {
      message_id: tempId,
      sender_type: "SELLER",
      message: text,
      created_at: Math.floor(Date.now() / 1000)
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await chatService.sendMessage({
        shopId,
        buyerUserId: selectedBuyerId,
        senderType: "SELLER",
        message: text
      });
      // Refresh thread preview
      setConversations((prev) =>
        prev.map((c) =>
          c.buyer_user_id === selectedBuyerId
            ? { ...c, last_message: text, last_message_time: Math.floor(Date.now() / 1000) }
            : c
        )
      );
    } catch {
      // Revert or show alert on failure
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.buyer_username || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeThread = conversations.find(
    (c) => c.buyer_user_id === selectedBuyerId
  );

  const formatTimestamp = (ts) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* 1. Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className={s.floatingTrigger}
          onClick={() => setIsOpen(true)}
          aria-label="Mở cửa sổ Chat Người Bán"
        >
          <MessageCircle size={20} />
          <span>Chat</span>
          {totalUnread > 0 && <span className={s.badge}>{totalUnread}</span>}
        </button>
      )}

      {/* 2. Floating Chat Window */}
      {isOpen && (
        <div className={s.chatWindow} role="region" aria-label="Shopee Chat Kênh Người Bán">
          {/* Header */}
          <div className={s.windowHeader}>
            <div className={s.headerLeft}>
              <MessageCircle size={18} />
              <h3 className={s.windowTitle}>Shopee Chat</h3>
              <span className={s.shopTag}>{shopName}</span>
            </div>
            <div className={s.headerRight}>
              <button
                type="button"
                className={s.headerIconBtn}
                onClick={() => setIsOpen(false)}
                title="Thu nhỏ"
                aria-label="Thu nhỏ cửa sổ Chat"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                className={s.headerIconBtn}
                onClick={() => setIsOpen(false)}
                title="Đóng"
                aria-label="Đóng cửa sổ Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Window Body */}
          <div className={s.windowContent}>
            {/* Sidebar: Conversation List */}
            <div className={s.sidebar}>
              <div className={s.searchBar}>
                <input
                  type="text"
                  className={s.searchInput}
                  placeholder="Tìm kiếm người mua..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Tìm kiếm người mua"
                />
              </div>

              <ul className={s.threadList} role="listbox">
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((thread) => {
                    const isSelected = thread.buyer_user_id === selectedBuyerId;
                    const initial = (thread.buyer_username || "U")[0].toUpperCase();
                    return (
                      <li
                        key={thread.buyer_user_id}
                        className={`${s.threadItem} ${isSelected ? s.active : ""}`}
                        onClick={() => setSelectedBuyerId(thread.buyer_user_id)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className={s.avatar}>{initial}</div>
                        <div className={s.threadInfo}>
                          <div className={s.threadHeader}>
                            <span className={s.buyerName}>
                              {thread.buyer_username || `Người mua #${thread.buyer_user_id}`}
                            </span>
                            <span className={s.threadTime}>
                              {formatTimestamp(thread.last_message_time)}
                            </span>
                          </div>
                          <div className={s.lastMsg}>{thread.last_message || "Chưa có tin nhắn"}</div>
                        </div>
                        {thread.unread_count > 0 && <span className={s.unreadDot} />}
                      </li>
                    );
                  })
                ) : (
                  <li style={{ padding: 16, textAlign: "center", color: "#999", fontSize: 12 }}>
                    Chưa có cuộc trò chuyện nào
                  </li>
                )}
              </ul>
            </div>

            {/* Main Area: Active Chat */}
            <div className={s.chatArea}>
              {selectedBuyerId ? (
                <>
                  {/* Chat Area Header */}
                  <div className={s.chatAreaHeader}>
                    <span className={s.activeBuyerTitle}>
                      {activeThread?.buyer_username || `Người mua #${selectedBuyerId}`}
                    </span>
                    <span className={s.orderBadge}>
                      <ShoppingBag size={12} style={{ display: "inline", marginRight: 4 }} />
                      Đơn hàng Shopee
                    </span>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className={s.messagesScroll} ref={messagesScrollRef}>
                    {messages.length > 0 ? (
                      messages.map((m, idx) => {
                        const isSeller = m.sender_type === "SELLER";
                        return (
                          <div
                            key={m.message_id || idx}
                            className={`${s.msgRow} ${isSeller ? s.outgoing : s.incoming}`}
                          >
                            <div className={s.msgBubble}>{m.message}</div>
                            <span className={s.msgMeta}>
                              {formatTimestamp(m.created_at)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className={s.emptyState}>
                        <MessageCircle size={32} strokeWidth={1.5} />
                        <span>Bắt đầu cuộc trò chuyện với người mua</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Message Shortcuts Bar */}
                  {quickMessages.length > 0 && (
                    <div className={s.quickShortcutsBar} title="Nhấp để chèn mẫu tin nhắn nhanh">
                      <Zap size={14} color="#ee4d2d" />
                      {quickMessages.map((qm) => (
                        <button
                          key={qm.id}
                          type="button"
                          className={s.quickPill}
                          onClick={() => handleSendMessage(qm.content)}
                        >
                          {qm.content.length > 25 ? `${qm.content.slice(0, 25)}...` : qm.content}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input Bar */}
                  <div className={s.inputBar}>
                    <input
                      type="text"
                      className={s.textInput}
                      placeholder="Nhập nội dung tin nhắn..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      aria-label="Nhập nội dung tin nhắn"
                    />
                    <button
                      type="button"
                      className={s.sendBtn}
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim()}
                      aria-label="Gửi tin nhắn"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div className={s.emptyState}>
                  <MessageCircle size={40} strokeWidth={1.2} />
                  <span>Chọn một cuộc hội thoại từ danh sách bên trái</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
