import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShieldAlert,
  Gavel,
  Radio,
  ZapOff,
  Layers,
  KeyRound,
  Store,
  ExternalLink,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from "lucide-react";
import adminService from "../../services/adminService";
import ArbitrationTab from "./tabs/ArbitrationTab";
import WebhookTab from "./tabs/WebhookTab";
import FaultInjectionTab from "./tabs/FaultInjectionTab";
import OrderLifecycleTab from "./tabs/OrderLifecycleTab";
import OAuthTab from "./tabs/OAuthTab";
import s from "./TestControl.module.css";

export default function TestControlPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "disputes";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [selectedShop, setSelectedShop] = useState("ALL");
  const [returnsData, setReturnsData] = useState({ summary: {}, returns: [] });
  const [kpiStats, setKpiStats] = useState({
    disputes: 0,
    webhookLogs: 0,
    activeFaults: 0,
    activeShops: 3,
  });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast notifier
  const showToast = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Returns & Disputes
      const retRes = await adminService.getReturns(selectedShop);
      setReturnsData(retRes);

      // 2. Webhooks
      let whCount = 0;
      try {
        const whRes = await adminService.getWebhookLogs();
        whCount = whRes?.total || whRes?.logs?.length || 0;
      } catch {
        // Ignore
      }

      // 3. Fault injection stats
      let activeFaults = 0;
      try {
        const cfg = await adminService.getFaultConfig();
        if (cfg?.rateLimitEnabled) activeFaults++;
        if (cfg?.forceExpiredToken) activeFaults++;
        if (cfg?.forceInvalidSign) activeFaults++;
        if (cfg?.artificialDelayMs > 0) activeFaults++;
        if (cfg?.strictTimestamp === false) activeFaults++;
      } catch {
        // Ignore
      }

      // 4. Shops
      let shopsTotal = 3;
      try {
        const shRes = await adminService.getShops();
        if (Array.isArray(shRes)) shopsTotal = shRes.length;
      } catch {
        // Ignore
      }

      const disputedCount =
        retRes?.summary?.disputed ??
        (retRes?.returns || []).filter((r) => r.status === "SELLER_DISPUTE").length;

      setKpiStats({
        disputes: disputedCount,
        webhookLogs: whCount,
        activeFaults,
        activeShops: shopsTotal,
      });
    } catch (err) {
      showToast(`Lỗi đồng bộ dữ liệu Admin: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedShop]);

  // Keep search params in sync if url changes directly
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  return (
    <div className={s.container}>
      {/* 1. Admin Top Utility Header */}
      <header className={s.header}>
        <div className={s.headerInner}>
          <div className={s.brandGroup}>
            <div className={s.brandIcon}>
              <Sliders size={22} />
            </div>
            <div className={s.brandTitles}>
              <div className={s.brandTitleRow}>
                <span className={s.brandName}>Shopiz Platform Console</span>
                <span className={s.badgeAdmin}>Admin Testbed</span>
              </div>
              <span className={s.brandSubtitle}>
                Shopee Open API v2 Simulator & Enterprise E-Commerce Operations
              </span>
            </div>
          </div>

          <div className={s.headerActions}>
            <div className={s.onlineBadge}>
              <span className={s.pulseDot}></span>
              Simulator Online (Port 8080)
            </div>
            <Link to="/seller/vouchers" className={`${s.navLinkBtn} ${s.sellerBtn}`}>
              <Store size={14} /> Kênh Người Bán
            </Link>
            <Link to="/" className={s.navLinkBtn}>
              <ExternalLink size={14} /> Cửa hàng Shopiz
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Admin Hero Purple Banner */}
      <div className={s.banner}>
        <div className={s.bannerInner}>
          <div className={s.bannerContent}>
            <h1>Trung tâm Kiểm thử & Điều khiển Nền tảng (Platform Test Control)</h1>
            <p>
              Bảng điều khiển quản trị toàn diện: Thẩm định khiếu nại Trả hàng/Hoàn tiền,
              giám sát & bắn webhook thời gian thực, mô phỏng lỗi API (Fault Injection),
              tua nhanh vòng đời đơn hàng và kiểm tra xác thực Shopee OAuth 2.0.
            </p>
          </div>

          <div className={s.shopSelectorWrap}>
            <span style={{ color: "#e9d5ff", fontWeight: 600 }}>Cửa hàng mục tiêu:</span>
            <select
              className={s.shopSelect}
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              <option value="ALL">Tất cả cửa hàng (Multi-Shop Aggregate)</option>
              <option value="727720655">727720655 - SmartOmni Official Flagship</option>
              <option value="839910244">839910244 - Hanoi Streetwear Co.</option>
              <option value="910283751">910283751 - Saigon Modern Living</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Main Body */}
      <main className={s.mainContent}>
        {/* KPI Summary Cards */}
        <div className={s.kpiGrid}>
          <div className={s.kpiCard}>
            <span className={s.kpiTitle}>Khiếu nại Chờ Shopee Phán quyết</span>
            <span className={s.kpiValue} style={{ color: "#dc2626" }}>
              {kpiStats.disputes}
            </span>
            <span className={s.kpiSubtitle}>
              {returnsData.returns?.length || 0} yêu cầu trả hàng trong hệ thống
            </span>
          </div>

          <div className={s.kpiCard}>
            <span className={s.kpiTitle}>Lịch sử Webhook Outbound</span>
            <span className={s.kpiValue} style={{ color: "#2563eb" }}>
              {kpiStats.webhookLogs}
            </span>
            <span className={s.kpiSubtitle}>Bản tin push events đã phát</span>
          </div>

          <div className={s.kpiCard}>
            <span className={s.kpiTitle}>Mô phỏng Lỗi Đang Kích hoạt</span>
            <span
              className={s.kpiValue}
              style={{ color: kpiStats.activeFaults > 0 ? "#d97706" : "#059669" }}
            >
              {kpiStats.activeFaults}
            </span>
            <span className={s.kpiSubtitle}>
              {kpiStats.activeFaults > 0 ? "Đang tiêm lỗi / độ trễ" : "Hệ thống hoạt động chuẩn"}
            </span>
          </div>

          <div className={s.kpiCard}>
            <span className={s.kpiTitle}>Gian hàng Đã Liên kết</span>
            <span className={s.kpiValue} style={{ color: "#7b2cbf" }}>
              {kpiStats.activeShops}
            </span>
            <span className={s.kpiSubtitle}>Multi-shop OAuth 2.0 connected</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={s.tabsNav}>
          <button
            className={`${s.tabBtn} ${activeTab === "disputes" ? s.activeTab : ""}`}
            onClick={() => handleTabChange("disputes")}
          >
            <Gavel size={16} />
            <span>Xử lý Khiếu nại & Trả hàng</span>
            {kpiStats.disputes > 0 && (
              <span className={s.tabBadge}>{kpiStats.disputes}</span>
            )}
          </button>

          <button
            className={`${s.tabBtn} ${activeTab === "webhooks" ? s.activeTab : ""}`}
            onClick={() => handleTabChange("webhooks")}
          >
            <Radio size={16} />
            <span>Webhook Trực quan & Giám sát</span>
            {kpiStats.webhookLogs > 0 && (
              <span className={s.tabBadge}>{kpiStats.webhookLogs}</span>
            )}
          </button>

          <button
            className={`${s.tabBtn} ${activeTab === "faults" ? s.activeTab : ""}`}
            onClick={() => handleTabChange("faults")}
          >
            <ZapOff size={16} />
            <span>Mô phỏng Lỗi & Latency (Fault Injection)</span>
            {kpiStats.activeFaults > 0 && (
              <span className={s.tabBadge} style={{ background: "#fef3c7", color: "#b45309" }}>
                Active
              </span>
            )}
          </button>

          <button
            className={`${s.tabBtn} ${activeTab === "orders" ? s.activeTab : ""}`}
            onClick={() => handleTabChange("orders")}
          >
            <Layers size={16} />
            <span>Vòng đời Đơn hàng & SLA (Order Lifecycle)</span>
          </button>

          <button
            className={`${s.tabBtn} ${activeTab === "oauth" ? s.activeTab : ""}`}
            onClick={() => handleTabChange("oauth")}
          >
            <KeyRound size={16} />
            <span>OAuth 2.0 & Quản lý Gian hàng</span>
          </button>
        </nav>

        {/* Tab Content Display */}
        {activeTab === "disputes" && (
          <ArbitrationTab
            returns={returnsData.returns}
            summary={returnsData.summary}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activeTab === "webhooks" && (
          <WebhookTab showToast={showToast} />
        )}

        {activeTab === "faults" && (
          <FaultInjectionTab showToast={showToast} />
        )}

        {activeTab === "orders" && (
          <OrderLifecycleTab showToast={showToast} />
        )}

        {activeTab === "oauth" && (
          <OAuthTab showToast={showToast} />
        )}
      </main>

      {/* Floating Toast Notification Stack */}
      <div className={s.toastWrap}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${s.toast} ${
              t.type === "success"
                ? s.toastSuccess
                : t.type === "error"
                ? s.toastError
                : ""
            }`}
          >
            {t.type === "success" && <CheckCircle2 size={16} />}
            {t.type === "error" && <AlertTriangle size={16} />}
            {t.type === "info" && <Info size={16} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
