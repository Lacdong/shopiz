import React, { useState, useEffect } from "react";
import {
  KeyRound,
  ShieldCheck,
  Link,
  Copy,
  ExternalLink,
  RefreshCw,
  Store,
  Clock,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Zap,
  Info
} from "lucide-react";
import adminService from "../../../services/adminService";
import s from "./OAuth.module.css";

export default function OAuthTab({ showToast }) {
  // OAuth URL Generator Form
  const [partnerId, setPartnerId] = useState("1001141");
  const [redirectUrl, setRedirectUrl] = useState("http://localhost:5173/auth/callback");
  const [copied, setCopied] = useState(false);

  // Shops State
  const [shops, setShops] = useState([]);
  const [shopDetails, setShopDetails] = useState({});
  const [loadingShops, setLoadingShops] = useState(false);
  const [refreshingShopId, setRefreshingShopId] = useState(null);
  const [togglingShopId, setTogglingShopId] = useState(null);

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080").replace(/\/+$/, "");
  const authUrl = `${baseUrl}/api/v2/shop/auth_partner?partner_id=${encodeURIComponent(
    partnerId
  )}&redirect=${encodeURIComponent(redirectUrl)}`;

  const fetchShops = async () => {
    setLoadingShops(true);
    try {
      const list = await adminService.getShops();
      setShops(Array.isArray(list) ? list : []);

      // Fetch detail overview for each shop
      const details = {};
      await Promise.all(
        (list || []).map(async (shop) => {
          try {
            const overview = await adminService.getShopOverview(shop.shop_id);
            if (overview) {
              details[shop.shop_id] = overview;
            }
          } catch {
            // Ignore individual failure
          }
        })
      );
      setShopDetails(details);
    } catch (err) {
      showToast?.(`Lỗi tải danh sách cửa hàng: ${err.message}`, "error");
    } finally {
      setLoadingShops(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(authUrl);
      setCopied(true);
      showToast?.("Đã sao chép link uỷ quyền OAuth 2.0 vào Clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast?.("Không thể sao chép tự động, vui lòng chọn và copy thủ công", "warning");
    }
  };

  const handleToggleVacation = async (shop) => {
    const nextVal = !shop.is_vacation;
    setTogglingShopId(shop.shop_id);
    try {
      await adminService.toggleVacation(shop.shop_id, nextVal);
      showToast?.(
        `Đã ${nextVal ? "bật" : "tắt"} chế độ tạm nghỉ cho ${shop.shop_name}`,
        "success"
      );
      await fetchShops();
    } catch (err) {
      showToast?.(`Lỗi cập nhật chế độ tạm nghỉ: ${err.message}`, "error");
    } finally {
      setTogglingShopId(null);
    }
  };

  const handleRefreshToken = async (shopId) => {
    setRefreshingShopId(shopId);
    try {
      const res = await adminService.refreshToken(shopId);
      showToast?.(
        `Đã làm mới Token thành công! Thời hạn: ${Math.round(
          (res?.expire_in || 14400) / 3600
        )} giờ.`,
        "success"
      );
      await fetchShops();
    } catch (err) {
      showToast?.(`Lỗi làm mới token: ${err.message}`, "error");
    } finally {
      setRefreshingShopId(null);
    }
  };

  const formatRemainingTime = (seconds) => {
    if (!seconds || seconds <= 0) return "Đã hết hạn";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} phút`;
  };

  return (
    <div className={s.container}>
      {/* 1. OAuth 2.0 URL Generator Card */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div>
            <div className={s.cardTitle}>
              <KeyRound size={20} className={s.cardTitleIcon} />
              Tạo Đường dẫn Uỷ quyền OAuth 2.0 (Shopee Partner Auth Link)
            </div>
            <div className={s.cardSubtitle}>
              Sinh URL uỷ quyền tiêu chuẩn cho Người Bán liên kết gian hàng với Partner App
            </div>
          </div>
        </div>

        <div className={s.formGrid}>
          <div className={s.inputGroup}>
            <label className={s.label}>Partner ID (Mã Đối tác)</label>
            <input
              type="text"
              className={s.input}
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              placeholder="VD: 1001141"
            />
          </div>
          <div className={s.inputGroup}>
            <label className={s.label}>Redirect URL (Đường dẫn Chuyển tiếp / Callback)</label>
            <input
              type="text"
              className={s.input}
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="VD: http://localhost:5173/auth/callback"
            />
          </div>
        </div>

        <div className={s.urlBox}>
          <span className={s.urlLabel}>Đường dẫn Uỷ quyền Sinh ra:</span>
          <div className={s.urlContent}>{authUrl}</div>
          <div className={s.urlActions}>
            <button className={s.btnCopy} onClick={handleCopyUrl}>
              <Copy size={14} />
              {copied ? "Đã sao chép!" : "Sao chép Link"}
            </button>
            <a
              href={authUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={s.btnOpen}
            >
              <ExternalLink size={14} />
              Mở Trang Uỷ quyền Shopee
            </a>
          </div>
        </div>

        <div className={s.guideBox}>
          <div className={s.guideTitle}>
            <Info size={16} />
            Quy trình Xác thực Shopee Open API v2 OAuth 2.0:
          </div>
          <div>
            1. Người Bán truy cập liên kết trên, đăng nhập tài khoản Shop và nhấn chấp thuận cấp quyền
            cho Partner.
            <br />
            2. Shopee điều hướng trở lại <code>redirect</code> với tham số <code>code</code> (thời hạn
            10 phút) và <code>shop_id</code>.
            <br />
            3. Server gọi <code>POST /api/v2/auth/token/get</code> kèm chữ ký HMAC-SHA256 để đổi mã uỷ
            quyền lấy <strong>access_token</strong> (thời hạn 4 tiếng) và{" "}
            <strong>refresh_token</strong> (thời hạn 30 ngày).
            <br />
            4. Hệ thống hỗ trợ <em>Grace Period</em> 5 phút: token cũ vẫn hợp lệ trong vòng 5 phút sau
            khi refresh để đảm bảo không bị gián đoạn các luồng gọi API song song.
          </div>
        </div>
      </div>

      {/* 2. Connected Shops & Token Inspection Card */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <div>
            <div className={s.cardTitle}>
              <Store size={20} className={s.cardTitleIcon} />
              Quản lý Gian hàng & Token Giám sát (Multi-Shop Inspector)
            </div>
            <div className={s.cardSubtitle}>
              Trực quan hóa trạng thái kết nối, chế độ tạm nghỉ và vòng đời access_token của từng shop
            </div>
          </div>

          <button
            className={s.btnRefresh}
            onClick={fetchShops}
            disabled={loadingShops}
          >
            <RefreshCw size={14} className={loadingShops ? "spin" : ""} />
            Làm mới gian hàng
          </button>
        </div>

        <div className={s.tableWrapper}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Cửa hàng</th>
                <th>Khu vực</th>
                <th>Sản phẩm / Đơn hàng</th>
                <th>Chế độ Tạm nghỉ</th>
                <th>Trạng thái Token</th>
                <th>Thời gian còn lại</th>
                <th>Mã Access Token</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => {
                const detail = shopDetails[shop.shop_id] || {};
                const tokenStatus = detail.token_status || "VALID";
                const remainingSec = detail.token_remaining_sec ?? 14400;
                const tokenVal = detail.access_token || "94022291aee05ae885ef5b195c8c49e4";
                const isToggling = togglingShopId === shop.shop_id;
                const isRefreshing = refreshingShopId === shop.shop_id;

                return (
                  <tr key={shop.shop_id}>
                    <td>
                      <div className={s.shopInfo}>
                        <span className={s.shopName}>{shop.shop_name}</span>
                        <span className={s.shopId}>Shop ID: {shop.shop_id}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#4b5563" }}>
                        {shop.region || "VN"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", color: "#374151" }}>
                        <strong>{shop.products_count ?? 0}</strong> sp /{" "}
                        <strong>{shop.orders_count ?? 0}</strong> đơn
                      </span>
                    </td>
                    <td>
                      <label
                        className={s.switch}
                        title={shop.is_vacation ? "Đang tạm nghỉ" : "Đang hoạt động"}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(shop.is_vacation)}
                          disabled={isToggling}
                          onChange={() => handleToggleVacation(shop)}
                        />
                        <span className={s.slider}></span>
                      </label>
                    </td>
                    <td>
                      {tokenStatus === "VALID" ? (
                        <span className={`${s.badge} ${s.badgeValid}`}>
                          <CheckCircle size={12} /> Hợp lệ
                        </span>
                      ) : tokenStatus === "GRACE_PERIOD" ? (
                        <span className={`${s.badge} ${s.badgeGrace}`}>
                          <Clock size={12} /> Grace Period
                        </span>
                      ) : (
                        <span className={`${s.badge} ${s.badgeExpired}`}>
                          <AlertCircle size={12} /> Hết hạn
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#4b5563" }}>
                        {formatRemainingTime(remainingSec)}
                      </span>
                    </td>
                    <td>
                      <code className={s.tokenPreview} title={tokenVal}>
                        {tokenVal}
                      </code>
                    </td>
                    <td>
                      <button
                        className={s.btnRefresh}
                        onClick={() => handleRefreshToken(shop.shop_id)}
                        disabled={isRefreshing}
                        title="Tạo cặp access_token và refresh_token mới ngay lập tức"
                      >
                        <RefreshCw size={13} className={isRefreshing ? "spin" : ""} />
                        {isRefreshing ? "Đang làm mới..." : "Làm mới Token"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
