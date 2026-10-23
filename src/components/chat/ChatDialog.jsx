import React, { useEffect, useRef, useState } from "react";
import { X, Send, Store, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { money } from "../../data/catalog";
import chatService from "../../services/chatService";
import s from "./ChatDialog.module.css";

export default function ChatDialog({
  isOpen,
  onClose,
  shop,
  productContext = null,
  title = null,
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const shopId = shop?.id || shop?.shopId || shop?.shop_id || 727720655;
  const shopName = shop?.name || shop?.shopName || shop?.shop_name || "Official Flagship";
  const buyerId = user?.id || 1001;
  const buyerUsername = user?.username || user?.name || "demo";
  const dialogLabel =
    title ||
    (productContext
      ? "Chat with the shop"
      : shop?.brand
        ? `Chat with ${shop.brand}`
        : `Chat with ${shopName}`);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setLoading(true);

    chatService
      .getMessages(shopId, buyerId)
      .then((msgs) => {
        if (!active) return;
        setMessages(msgs);
        setTimeout(() => scrollToBottom(false), 50);
        chatService.markRead(shopId, buyerId);
      })
      .catch((err) => {
        console.warn("Could not load chat messages:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, shopId, buyerId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  if (!isOpen) return null;

  async function handleSend(customText = null) {
    const msgToSend = String(customText || text).trim();
    if (!msgToSend || sending) return;

    setSending(true);
    if (!customText) setText("");

    const tempId = Date.now();
    const optimisticMsg = {
      message_id: tempId,
      sender_type: "BUYER",
      buyer_username: buyerUsername,
      message: msgToSend,
      created_at: Math.floor(Date.now() / 1000),
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await chatService.sendMessage({
        shopId,
        buyerUserId: buyerId,
        buyerUsername,
        senderType: "BUYER",
        message: msgToSend,
      });

      // Update optimistic message with real message_id if available
      if (res?.message_id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.message_id === tempId ? { ...m, message_id: res.message_id } : m,
          ),
        );
      }

      // If this is an inquiry, simulate a shop auto-reply after 1.2s if no recent shop reply
      setTimeout(async () => {
        try {
          const autoReplyRes = await chatService.sendMessage({
            shopId,
            buyerUserId: buyerId,
            buyerUsername,
            senderType: "SELLER",
            message:
              "Dạ chào bạn, Shopiz đã nhận được thông tin tư vấn của bạn! Nhân viên shop sẽ hỗ trợ phản hồi trong giây lát ạ.",
          });

          if (autoReplyRes?.message_id) {
            setMessages((prev) => [
              ...prev,
              {
                message_id: autoReplyRes.message_id,
                sender_type: "SELLER",
                buyer_username: buyerUsername,
                message: autoReplyRes.message,
                created_at: autoReplyRes.created_at || Math.floor(Date.now() / 1000),
                is_read: true,
              },
            ]);
          }
        } catch {
          // Non-critical auto reply
        }
      }, 1200);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  }

  function formatTime(timestamp) {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div
      className={s.backdrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.window} role="dialog" aria-label={dialogLabel}>
        <div className={s.header}>
          <div className={s.headerLeft}>
            <span className={s.avatar}>
              <Store size={20} strokeWidth={1.5} />
            </span>
            <div className={s.shopInfo}>
              <h3>{shopName}</h3>
              <p className={s.shopStatus}>
                <span className={s.statusDot} />
                Online recently
              </p>
            </div>
          </div>
          <button
            className={s.closeBtn}
            onClick={onClose}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {productContext && (
          <div className={s.productSnippet}>
            <img
              src={
                productContext.image ||
                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85"
              }
              alt={productContext.title}
            />
            <div className={s.productDetails}>
              <strong>{productContext.title}</strong>
              <span>{money(productContext.price || 0)}</span>
            </div>
            <button
              className={s.sendLinkBtn}
              onClick={() =>
                handleSend(
                  `Shop ơi, mình đang quan tâm sản phẩm "${productContext.title}". Bạn tư vấn giúp mình nhé!`,
                )
              }
            >
              Send inquiry
            </button>
          </div>
        )}

        <div className={s.messageArea}>
          {loading && messages.length === 0 ? (
            <div className={s.emptyState}>
              <Loader2 size={24} className={s.spin} />
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={s.emptyState}>
              <MessageCircle size={32} strokeWidth={1.2} />
              <p>Start a conversation with {shopName}!</p>
            </div>
          ) : (
            messages.map((m) => {
              const isBuyer = m.sender_type === "BUYER";
              return (
                <div
                  key={m.message_id}
                  className={`${s.messageRow} ${isBuyer ? s.buyer : s.shop}`}
                >
                  {!isBuyer && (
                    <span className={s.shopAvatarMini}>
                      <Store size={14} />
                    </span>
                  )}
                  <div className={`${s.bubble} ${isBuyer ? s.buyer : s.shop}`}>
                    {m.message}
                    <span className={s.timestamp}>
                      {formatTime(m.created_at)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          className={s.inputBar}
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className={s.sendBtn}
            disabled={!text.trim() || sending}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
