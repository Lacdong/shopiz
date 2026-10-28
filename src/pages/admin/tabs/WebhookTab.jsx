import React, { useState, useEffect } from "react";
import {
  Send,
  RefreshCw,
  Trash2,
  ExternalLink,
  Code2,
  CheckCircle,
  AlertCircle,
  Clock,
  Radio,
  FileCode,
  X,
  Play
} from "lucide-react";
import adminService from "../../../services/adminService";
import s from "./Webhook.module.css";
import modalS from "../TestControl.module.css";

const EVENT_TEMPLATES = {
  3: {
    name: "Code 3: order_status_push",
    defaultData: {
      ordersn: "261026TEST001",
      status: "READY_TO_SHIP",
      update_time: Math.floor(Date.now() / 1000)
    }
  },
  4: {
    name: "Code 4: order_trackingno_push",
    defaultData: {
      ordersn: "261026TEST001",
      tracking_no: "SPXVN03928172910",
      update_time: Math.floor(Date.now() / 1000)
    }
  },
  8: {
    name: "Code 8: reserved_stock_change_push",
    defaultData: {
      item_id: 100001,
      model_id: 0,
      stock: 45,
      reserved_stock: 5
    }
  },
  15: {
    name: "Code 15: airwaybill_update",
    defaultData: {
      ordersn: "261026TEST001",
      status: "READY",
      document_type: "THERMAL_AIR_WAYBILL"
    }
  },
  1: {
    name: "Code 1: shop_authorization_push",
    defaultData: {
      shop_id: 727720655,
      success: true
    }
  },
  2: {
    name: "Code 2: shop_authorization_canceled",
    defaultData: {
      shop_id: 727720655,
      success: true
    }
  }
};

