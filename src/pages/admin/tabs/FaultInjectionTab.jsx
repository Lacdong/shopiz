import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  ZapOff,
  KeyRound,
  ShieldAlert,
  Clock,
  Gauge,
  RotateCcw,
  Save,
  CheckCircle2
} from "lucide-react";
import adminService from "../../../services/adminService";
import s from "./FaultInjection.module.css";

export default function FaultInjectionTab({ showToast }) {
  const [config, setConfig] = useState({
    rateLimitEnabled: false,
    rateLimitPerMin: 100,
    forceExpiredToken: false,
    forceInvalidSign: false,
    artificialDelayMs: 0,
    strictTimestamp: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await adminService.getFaultConfig();
      if (data) {
        setConfig({
          rateLimitEnabled: Boolean(data.rateLimitEnabled),
          rateLimitPerMin: data.rateLimitPerMin ?? 100,
          forceExpiredToken: Boolean(data.forceExpiredToken),
          forceInvalidSign: Boolean(data.forceInvalidSign),
          artificialDelayMs: data.artificialDelayMs ?? 0,
          strictTimestamp: data.strictTimestamp ?? true,
        });
      }
    } catch {
      // Use fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (updatedValues = {}) => {
    const payload = { ...config, ...updatedValues };
    setSaving(true);
    try {
      await adminService.updateFaultConfig(payload);
      setConfig(payload);
      showToast("Đã cập nhật cấu hình giả lập lỗi hệ thống");
    } catch (err) {
      showToast(err.message || "Lỗi khi cập nhật cấu hình lỗi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await adminService.resetFaultConfig();
      setConfig({
        rateLimitEnabled: false,
        rateLimitPerMin: 100,
        forceExpiredToken: false,
        forceInvalidSign: false,
        artificialDelayMs: 0,
        strictTimestamp: true,
      });
      showToast("Đã khôi phục toàn bộ thông số về trạng thái bình thường (Normal)");
    } catch (err) {
      showToast(err.message || "Lỗi khi khôi phục thông số", "error");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = [
    config.rateLimitEnabled,
    config.forceExpiredToken,
    config.forceInvalidSign,
    config.artificialDelayMs > 0,
  ].filter(Boolean).length;

  return (
    <div className={s.container}>
      {/* Intro Header */}
      <div className={s.introCard}>
        <div className={s.introLeft}>
          <h2 className={s.introTitle}>
            <AlertTriangle size={18} color="#dc2626" />
            Bảng Điều Khiển Giả Lập Lỗi & Tải Mạng (Fault Injection Engine)
          </h2>
          <p className={s.introDesc}>
            Mô phỏng tức thì các sự cố mạng thực tế (429 Rate Limit, Token hết hạn, Chữ ký sai, Độ trễ mạng cao) để kiểm thử cơ chế tự phục hồi, xử lý lỗi và trải nghiệm người dùng của ứng dụng tích hợp SmartOmni.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" className={s.btnReset} onClick={handleReset} disabled={saving}>
            <RotateCcw size={14} />
            Khôi phục chuẩn
          </button>
          <button type="button" className={s.btnSave} onClick={() => handleSave()} disabled={saving}>
            <Save size={14} />
            {saving ? "Đang lưu..." : "Lưu cài đặt"}
          </button>
        </div>
      </div>

      {activeCount > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
          <AlertTriangle size={16} />
          <span>Cảnh báo: Đang kích hoạt {activeCount} giả lập lỗi hệ thống. Một số API có thể phản hồi lỗi theo kịch bản test!</span>
        </div>
      )}

      {/* Fault Grid */}
      <div className={s.faultGrid}>
        {/* Fault 1: 429 Rate Limit */}
        <div className={`${s.faultCard} ${config.rateLimitEnabled ? s.activeFault : ""}`}>
          <div className={s.cardHead}>
            <div className={s.cardIconTitle}>
              <div className={s.cardIcon}>
                <Gauge size={18} />
              </div>
              <div>
                <h3 className={s.cardTitle}>Giả lập 429 Too Many Requests</h3>
                <p className={s.cardDesc}>
                  Khi bật, tất cả các yêu cầu gửi đến API vượt quá ngưỡng sẽ bị trả về mã lỗi HTTP 429 (Rate Limit Exceeded).
                </p>
              </div>
            </div>
            <label className={s.switch} title="Bật/Tắt giả lập 429">
              <input
                type="checkbox"
                checked={config.rateLimitEnabled}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConfig((prev) => ({ ...prev, rateLimitEnabled: val }));
                  handleSave({ rateLimitEnabled: val });
                }}
                aria-label="Kích hoạt 429 Rate Limit"
              />
              <span className={s.slider}></span>
            </label>
          </div>
          <div className={s.cardBottom}>
            <span>Ngưỡng giới hạn request/phút:</span>
            <input
              type="number"
              className={s.numInput}
              value={config.rateLimitPerMin}
              onChange={(e) => {
                const val = Number(e.target.value) || 100;
                setConfig((prev) => ({ ...prev, rateLimitPerMin: val }));
              }}
              onBlur={() => handleSave({ rateLimitPerMin: config.rateLimitPerMin })}
              min={1}
              max={1000}
            />
          </div>
        </div>

        {/* Fault 2: Force Expired Token */}
        <div className={`${s.faultCard} ${config.forceExpiredToken ? s.activeFault : ""}`}>
          <div className={s.cardHead}>
            <div className={s.cardIconTitle}>
              <div className={s.cardIcon}>
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className={s.cardTitle}>Giả lập Access Token Hết Hạn</h3>
                <p className={s.cardDesc}>
                  Cưỡng chế server từ chối Access Token và phản hồi mã lỗi `error_auth: Invalid access_token.` để test luồng tự động Refresh Token.
                </p>
              </div>
            </div>
            <label className={s.switch} title="Bật/Tắt giả lập token hết hạn">
              <input
                type="checkbox"
                checked={config.forceExpiredToken}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConfig((prev) => ({ ...prev, forceExpiredToken: val }));
                  handleSave({ forceExpiredToken: val });
                }}
                aria-label="Kích hoạt giả lập token hết hạn"
              />
              <span className={s.slider}></span>
            </label>
          </div>
          <div className={s.cardBottom}>
            <span>Mã lỗi phản hồi Shopee:</span>
            <span style={{ fontWeight: 700, color: "#dc2626" }}>error_auth</span>
          </div>
        </div>

        {/* Fault 3: Force Invalid Sign */}
        <div className={`${s.faultCard} ${config.forceInvalidSign ? s.activeFault : ""}`}>
          <div className={s.cardHead}>
            <div className={s.cardIconTitle}>
              <div className={s.cardIcon}>
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className={s.cardTitle}>Giả lập Chữ Ký HMAC Sai (Wrong Sign)</h3>
                <p className={s.cardDesc}>
                  Cưỡng chế backend bác bỏ chữ ký số HMAC-SHA256 hợp lệ và phản hồi `error_sign: Wrong sign.` để test cơ chế phát hiện giả mạo.
                </p>
              </div>
            </div>
            <label className={s.switch} title="Bật/Tắt giả lập chữ ký sai">
              <input
                type="checkbox"
                checked={config.forceInvalidSign}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConfig((prev) => ({ ...prev, forceInvalidSign: val }));
                  handleSave({ forceInvalidSign: val });
                }}
                aria-label="Kích hoạt giả lập chữ ký sai"
              />
              <span className={s.slider}></span>
            </label>
          </div>
          <div className={s.cardBottom}>
            <span>Mã lỗi phản hồi Shopee:</span>
            <span style={{ fontWeight: 700, color: "#dc2626" }}>error_sign</span>
          </div>
        </div>

        {/* Fault 4: Strict Timestamp Guard */}
        <div className={s.faultCard}>
          <div className={s.cardHead}>
            <div className={s.cardIconTitle}>
              <div className={s.cardIcon}>
                <Clock size={18} />
              </div>
              <div>
                <h3 className={s.cardTitle}>Kiểm Soát Độ Lệch Thời Gian (Timestamp Drift)</h3>
                <p className={s.cardDesc}>
                  Bắt buộc timestamp gửi lên phải nằm trong khoảng sai số cho phép 5 phút (300 giây) theo đúng chuẩn bảo mật Shopee Open Platform.
                </p>
              </div>
            </div>
            <label className={s.switch} title="Bật/Tắt kiểm soát timestamp">
              <input
                type="checkbox"
                checked={config.strictTimestamp}
                onChange={(e) => {
                  const val = e.target.checked;
                  setConfig((prev) => ({ ...prev, strictTimestamp: val }));
                  handleSave({ strictTimestamp: val });
                }}
                aria-label="Bật kiểm soát timestamp"
              />
              <span className={s.slider}></span>
            </label>
          </div>
          <div className={s.cardBottom}>
            <span>Cửa sổ kiểm tra an toàn:</span>
            <span style={{ fontWeight: 700, color: "#059669" }}>300 giây (5 phút)</span>
          </div>
        </div>

        {/* Fault 5: Artificial Latency Slider */}
        <div className={`${s.faultCard} ${config.artificialDelayMs > 0 ? s.activeFault : ""}`} style={{ gridColumn: "1 / -1" }}>
          <div className={s.cardHead}>
            <div className={s.cardIconTitle}>
              <div className={s.cardIcon}>
                <ZapOff size={18} />
              </div>
              <div>
                <h3 className={s.cardTitle}>Độ Trễ Mạng Giả Lập (Artificial Network Latency)</h3>
                <p className={s.cardDesc}>
                  Tạo độ trễ nhân tạo trước khi server gửi gói tin phản hồi để mô phỏng đường truyền mạng chậm, tải cao, hoặc kiểm tra skeleton/spinner loader trên UI client.
                </p>
              </div>
            </div>
            <div className={s.latencyValue}>{config.artificialDelayMs} ms</div>
          </div>
          <div style={{ marginTop: 8 }}>
            <input
              type="range"
              className={s.sliderInput}
              min={0}
              max={3000}
              step={100}
              value={config.artificialDelayMs}
              onChange={(e) => {
                const val = Number(e.target.value);
                setConfig((prev) => ({ ...prev, artificialDelayMs: val }));
              }}
              onMouseUp={() => handleSave({ artificialDelayMs: config.artificialDelayMs })}
              onTouchEnd={() => handleSave({ artificialDelayMs: config.artificialDelayMs })}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
              <span>0 ms (Tức thì)</span>
              <span>1.000 ms</span>
              <span>2.000 ms</span>
              <span>3.000 ms (Chậm)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
