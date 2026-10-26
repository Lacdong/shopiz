import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ChevronDown,
  CircleHelp,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  X,
  Check
} from "lucide-react";
import chatService from "../../../services/chatService";
import { DEFAULT_QUICK_REPLY_GROUPS } from "../../../data/defaultQuickMessages";
import s from "./QuickReply.module.css";

export default function QuickReplySettingsPage({ shopId = 727720655, onNavigateTab }) {
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [groups, setGroups] = useState(DEFAULT_QUICK_REPLY_GROUPS);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupInitialMsg, setNewGroupInitialMsg] = useState("");

  // Editing Group state
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editGroupNameValue, setEditGroupNameValue] = useState("");

  // Add Message to group state
  const [newMessageInputs, setNewMessageInputs] = useState({});

  useEffect(() => {
    let isMounted = true;
    chatService
      .getQuickReplySettings(shopId)
      .then((data) => {
        if (isMounted && data) {
          if (typeof data.show_suggestions === "boolean") {
            setShowSuggestions(data.show_suggestions);
          }
          if (Array.isArray(data.groups) && data.groups.length > 0) {
            setGroups(data.groups);
          }
        }
      })
      .catch(() => {
        // Fallback to local default groups
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

  const persistSettings = async (nextSuggestions, nextGroups) => {
    try {
      await chatService.updateQuickReplySettings(shopId, {
        show_suggestions: nextSuggestions,
        groups: nextGroups
      });
    } catch {
      // Non-blocking sync
    }
  };

  // Toggle global visibility
  const handleToggleSuggestions = (e) => {
    const val = e.target.checked;
    setShowSuggestions(val);
    persistSettings(val, groups);
    showToast(val ? "Đã bật hiển thị gợi ý tin nhắn nhanh" : "Đã tắt hiển thị gợi ý tin nhắn nhanh");
  };

  // Toggle group expand / collapse
  const handleToggleExpand = (groupId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const currentExpanded = g.expanded !== false;
        return { ...g, expanded: !currentExpanded };
      })
    );
  };

  // Toggle group enabled / disabled
  const handleToggleGroupEnabled = (groupId, e) => {
    const val = e.target.checked;
    const nextGroups = groups.map((g) =>
      g.id === groupId ? { ...g, enabled: val } : g
    );
    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    showToast(val ? "Đã kích hoạt nhóm tin nhắn" : "Đã tạm dừng nhóm tin nhắn");
  };

  // Delete Group
  const handleDeleteGroup = (groupId) => {
    if (groups.length <= 1) {
      alert("Cần giữ ít nhất 1 nhóm tin nhắn nhanh trong danh sách.");
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhóm tin nhắn này không?")) {
      return;
    }
    const nextGroups = groups.filter((g) => g.id !== groupId);
    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    showToast("Đã xóa nhóm tin nhắn");
  };

  // Edit Group Name
  const handleOpenEditGroup = (group) => {
    setEditingGroupId(group.id);
    setEditGroupNameValue(group.name);
  };

  const handleSaveGroupName = () => {
    if (!editGroupNameValue.trim()) return;
    const nextGroups = groups.map((g) =>
      g.id === editingGroupId ? { ...g, name: editGroupNameValue.trim() } : g
    );
    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    setEditingGroupId(null);
    showToast("Đã đổi tên nhóm tin nhắn");
  };

  // Create Group Modal
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (groups.length >= 25) {
      alert("Bạn chỉ có thể tạo tối đa 25 nhóm tin nhắn nhanh.");
      return;
    }
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: `group-custom-${Date.now()}`,
      name: newGroupName.trim(),
      enabled: true,
      expanded: true,
      messages: newGroupInitialMsg.trim()
        ? [
            {
              id: `msg-${Date.now()}`,
              content: newGroupInitialMsg.trim(),
              enabled: true,
              order: 1
            }
          ]
        : []
    };

    const nextGroups = [...groups, newGroup];
    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    setShowCreateModal(false);
    setNewGroupName("");
    setNewGroupInitialMsg("");
    showToast("Đã tạo nhóm tin nhắn nhanh mới");
  };

  // Add Message to group
  const handleAddMessage = (groupId) => {
    const text = (newMessageInputs[groupId] || "").trim();
    if (!text) return;

    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      const msgs = g.messages || [];
      const newMsg = {
        id: `msg-${Date.now()}`,
        content: text,
        enabled: true,
        order: msgs.length + 1
      };
      return {
        ...g,
        messages: [...msgs, newMsg]
      };
    });

    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    setNewMessageInputs((prev) => ({ ...prev, [groupId]: "" }));
    showToast("Đã thêm mẫu tin nhắn mới");
  };

  // Delete message from group
  const handleDeleteMessage = (groupId, msgId) => {
    const nextGroups = groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        messages: (g.messages || []).filter((m) => m.id !== msgId)
      };
    });
    setGroups(nextGroups);
    persistSettings(showSuggestions, nextGroups);
    showToast("Đã xóa mẫu tin nhắn");
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
        <strong>Tin nhắn nhanh</strong>
      </nav>

      {/* 2. Global Visibility Setting Card */}
      <section className={`${s.card} ${s.visibilityCard}`} aria-labelledby="vis-setting-heading">
        <div className={s.visTitleArea}>
          <h2 id="vis-setting-heading" className={s.visTitle}>
            Hiển thị dấu tin nhắn nhanh tự động
            <CircleHelp
              size={15}
              className={s.helpIcon}
              title="Tự động hiển thị phím tắt tin nhắn nhanh khi gõ nội dung trong khung trò chuyện"
            />
          </h2>
          <p className={s.visDesc}>
            Hiển thị Tin nhắn nhanh khi đang nhập văn bản trong cửa sổ Chat của bạn
          </p>
        </div>
        <label className={s.switch} title="Bật/Tắt gợi ý tin nhắn nhanh">
          <input
            type="checkbox"
            checked={showSuggestions}
            onChange={handleToggleSuggestions}
            aria-label="Hiển thị dấu tin nhắn nhanh tự động"
          />
          <span className={s.slider}></span>
        </label>
      </section>

      {/* 3. Personal Quick Messages Card */}
      <section className={s.card} aria-labelledby="quick-msg-heading">
        <div className={s.groupsHeader}>
          <div>
            <h2 id="quick-msg-heading" className={s.groupsTitle}>
              Tin nhắn nhanh cá nhân ({groups.length}/25)
            </h2>
            <p className={s.groupsDesc}>
              Tin nhắn nhanh cho phép bạn tạo và sử dụng các mẫu tin nhắn mà bạn thường xuyên gửi cho Người mua.
            </p>
          </div>
          <button
            type="button"
            className={s.createBtn}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            <span>Tạo Tin nhắn nhanh</span>
          </button>
        </div>

        {/* Groups List */}
        <div className={s.groupsList}>
          {groups.map((group) => {
            const isExpanded = group.expanded !== false;
            return (
              <div key={group.id} className={s.groupBox}>
                {/* Group Header Row */}
                <div className={s.groupHead}>
                  <div className={s.groupHeadLeft}>
                    <button
                      type="button"
                      className={s.expandBtn}
                      onClick={() => handleToggleExpand(group.id)}
                      aria-label={isExpanded ? "Thu gọn nhóm" : "Mở rộng nhóm"}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>
                    <span className={s.groupName}>{group.name}</span>
                  </div>

                  <div className={s.groupHeadRight}>
                    <label className={s.switch} title="Bật/Tắt nhóm tin nhắn này">
                      <input
                        type="checkbox"
                        checked={group.enabled !== false}
                        onChange={(e) => handleToggleGroupEnabled(group.id, e)}
                        aria-label={`Bật tắt nhóm ${group.name}`}
                      />
                      <span className={s.slider}></span>
                    </label>

                    <button
                      type="button"
                      className={s.iconBtn}
                      onClick={() => handleOpenEditGroup(group)}
                      title="Đổi tên nhóm"
                      aria-label={`Đổi tên nhóm ${group.name}`}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      type="button"
                      className={s.iconBtn}
                      onClick={() => handleDeleteGroup(group.id)}
                      title="Xóa nhóm"
                      aria-label={`Xóa nhóm ${group.name}`}
                    >
                      <Trash2 size={15} />
                    </button>

                    <span className={s.dragHandle} title="Kéo để sắp xếp thứ tự">
                      <GripVertical size={16} />
                    </span>
                  </div>
                </div>

                {/* Pre-seeded / Custom Messages List */}
                {isExpanded && (
                  <div className={s.messageList}>
                    {(group.messages || []).map((msg, idx) => (
                      <div key={msg.id || idx} className={s.messageRow}>
                        <span className={s.messageContent}>{msg.content}</span>
                        <div className={s.messageActions}>
                          <button
                            type="button"
                            className={s.iconBtn}
                            onClick={() => handleDeleteMessage(group.id, msg.id)}
                            title="Xóa tin nhắn này"
                            aria-label={`Xóa tin nhắn ${msg.content.slice(0, 20)}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Message into group bar */}
                    <div className={s.addMessageBar}>
                      <input
                        className={s.addMessageInput}
                        type="text"
                        placeholder="Thêm tin nhắn mới vào nhóm..."
                        value={newMessageInputs[group.id] || ""}
                        onChange={(e) =>
                          setNewMessageInputs({
                            ...newMessageInputs,
                            [group.id]: e.target.value
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddMessage(group.id);
                        }}
                        aria-label="Thêm tin nhắn mới vào nhóm"
                      />
                      <button
                        type="button"
                        className={s.addMessageBtn}
                        onClick={() => handleAddMessage(group.id)}
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal: Tạo Tin nhắn nhanh mới */}
      {showCreateModal && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="create-group-title">
          <form className={s.modalContent} onSubmit={handleCreateGroup}>
            <div className={s.modalHeader}>
              <h3 id="create-group-title">Tạo Nhóm Tin Nhắn Nhanh</h3>
              <button
                type="button"
                className={s.closeButton}
                onClick={() => setShowCreateModal(false)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formField}>
                <label htmlFor="groupName">Tên nhóm tin nhắn *</label>
                <input
                  id="groupName"
                  className={s.formInput}
                  type="text"
                  placeholder="Ví dụ: Tư vấn đơn hàng, Hậu mãi..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  maxLength={50}
                  required
                />
              </div>
              <div className={s.formField}>
                <label htmlFor="initialMsg">Tin nhắn đầu tiên trong nhóm</label>
                <input
                  id="initialMsg"
                  className={s.formInput}
                  type="text"
                  placeholder="Nhập nội dung tin nhắn mẫu..."
                  value={newGroupInitialMsg}
                  onChange={(e) => setNewGroupInitialMsg(e.target.value)}
                  maxLength={300}
                />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button
                type="submit"
                className={s.saveBtn}
                disabled={!newGroupName.trim()}
              >
                Lưu nhóm
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Đổi tên nhóm */}
      {editingGroupId && (
        <div className={s.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="edit-group-title">
          <div className={s.modalContent}>
            <div className={s.modalHeader}>
              <h3 id="edit-group-title">Đổi Tên Nhóm Tin Nhắn</h3>
              <button
                type="button"
                className={s.closeButton}
                onClick={() => setEditingGroupId(null)}
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>
            <div className={s.modalBody}>
              <div className={s.formField}>
                <label htmlFor="editGroupName">Tên nhóm *</label>
                <input
                  id="editGroupName"
                  className={s.formInput}
                  type="text"
                  value={editGroupNameValue}
                  onChange={(e) => setEditGroupNameValue(e.target.value)}
                  maxLength={50}
                  autoFocus
                />
              </div>
            </div>
            <div className={s.modalFooter}>
              <button
                type="button"
                className={s.cancelBtn}
                onClick={() => setEditingGroupId(null)}
              >
                Hủy
              </button>
              <button
                type="button"
                className={s.saveBtn}
                onClick={handleSaveGroupName}
                disabled={!editGroupNameValue.trim()}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

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