export default function WebhookTab({ showToast }) {
  const apiHost = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080").replace(/\/+$/, "");
  const [webhookUrl, setWebhookUrl] = useState(`${apiHost}/api/v2/simulator/webhook/sink`);
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [savingUrl, setSavingUrl] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // Dispatch form state
  const [pushCode, setPushCode] = useState(3);
  const [shopId, setShopId] = useState(727720655);
  const [ordersn, setOrdersn] = useState("261026TEST001");
  const [dataJson, setDataJson] = useState(JSON.stringify(EVENT_TEMPLATES[3].defaultData, null, 2));

  // Filters
  const [filterCode, setFilterCode] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Inspect Modal
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await adminService.getWebhookLogs({
        push_code: filterCode || undefined,
        status: filterStatus || undefined,
      });
      setLogs(res.logs || []);
      setTotalLogs(res.total || 0);
    } catch (err) {
      // Handle error
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterCode, filterStatus]);

  const handlePushCodeChange = (code) => {
    const num = Number(code);
    setPushCode(num);
    if (EVENT_TEMPLATES[num]) {
      setDataJson(JSON.stringify(EVENT_TEMPLATES[num].defaultData, null, 2));
    }
  };

  const handleSaveWebhookUrl = async () => {
    if (!webhookUrl.trim()) return;
    setSavingUrl(true);
    try {
      await adminService.setWebhookUrl(webhookUrl.trim());
      showToast("Đã lưu địa chỉ nhận Webhook thành công");
    } catch (err) {
      showToast(err.message || "Lỗi khi lưu webhook URL", "error");
    } finally {
      setSavingUrl(false);
    }
  };

  const handleUseMockSink = () => {
    const defaultSink = `${apiHost}/api/v2/simulator/webhook/sink`;
    setWebhookUrl(defaultSink);
    showToast("Đã điền địa chỉ Mock Sink mặc định");
  };

  const handleDispatch = async () => {
    let parsedData = {};
    try {
      parsedData = JSON.parse(dataJson);
    } catch {
      showToast("Dữ liệu JSON trong trường 'data' không hợp lệ!", "error");
      return;
    }

    setDispatching(true);
    try {
      await adminService.triggerWebhook({
        push_code: pushCode,
        shop_id: shopId,
        ordersn: ordersn.trim() || undefined,
        data: parsedData
      });
      showToast(`Đã phát thông báo Webhook Mã ${pushCode} thành công!`);
      fetchLogs();
    } catch (err) {
      showToast(err.message || "Lỗi khi phát thông báo Webhook", "error");
    } finally {
      setDispatching(false);
    }
  };

  const handleRetryFailed = async () => {
    try {
      const res = await adminService.retryFailedWebhooks();
      showToast(`Đã kích hoạt gửi lại ${res?.retried_success_count ?? 0} webhook lỗi`);
      fetchLogs();
    } catch (err) {
      showToast(err.message || "Lỗi khi gửi lại webhook", "error");
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử webhook không?")) {
      return;
    }
    try {
      await adminService.clearWebhookLogs();
      showToast("Đã xóa sạch nhật ký webhook");
      fetchLogs();
    } catch (err) {
      showToast(err.message || "Lỗi khi xóa nhật ký", "error");
    }
  };

  const formatTimestamp = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " " + d.toLocaleDateString("vi-VN");
  };

  return (
    <div className={s.gridContainer}>
      <div className={s.topRow}>
        {/* Card 1: Webhook URL Manager */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div>
              <h3 className={s.cardTitle}>
                <Radio size={16} color="#7b2cbf" />
                Cấu Hình Địa Chỉ Nhận Webhook
              </h3>
              <p className={s.cardDesc}>
                Thiết lập HTTP POST URL của đối tác (SmartOmni Channel) để nhận push events.
              </p>
            </div>
            <button
              type="button"
              className={s.btnSuccessLight}
              onClick={handleUseMockSink}
              title="Sử dụng mock sink có sẵn trả về 200 OK"
            >
              Mock Sink (200 OK)
            </button>
          </div>
          <div className={s.cardBody}>
            <div className={s.formGroup}>
              <label className={s.formLabel}>Target Webhook URL *</label>
              <div className={s.inputGroup}>
                <input
                  type="text"
                  className={s.formInput}
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="http://localhost:3000/api/shopee/webhook"
                />
                <button
                  type="button"
                  className={s.btnPrimary}
                  onClick={handleSaveWebhookUrl}
                  disabled={savingUrl}
                >
                  {savingUrl ? "Đang lưu..." : "Lưu URL"}
                </button>
              </div>
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>
              Tất cả sự kiện thay đổi trạng thái đơn hàng (Code 3), mã vận đơn (Code 4), tồn kho (Code 8), phiếu giao hàng (Code 15) sẽ được ký số HMAC-SHA256 gửi tới URL này.
            </div>
          </div>
        </div>

        {/* Card 2: Manual Event Dispatcher */}
        <div className={s.card}>
          <div className={s.cardHead}>
            <div>
              <h3 className={s.cardTitle}>
                <Play size={16} color="#7b2cbf" />
                Phát Webhook Sự Kiện Thủ Công
              </h3>
              <p className={s.cardDesc}>
                Bắn trực tiếp thông báo đẩy với payload tùy chỉnh để kiểm tra phản hồi của hệ thống đối tác.
              </p>
            </div>
          </div>
          <div className={s.cardBody}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label className={s.formLabel}>Mã Push Code *</label>
                <select
                  className={s.formSelect}
                  value={pushCode}
                  onChange={(e) => handlePushCodeChange(e.target.value)}
                >
                  {Object.entries(EVENT_TEMPLATES).map(([code, item]) => (
                    <option key={code} value={code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={s.formLabel}>Gian Hàng (Shop ID) *</label>
                <select
                  className={s.formSelect}
                  value={shopId}
                  onChange={(e) => setShopId(Number(e.target.value))}
                >
                  <option value={727720655}>727720655 - SmartOmni Flagship</option>
                  <option value={839910244}>839910244 - Hà Nội Streetwear</option>
                  <option value={910283751}>910283751 - Sài Gòn Modern Living</option>
                </select>
              </div>
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>Mã Đơn Hàng (Order SN - Tùy chọn)</label>
              <input
                type="text"
                className={s.formInput}
                value={ordersn}
                onChange={(e) => setOrdersn(e.target.value)}
                placeholder="Ví dụ: 261026TEST001"
              />
            </div>

            <div className={s.formGroup}>
              <label className={s.formLabel}>Payload JSON (`data` field) *</label>
              <textarea
                className={`${s.formTextarea} ${s.codeArea}`}
                rows={4}
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
              />
            </div>

            <button
              type="button"
              className={s.btnPrimary}
              style={{ width: "100%" }}
              onClick={handleDispatch}
              disabled={dispatching}
            >
              <Send size={14} />
              {dispatching ? "Đang gửi..." : "Bắn Thông Báo Webhook Này"}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Outbound Delivery Audit Log */}
      <div className={s.card}>
        <div className={s.cardHead}>
          <div>
            <h3 className={s.cardTitle}>
              <Clock size={16} color="#7b2cbf" />
              Nhật Ký Phát Webhook (Delivery Audit Stream)
              <span style={{ fontSize: 11, fontWeight: 700, background: "#f3f4f6", padding: "2px 8px", borderRadius: 10, color: "#6b7280" }}>
                {totalLogs} lượt ghi
              </span>
            </h3>
            <p className={s.cardDesc}>
              Theo dõi thời gian thực kết quả gửi gói tin webhook, mã phản hồi HTTP và số lần thử lại.
            </p>
          </div>
          <div className={s.actionsGroup}>
            <button
              type="button"
              className={s.btnSecondary}
              onClick={handleRetryFailed}
              title="Gửi lại các đơn lỗi trong hàng đợi"
            >
              <RefreshCw size={13} />
              Gửi lại đơn lỗi
            </button>
            <button
              type="button"
              className={s.btnDanger}
              onClick={handleClearLogs}
              title="Xóa toàn bộ nhật ký"
            >
              <Trash2 size={13} />
              Xóa nhật ký
            </button>
            <button
              type="button"
              className={s.btnPrimary}
              onClick={fetchLogs}
              title="Tải lại bảng nhật ký"
            >
              <RefreshCw size={13} />
              Làm mới
            </button>
          </div>
        </div>

        {/* Toolbar Filters */}
        <div className={s.toolbar}>
          <div className={s.filterGroup}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>Lọc mã sự kiện:</span>
            <select
              className={s.formSelect}
              style={{ width: "auto" }}
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
            >
              <option value="">Tất cả mã Push Code</option>
              <option value="3">Mã 3: order_status_push</option>
              <option value="4">Mã 4: order_trackingno_push</option>
              <option value="8">Mã 8: reserved_stock_change</option>
              <option value="15">Mã 15: airwaybill_update</option>
              <option value="1">Mã 1: shop_authorization</option>
            </select>
          </div>
          <div className={s.filterGroup}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#4b5563" }}>Trạng thái:</span>
            <select
              className={s.formSelect}
              style={{ width: "auto" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công (200 OK)</option>
              <option value="FAILED">Thất bại (Failed)</option>
              <option value="PENDING">Đang chờ gửi (Pending)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Mã Code</th>
                <th>Đơn Hàng</th>
                <th>Địa Chỉ Nhận (Target URL)</th>
                <th>Trạng Thái</th>
                <th>HTTP Code</th>
                <th>Lần Thử</th>
                <th style={{ textAlign: "center" }}>Chi Tiết Payload</th>
              </tr>
            </thead>
            <tbody>
              {loadingLogs ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                    Đang tải nhật ký webhook...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className={s.mono} style={{ fontSize: 11 }}>
                      {formatTimestamp(log.created_at)}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: "#7b2cbf" }}>
                        Mã {log.push_code}
                      </span>
                    </td>
                    <td className={s.mono}>
                      {log.ordersn || <span style={{ color: "#aaa" }}>—</span>}
                    </td>
                    <td className={s.mono} style={{ fontSize: 11, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.target_url}>
                      {log.target_url}
                    </td>
                    <td>
                      {log.status === "SUCCESS" ? (
                        <span className={`${s.badge} ${s.badgeSuccess}`}>
                          <CheckCircle size={10} style={{ display: "inline", marginRight: 3 }} />
                          SUCCESS
                        </span>
                      ) : log.status === "FAILED" ? (
                        <span className={`${s.badge} ${s.badgeFailed}`}>
                          <AlertCircle size={10} style={{ display: "inline", marginRight: 3 }} />
                          FAILED
                        </span>
                      ) : (
                        <span className={`${s.badge} ${s.badgePending}`}>
                          <Clock size={10} style={{ display: "inline", marginRight: 3 }} />
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className={s.mono} style={{ fontWeight: 700 }}>
                      {log.response_status ? (
                        <span style={{ color: log.response_status === 200 ? "#059669" : "#dc2626" }}>
                          {log.response_status}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 600 }}>
                      {log.attempt_count}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className={s.btnSecondary}
                        onClick={() => setInspectLog(log)}
                        title="Xem payload JSON và header chữ ký"
                      >
                        <FileCode size={12} />
                        Xem Payload
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>
                    Chưa có lượt ghi webhook nào phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Modal */}
      {inspectLog && (
        <div className={modalS.modalBackdrop}>
          <div className={modalS.modalBox} style={{ maxWidth: 640 }}>
            <div className={modalS.modalHeader}>
              <h3 className={modalS.modalTitle}>
                Chi Tiết Webhook Log #{inspectLog.id} (Mã {inspectLog.push_code})
              </h3>
              <button type="button" className={modalS.modalCloseBtn} onClick={() => setInspectLog(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={modalS.modalBody}>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Target URL:</span>
                <div className={s.mono} style={{ fontSize: 12, marginTop: 2 }}>{inspectLog.target_url}</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Authorization Signature Header:</span>
                <div className={s.mono} style={{ fontSize: 11, background: "#f3f4f6", padding: "6px 10px", borderRadius: 4, marginTop: 4, wordBreak: "break-all" }}>
                  {inspectLog.auth_header || "(Trống)"}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>Payload JSON:</span>
                <pre className={s.jsonViewer} style={{ marginTop: 4 }}>
                  {JSON.stringify(inspectLog.payload, null, 2)}
                </pre>
              </div>
            </div>
            <div className={modalS.modalFooter}>
              <button type="button" className={s.btnSecondary} onClick={() => setInspectLog(null)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
