import React from "react";
import { Link } from "react-router-dom";
import { Bell, CircleHelp, Store, ArrowLeftRight, ShoppingBag, Menu, Sliders } from "lucide-react";
import s from "./SellerHeader.module.css";

export default function SellerHeader({
  shopName = "SmartOmni Official Flagship",
  breadcrumb = "Tất cả",
  shopId = "",
  onToggleMobileMenu,
}) {
  return (
    <header className={s.header}>
      <div className={s.left}>
        <button
          type="button"
          className={s.mobileMenuBtn}
          onClick={onToggleMobileMenu}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <Link to="/seller?tab=orders_all" className={s.brand}>
          <div className={s.logoIcon}>
            <ShoppingBag size={22} strokeWidth={2.2} />
          </div>
          <div className={s.brandTitles}>
            <span className={s.shopeeTitle}>Shopee</span>
            <span className={s.subTitle}>Kênh Người Bán</span>
          </div>
        </Link>

        <div className={s.divider} />

        <nav className={s.breadcrumb} aria-label="Breadcrumb">
          <Link to="/seller?tab=orders_all" className={s.crumbLink}>
            Trang chủ
          </Link>
          <span className={s.crumbSeparator}>&gt;</span>
          <span className={s.crumbCurrent}>{breadcrumb}</span>
        </nav>
      </div>

      <div className={s.right}>
        <Link
          to="/test-control"
          className={s.switchShopBtn}
          style={{ background: "#f3e8ff", color: "#7b2cbf", borderColor: "#d8b4fe" }}
          title="Bảng điều khiển Admin & Test Simulator"
          aria-label="Test Control"
        >
          <Sliders size={14} />
          <span>Test Control</span>
        </Link>

        <Link
          to="/seller/select-shop"
          className={s.switchShopBtn}
          title="Chuyển đổi Shop đang quản lý"
          aria-label="Switch Shop"
        >
          <ArrowLeftRight size={14} />
          <span>Switch Shop</span>
        </Link>

        <div className={s.divider} />

        <div className={s.shopInfo}>
          <div className={s.shopAvatar}>
            <Store size={16} />
          </div>
          <h1 className={s.shopName}>{shopName}</h1>
        </div>

        <button
          type="button"
          className={s.iconBtn}
          title="Thông báo"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          className={s.iconBtn}
          title="Trợ giúp"
          aria-label="Help"
        >
          <CircleHelp size={18} />
        </button>
      </div>
    </header>
  );
}
