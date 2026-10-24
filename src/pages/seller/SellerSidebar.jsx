import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import s from "./SellerSidebar.module.css";

export const SIDEBAR_GROUPS = [
  {
    id: "orders",
    title: "Quản Lý Đơn Hàng",
    items: [
      { id: "orders_all", label: "Tất cả", aliases: ["orders", "all_orders"] },
      { id: "orders_mass_ship", label: "Giao Hàng Loạt" },
      { id: "orders_handover", label: "Bàn Giao Đơn Hàng" },
      { id: "returns", label: "Đơn Trả hàng/Hoàn tiền hoặc Đơn hủy", aliases: ["refunds"] },
      { id: "shipping_settings", label: "Cài Đặt Vận Chuyển" },
    ],
  },
  {
    id: "products",
    title: "Quản Lý Sản Phẩm",
    items: [
      { id: "products_all", label: "Tất Cả Sản Phẩm", aliases: ["products"] },
      { id: "products_new", label: "Thêm Sản Phẩm" },
      { id: "products_standards", label: "Sản phẩm tiêu chuẩn trên Shopee" },
    ],
  },
  {
    id: "marketing",
    title: "Kênh Marketing",
    items: [
      { id: "marketing", label: "Kênh Marketing" },
      { id: "marketing_auction", label: "Đấu Giá Rẻ Vô Địch" },
      { id: "marketing_ads", label: "Dịch Vụ Hiển Thị Shopee" },
      { id: "marketing_external_ads", label: "Quảng cáo Ngoại sàn" },
      { id: "marketing_kol", label: "Tăng Đơn Cùng KOL" },
      { id: "marketing_live", label: "Live & Video" },
      { id: "marketing_discounts", label: "Khuyến Mãi của Shop" },
      { id: "marketing_flash_sale", label: "Flash Sale Của Shop" },
      { id: "marketing_vouchers", label: "Mã Giảm Giá Của Shop" },
      { id: "marketing_campaigns", label: "Chương Trình Shopee" },
      { id: "marketing_global", label: "Bán Hàng Toàn Cầu" },
    ],
  },
  {
    id: "customer_service",
    title: "Chăm sóc khách hàng",
    items: [
      { id: "chat", label: "Quản lý Chat" },
      { id: "reviews", label: "Quản lý Đánh Giá" },
    ],
  },
  {
    id: "finance",
    title: "Tài Chính",
    items: [
      { id: "income", label: "Doanh Thu", aliases: ["finance"] },
      { id: "balance", label: "Số dư TK Shopee" },
      { id: "bank_accounts", label: "Tài Khoản Ngân Hàng" },
    ],
  },
  {
    id: "data",
    title: "Dữ Liệu",
    items: [
      { id: "analytics", label: "Phân Tích Bán Hàng" },
      { id: "performance", label: "Hiệu Quả Hoạt Động" },
    ],
  },
  {
    id: "shop_management",
    title: "Quản Lý Shop",
    items: [
      { id: "shop_profile", label: "Hồ Sơ Shop", aliases: ["shop"] },
      { id: "shop_decoration", label: "Trang Trí Shop" },
      { id: "shop_settings", label: "Thiết Lập Shop", aliases: ["settings"] },
      { id: "shop_disputes", label: "Quản lý các khiếu nại" },
      { id: "seller_missions", label: "Nhiệm Vụ Người Bán" },
    ],
  },
];

export function findActiveItem(activeTab) {
  const normTab = (activeTab || "orders_all").toLowerCase();
  for (const group of SIDEBAR_GROUPS) {
    for (const item of group.items) {
      if (item.id === normTab || item.aliases?.includes(normTab)) {
        return { group, item };
      }
    }
  }
  return { group: SIDEBAR_GROUPS[0], item: SIDEBAR_GROUPS[0].items[0] };
}

export default function SellerSidebar({
  activeTab = "orders_all",
  shopId = "",
  onSelectTab,
  isOpenOnMobile = false,
  onCloseMobile,
}) {
  const [params] = useSearchParams();
  const currentShopId = shopId || params.get("shop_id") || "";

  // All 7 groups expanded by default per reference screenshots
  const [expandedGroups, setExpandedGroups] = useState(() => {
    return Object.fromEntries(SIDEBAR_GROUPS.map((g) => [g.id, true]));
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const isItemActive = (item) => {
    const current = (activeTab || "orders_all").toLowerCase();
    return item.id === current || item.aliases?.includes(current);
  };

  const buildLink = (itemId) => {
    const p = new URLSearchParams();
    p.set("tab", itemId);
    if (currentShopId) p.set("shop_id", currentShopId);
    return `/seller?${p.toString()}`;
  };

  return (
    <>
      {isOpenOnMobile && (
        <div
          className={s.backdrop}
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={`${s.sidebar} ${isOpenOnMobile ? s.mobileOpen : ""}`}
        aria-label="Điều hướng Kênh Người Bán"
      >
      <nav className={s.nav}>
        {SIDEBAR_GROUPS.map((group) => {
          const isExpanded = expandedGroups[group.id] !== false;
          return (
            <div key={group.id} className={s.group}>
              <button
                type="button"
                className={s.groupHeader}
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isExpanded}
              >
                <span className={s.groupTitle}>{group.title}</span>
                <span className={s.chevron}>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {isExpanded && (
                <ul className={s.itemList}>
                  {group.items.map((item) => {
                    const active = isItemActive(item);
                    return (
                      <li key={item.id} className={s.item}>
                        <Link
                          to={buildLink(item.id)}
                          className={`${s.link} ${active ? s.active : ""}`}
                          onClick={(e) => {
                            if (onSelectTab) {
                              onSelectTab(item.id);
                            }
                          }}
                        >
                          <span className={s.itemLabel}>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      </aside>
    </>
  );
}
