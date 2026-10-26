import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  AlertTriangle,
  Pencil,
  X,
  Check
} from "lucide-react";
import chatService from "../../../services/chatService";
import { DEFAULT_AUTO_REPLY } from "../../../data/defaultQuickMessages";
import s from "./AutoReply.module.css";

const BANNER_STORAGE_KEY = "shopiz-chat-autoreply-banner-dismissed";

export default function AutoReplySettingsPage({ shopId = 727720655, onNavigateTab }) {
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(BANNER_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [settings, setSettings] = useState(DEFAULT_AUTO_REPLY);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Standard Auto Reply Edit State
  const [isEditingStandard, setIsEditingStandard] = useState(false);
  const [draftStandard, setDraftStandard] = useState(DEFAULT_AUTO_REPLY.standard_message);

  // After Hours Auto Reply Edit State
  const [isEditingOffWork, setIsEditingOffWork] = useState(false);
  const [draftOffWork, setDraftOffWork] = useState(DEFAULT_AUTO_REPLY.off_work_message);

  useEffect(() => {
    let isMounted = true;
    chatService
      .getAutoReplySettings(shopId)
      .then((data) => {
        if (isMounted && data) {
          setSettings({
            standard_enabled: Boolean(data.standard_enabled),
            standard_message: data.standard_message || DEFAULT_AUTO_REPLY.standard_message,
            off_work_enabled: Boolean(data.off_work_enabled),
            off_work_message: data.off_work_message || DEFAULT_AUTO_REPLY.off_work_message
          });
          setDraftStandard(data.standard_message || DEFAULT_AUTO_REPLY.standard_message);
          setDraftOffWork(data.off_work_message || DEFAULT_AUTO_REPLY.off_work_message);
        }
      })
      .catch(() => {
        // Fallback to defaults
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      sessionStorage.setItem(BANNER_STORAGE_KEY, "true");
    } catch {
      // Storage unavailable
    }
  };

  const handleToggleStandard = async (e) => {
    const nextVal = e.target.checked;
    setSettings((prev) => ({ ...prev, standard_enabled: nextVal }));
    try {
      await chatService.updateAutoReplySettings(shopId, { standard_enabled: nextVal });
      showToast(nextVal ? "Đã bật tin nhắn tự động tiêu chuẩn" : "Đã tắt tin nhắn tự động tiêu chuẩn");
    } catch {
      // Revert on error
    }
  };

  const handleToggleOffWork = async (e) => {
    const nextVal = e.target.checked;
    setSettings((prev) => ({ ...prev, off_work_enabled: nextVal }));
    try {
      await chatService.updateAutoReplySettings(shopId, { off_work_enabled: nextVal });
      showToast(nextVal ? "Đã bật tin nhắn tự động ngoài giờ làm việc" : "Đã tắt tin nhắn tự động ngoài giờ làm việc");
    } catch {
      // Revert on error
    }
  };

  const handleSaveStandard = async () => {
    if (!draftStandard.trim()) return;
    const cleanMsg = draftStandard.trim();
    setSettings((prev) => ({ ...prev, standard_message: cleanMsg }));
    setIsEditingStandard(false);
    try {
      await chatService.updateAutoReplySettings(shopId, { standard_message: cleanMsg });
      showToast("Đã lưu tin nhắn tự động tiêu chuẩn");
    } catch {
      // Handle error
    }
  };

  const handleCancelStandard = () => {
    setDraftStandard(settings.standard_message);
    setIsEditingStandard(false);
  };

  const handleSaveOffWork = async () => {
    if (!draftOffWork.trim()) return;
    const cleanMsg = draftOffWork.trim();
    setSettings((prev) => ({ ...prev, off_work_message: cleanMsg }));
    setIsEditingOffWork(false);
    try {
      await chatService.updateAutoReplySettings(shopId, { off_work_message: cleanMsg });
      showToast("Đã lưu tin nhắn tự động ngoài giờ làm việc");
    } catch {
      // Handle error
    }
  };

  const handleCancelOffWork = () => {
    setDraftOffWork(settings.off_work_message);
    setIsEditingOffWork(false);
  };

  return (
    <div className={s.container}>
      {/* 1. Breadcrumb */}
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        <Link to="/seller?tab=orders_all">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link
          to="/seller?tab=chat"
          onClick={(e) => {
            if (onNavigateTab) {
              e.preventDefault();
              onNavigateTab("chat");
            }
          }}
        >
          Quản lý Chat
        </Link>
        <ChevronRight size={14} />
        <strong>Tin nhắn tự động</strong>
      </nav>

      {/* 2. Dismissible Warning Banner */}
      {!bannerDismissed && (
        <div className={s.warningBanner} role="alert">
          <AlertTriangle size={18} className={s.warningIcon} aria-hidden="true" />
          <div className={s.warningContent}>
            <p>1. Trả lời tự động mặc định sẽ chỉ được kích hoạt 24 giờ một lần cho mỗi người mua.</p>
            <p>2. Trả lời tự động ngoài tuyến sẽ chỉ được kích hoạt mỗi ngày một lần cho mỗi người mua.</p>
          </div>
          <button
            type="button"
            className={s.closeBannerBtn}
            onClick={handleDismissBanner}
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Standard Automatic Message */}
      <section className={s.sectionCard} aria-labelledby="standard-msg-heading">
        <div className={s.sectionHeader}>
          <h2 id="standard-msg-heading" className={s.sectionTitle}>
            Tin nhắn tự động tiêu chuẩn
          </h2>
          <p className={s.sectionDesc}>
            Sau khi kích hoạt, tin nhắn sẽ được tự động gửi đến Người mua khi họ bắt đầu chat với bạn.
          </p>
        </div>

        <div className={s.messageConfigBox}>
          <div className={s.configHead}>
            <span className={s.configHeadTitle}>Cài đặt Shop</span>
            <div className={s.configControls}>
              <label className={s.switch} title="Bật/Tắt tin nhắn tự động tiêu chuẩn">
                <input
                  type="checkbox"
                  checked={settings.standard_enabled}
                  onChange={handleToggleStandard}
                  aria-label="Kích hoạt tin nhắn tự động tiêu chuẩn"
                />
                <span className={s.slider}></span>
              </label>

              {!isEditingStandard && (
                <button
                  type="button"
                  className={s.pencilBtn}
                  onClick={() => setIsEditingStandard(true)}
                  aria-label="Chỉnh sửa tin nhắn tiêu chuẩn"
                  title="Chỉnh sửa"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>

          <div className={s.messageBody}>
            {isEditingStandard ? (
              <div className={s.editContainer}>
                <textarea
                  className={s.textarea}
                  value={draftStandard}
                  onChange={(e) => setDraftStandard(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Nhập nội dung tin nhắn tự động tiêu chuẩn..."
                  aria-label="Nội dung tin nhắn tiêu chuẩn"
                />
                <div className={s.editActions}>
                  <span className={s.charCount}>{draftStandard.length}/500</span>
                  <div className={s.buttonGroup}>
                    <button
                      type="button"
                      className={s.cancelBtn}
                      onClick={handleCancelStandard}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className={s.saveBtn}
                      onClick={handleSaveStandard}
                      disabled={!draftStandard.trim()}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className={s.messageText}>{settings.standard_message}</p>
            )}
          </div>
        </div>
      </section>

      {/* 4. After-Hours Automatic Message */}
      <section className={s.sectionCard} aria-labelledby="offwork-msg-heading">
        <div className={s.sectionHeader}>
          <h2 id="offwork-msg-heading" className={s.sectionTitle}>
            Tin nhắn tự động ngoài giờ làm việc
          </h2>
          <p className={s.sectionDesc}>
            Sau khi kích hoạt, tin nhắn trả lời tự động này sẽ được gửi nếu người mua bắt đầu cuộc trò chuyện ngoài giờ làm việc.
          </p>
        </div>

        <div className={s.messageConfigBox}>
          <div className={s.configHead}>
            <span className={s.configHeadTitle}>Cài đặt Shop</span>
            <div className={s.configControls}>
              <label className={s.switch} title="Bật/Tắt tin nhắn tự động ngoài giờ làm việc">
                <input
                  type="checkbox"
                  checked={settings.off_work_enabled}
                  onChange={handleToggleOffWork}
                  aria-label="Kích hoạt tin nhắn tự động ngoài giờ làm việc"
                />
                <span className={s.slider}></span>
              </label>

              {!isEditingOffWork && (
                <button
                  type="button"
                  className={s.pencilBtn}
                  onClick={() => setIsEditingOffWork(true)}
                  aria-label="Chỉnh sửa tin nhắn ngoài giờ làm việc"
                  title="Chỉnh sửa"
                >
                  <Pencil size={16} />
                </button>
              )}
            </div>
          </div>

          <div className={s.messageBody}>
            {isEditingOffWork ? (
              <div className={s.editContainer}>
                <textarea
                  className={s.textarea}
                  value={draftOffWork}
                  onChange={(e) => setDraftOffWork(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Nhập nội dung tin nhắn tự động ngoài giờ làm việc..."
                  aria-label="Nội dung tin nhắn ngoài giờ làm việc"
                />
                <div className={s.editActions}>
                  <span className={s.charCount}>{draftOffWork.length}/500</span>
                  <div className={s.buttonGroup}>
                    <button
                      type="button"
                      className={s.cancelBtn}
                      onClick={handleCancelOffWork}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className={s.saveBtn}
                      onClick={handleSaveOffWork}
                      disabled={!draftOffWork.trim()}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className={s.messageText}>{settings.off_work_message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={s.toast} role="status">
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
