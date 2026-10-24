import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  Gift,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { products } from "../../data/catalog";
import api from "../../services/api";
import sellerService from "../../services/sellerService";
import catalogService from "../../services/catalogService";
import SellerHeader from "./SellerHeader";
import SellerSidebar, { findActiveItem } from "./SellerSidebar";
import SellerComingSoon from "./SellerComingSoon";
import AllOrdersPage from "./orders/AllOrdersPage";
import ProductsPage from "./products/ProductsPage";
import AddProductPage from "./products/AddProductPage";
import ReturnsPage from "./returns/ReturnsPage";
import s from "./SellerCenter.module.css";

const money = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);

const initialOrders = Array.from({ length: 8 }, (_, i) => ({
  id: `SPZ2610200${48 - i}`,
  buyer: ["minh.anh_98", "ngoclinh.store", "hoangnam.vn", "thao.nguyen"][i % 4],
  product: products[i % 4],
  quantity: (i % 3) + 1,
  status: [
    "pending",
    "pending",
    "shipping",
    "completed",
    "pending",
    "shipping",
    "completed",
    "cancelled",
  ][i],
}));

const statuses = {
  pending: "To Confirm",
  shipping: "Shipping",
  completed: "Completed",
  cancelled: "Cancelled",
};

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`${s.card} ${className}`}>
      <div className={s.cardHead}>
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function SellerCenter() {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab") || "orders_all";
  const { group: activeGroup, item: activeItem } = findActiveItem(rawTab);

  const [mobile, setMobile] = useState(false);
  const [period, setPeriod] = useState("today");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState(initialOrders);
  const [items, setItems] = useState(
    products
      .slice(0, 8)
      .map((p, i) => ({ ...p, stock: i < 3 ? 0 : 32 + i * 9, active: true })),
  );
  const [notice, setNotice] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [activeVouchers, setActiveVouchers] = useState([]);
  const urlShopId = params.get("shop_id");

  const resolveShopName = (id) => {
    const idStr = String(id || "");
    if (idStr === "sonora") return "SONORA Official Store";
    if (idStr === "839910244") return "Hanoi Streetwear Co.";
    if (idStr === "910283751") return "Saigon Modern Living";
    if (idStr === "727720655") return "SmartOmni Official Flagship";
    return (
      localStorage.getItem("shopiz-active-seller-shop-name") ||
      "SmartOmni Official Flagship"
    );
  };

  const [shopId, setShopId] = useState(() => {
    return (
      urlShopId ||
      localStorage.getItem("shopiz-active-seller-shop-id") ||
      "sonora"
    );
  });
  const [shopName, setShopName] = useState(() => {
    return resolveShopName(
      urlShopId ||
        localStorage.getItem("shopiz-active-seller-shop-id") ||
        "sonora",
    );
  });
  const [savedName, setSavedName] = useState(shopName);
  const [liveAnalytics, setLiveAnalytics] = useState(null);

  useEffect(() => {
    if (urlShopId && urlShopId !== shopId) {
      setShopId(urlShopId);
      localStorage.setItem("shopiz-active-seller-shop-id", urlShopId);
      const name = resolveShopName(urlShopId);
      setShopName(name);
      setSavedName(name);
    }
  }, [urlShopId, shopId]);

  useEffect(() => {
    if (shopId === "sonora") {
      setLiveAnalytics(null);
      setSavedName("SONORA Official Store");
      setShopName("SONORA Official Store");
      setOrders(initialOrders);
      setItems(
        products
          .slice(0, 8)
          .map((p, i) => ({ ...p, stock: i < 3 ? 0 : 32 + i * 9, active: true })),
      );
      setActiveVouchers([]);
      return;
    }

    const numericShopId = Number(shopId) || 727720655;

    // Fetch real backend analytics
    sellerService
      .getAnalytics(numericShopId, period)
      .then((res) => {
        if (res?.metrics) setLiveAnalytics(res);
      })
      .catch(() => {});

    // Fetch real backend orders
    sellerService
      .getOrders(numericShopId)
      .then((serverOrders) => {
        if (serverOrders && serverOrders.length > 0) {
          const mapped = serverOrders.map((o) => {
            const firstItem = o.items?.[0] || {};
            let status = "pending";
            if (o.order_status === "SHIPPED" || o.order_status === "PROCESSED")
              status = "shipping";
            else if (o.order_status === "COMPLETED") status = "completed";
            else if (
              o.order_status === "CANCELLED" ||
              o.order_status === "IN_CANCEL"
            )
              status = "cancelled";

            return {
              id: o.order_sn,
              buyer: o.buyer_username || o.recipient_name || "Shopper",
              product: {
                title: firstItem.item_name || "Order Item",
                image:
                  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=120&q=80",
                price: Number(o.total_amount) / 25000,
              },
              quantity: firstItem.quantity || 1,
              status,
              rawStatus: o.order_status,
              total: Number(o.total_amount),
              shippingCarrier: o.shipping_carrier,
              trackingNumber: o.packages?.[0]?.tracking_number,
              isBackend: true,
            };
          });
          setOrders(mapped);
        }
      })
      .catch(() => {});

    // Fetch real backend products & shop info
    catalogService
      .getShopDetail(numericShopId)
      .then((detail) => {
        if (!detail) return;
        setSavedName(detail.shop_name || "Official Store");
        setShopName(detail.shop_name || "Official Store");
        if (detail.products && detail.products.length > 0) {
          const mappedProducts = detail.products.map((p) => ({
            id: String(p.item_id),
            title: p.item_name,
            price: Number(p.original_price) / 25000,
            originalPriceVnd: Number(p.original_price),
            stock: p.models?.length
              ? p.models.reduce((acc, m) => acc + (m.seller_stock || 0), 0)
              : 50,
            active: p.item_status === "NORMAL",
            image:
              p.images?.[0] ||
              "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=120&q=80",
            isBackend: true,
          }));
          setItems(mappedProducts);
        }
      })
      .catch(() => {});

    // Fetch active vouchers
    api
      ?.get?.(`/simulator/promotions?shop_id=${numericShopId}`)
      .then((res) => {
        if (res?.vouchers) {
          const mappedVouchers = res.vouchers.map((v) => ({
            code: v.voucher_code,
            type: v.discount_percentage ? "percent" : "fixed",
            percent: v.discount_percentage,
            amount: Number(v.discount_value || 0),
            minimum: Number(v.min_basket_price || 0),
            expiresAt: v.end_time
              ? new Date(v.end_time * 1000).toLocaleDateString("vi-VN")
              : "Active",
          }));
          setActiveVouchers(mappedVouchers);
        }
      })
      .catch(() => {});
  }, [shopId, period]);

  function exportOrders() {
    const csv =
      "\uFEFFOrder ID,Buyer,Status,Total\n" +
      orders
        .map(
          (o) =>
            `${o.id},${o.buyer},${statuses[o.status]},${Math.round(
              o.product.price * 25000 * o.quantity,
            )}`,
        )
        .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "shopiz-sample-orders.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const filteredOrders = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      `${o.id} ${o.buyer} ${o.product.title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const productFilter = params.get("stock") === "empty" ? "stock" : filter;
  const filteredItems = items.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) &&
      (productFilter === "all" ||
        (productFilter === "stock"
          ? p.stock === 0
          : productFilter === "active"
            ? p.active
            : !p.active)),
  );

  const metrics = liveAnalytics?.metrics
    ? [
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(liveAnalytics.metrics.revenue),
        String(liveAnalytics.metrics.orders_count),
        new Intl.NumberFormat("en-US").format(
          liveAnalytics.metrics.visitors_count || 1284,
        ),
        `${liveAnalytics.metrics.conversion_rate || 3.74}%`,
      ]
    : period === "today"
      ? ["₫12,850,000", "48", "1,284", "3.74%"]
      : ["₫86,420,000", "326", "8,910", "3.66%"];

  const chart = (
    <>
      <div className={s.chartLegend}>
        <span>
          <i /> Doanh thu
        </span>
        <span>
          <i /> Kỳ trước
        </span>
      </div>
      <div
        className={s.chart}
        role="img"
        aria-label={`Biểu đồ doanh thu ${period === "today" ? "hôm nay" : "7 ngày qua"}`}
      >
        <div className={s.chartLabels}>
          <span>15m</span>
          <span>10m</span>
          <span>5m</span>
          <span>0</span>
        </div>
        <svg viewBox="0 0 700 160" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="sellerArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand)" stopOpacity=".18" />
              <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[10, 55, 100, 145].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="700"
              y2={y}
              stroke="var(--border)"
              strokeDasharray="4 4"
            />
          ))}
          <path
            d="M0 140 C40 138 55 115 90 125 S145 112 175 119 S230 80 265 96 S330 65 350 82 S410 110 440 75 S505 60 530 70 S590 35 620 50 S670 30 700 35"
            fill="none"
            stroke="var(--disabled)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <path
            d={
              period === "today"
                ? "M0 138 C35 140 55 125 85 130 S140 92 175 105 S230 70 265 89 S325 40 350 60 S410 93 440 58 S490 24 525 40 S575 60 610 30 S665 32 700 10 L700 160 L0 160 Z"
                : "M0 145 C60 145 70 90 120 105 S190 50 240 85 S320 15 380 55 S460 70 510 30 S600 45 700 6 L700 160 L0 160 Z"
            }
            fill="url(#sellerArea)"
            stroke="var(--brand)"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
        </svg>
        <div className={s.chartTimes}>
          {(period === "today"
            ? ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"]
            : [
                "14/10",
                "15/10",
                "16/10",
                "17/10",
                "18/10",
                "19/10",
                "20/10",
              ]
          ).map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </>
  );

  const orderTable = (list, compact = false) => (
    <div className={s.tableScroll}>
      <table>
        <thead>
          <tr>
            <th>Sản phẩm / Mã đơn hàng</th>
            <th>Người mua</th>
            <th>Tổng thanh toán</th>
            <th>Trạng thái</th>
            {!compact && <th>Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {list.map((o) => (
            <tr key={o.id}>
              <td>
                <div className={s.productCell}>
                  <img src={o.product.image} alt="" />
                  <div>
                    <strong>{o.product.title.split(" · ")[0]}</strong>
                    <small>
                      #{o.id} · SL: {o.quantity}
                    </small>
                  </div>
                </div>
              </td>
              <td>{o.buyer}</td>
              <td className={s.amount}>
                {money(o.total || o.product.price * 25000 * o.quantity)}
              </td>
              <td>
                <span className={`${s.badge} ${s[o.status]}`}>
                  {statuses[o.status]}
                </span>
              </td>
              {!compact && (
                <td>
                  {o.status === "pending" ? (
                    <button
                      className={s.textButton}
                      onClick={() => {
                        if (o.isBackend) {
                          sellerService
                            .shipOrder(o.id)
                            .then(() => {
                              setOrders(
                                orders.map((x) =>
                                  x.id === o.id
                                    ? { ...x, status: "shipping" }
                                    : x,
                                ),
                              );
                              setNotice(
                                `Đơn hàng #${o.id} đã được chuẩn bị giao!`,
                              );
                            })
                            .catch(() => {
                              setOrders(
                                orders.map((x) =>
                                  x.id === o.id
                                    ? { ...x, status: "shipping" }
                                    : x,
                                ),
                              );
                              setNotice(
                                `Đơn hàng #${o.id} đã được chuẩn bị giao!`,
                              );
                            });
                        } else {
                          setOrders(
                            orders.map((x) =>
                              x.id === o.id ? { ...x, status: "shipping" } : x,
                            ),
                          );
                          setNotice(`Đã xác nhận đơn hàng #${o.id}`);
                        }
                      }}
                    >
                      Chuẩn bị hàng
                    </button>
                  ) : o.isBackend &&
                    (o.status === "shipping" || o.status === "completed") ? (
                    <a
                      href={sellerService.getAwbDownloadUrl(o.id)}
                      target="_blank"
                      rel="noreferrer"
                      className={s.textButton}
                      title="Tải phiếu giao hàng AWB (PDF)"
                    >
                      In phiếu AWB
                    </a>
                  ) : (
                    <span className={s.muted}>—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && (
        <div className={s.empty}>
          <Package size={32} />
          <p>Không tìm thấy đơn hàng phù hợp.</p>
        </div>
      )}
    </div>
  );

  // Check if current tab is one of the implemented views
  const isOrdersTab =
    activeItem.id === "orders_all" || rawTab === "orders" || rawTab === "overview";
  const isProductsTab =
    activeItem.id === "products_all" || rawTab === "products";
  const isCreatingProduct = isProductsTab && params.get("product_mode") === "create";
  const isReturnsTab =
    activeItem.id === "returns" || activeItem.id === "shop_disputes" || rawTab === "returns";
  const isMarketingTab =
    activeItem.id === "marketing" || rawTab === "marketing";
  const isAnalyticsTab =
    activeItem.id === "analytics" || rawTab === "analytics";
  const isFinanceTab =
    activeItem.id === "income" || rawTab === "finance";
  const isShopProfileTab =
    activeItem.id === "shop_profile" || rawTab === "shop";
  const isShopSettingsTab =
    activeItem.id === "shop_settings" || rawTab === "settings";

  const isImplemented =
    isOrdersTab ||
    isProductsTab ||
    isReturnsTab ||
    isMarketingTab ||
    isAnalyticsTab ||
    isFinanceTab ||
    isShopProfileTab ||
    isShopSettingsTab;

  const activeShopName = resolveShopName(urlShopId || shopId) || savedName;
  const openProductWorkflow = () => {
    const next = new URLSearchParams(params);
    next.set("tab", "products_all");
    next.set("product_mode", "create");
    setParams(next);
  };
  const closeProductWorkflow = (status) => {
    const next = new URLSearchParams(params);
    next.delete("product_mode");
    next.set("tab", "products_all");
    if (status) next.set("prod_status", status === "UNLIST" ? "unlisted" : "active");
    setParams(next, { replace: true });
  };

  return (
    <div className={s.seller}>
      <SellerHeader
        shopName={activeShopName}
        breadcrumb={isCreatingProduct ? "Sản phẩm > Thêm 1 sản phẩm mới" : activeItem.label}
        shopId={shopId}
        onToggleMobileMenu={() => setMobile((m) => !m)}
      />

      <div style={{ display: "flex", width: "100%", minHeight: "calc(100vh - 56px)", overflowX: "hidden" }}>
        <SellerSidebar
          activeTab={activeItem.id}
          shopId={shopId}
          isOpenOnMobile={mobile}
          onCloseMobile={() => setMobile(false)}
          onSelectTab={() => setMobile(false)}
        />

        <main className={s.main} style={{ flex: 1, minWidth: 0, marginLeft: 0, padding: "16px 16px 40px", maxWidth: "100%", boxSizing: "border-box", overflowX: "hidden" }}>
          {!isImplemented ? (
            <SellerComingSoon
              featureName={activeItem.label}
              groupName={activeGroup.title}
            />
          ) : isCreatingProduct ? (
            <AddProductPage
              shopId={Number(shopId) || 727720655}
              onCancel={() => closeProductWorkflow()}
              onSaved={(status) => closeProductWorkflow(status)}
            />
          ) : isOrdersTab ? (
            <AllOrdersPage shopId={Number(shopId) || 727720655} />
          ) : isProductsTab ? (
            <ProductsPage shopId={Number(shopId) || 727720655} onCreateProduct={openProductWorkflow} />
          ) : isReturnsTab ? (
            <ReturnsPage shopId={Number(shopId) || 727720655} />
          ) : isMarketingTab ? (
            <>
              <div className={s.marketingHero}>
                <div>
                  <span>KÊNH MARKETING SHOPEE</span>
                  <h2>
                    Tăng trưởng doanh thu.
                    <br />
                    Tiếp cận hàng triệu khách hàng.
                  </h2>
                  <p>Khám phá các công cụ thúc đẩy doanh số bán hàng của shop.</p>
                </div>
                <Gift size={110} strokeWidth={0.9} />
              </div>
              {activeVouchers.length > 0 && (
                <Card title="Chương trình Khuyến mãi & Voucher của Shop">
                  <div className={s.tableScroll}>
                    <table>
                      <thead>
                        <tr>
                          <th>Mã Voucher</th>
                          <th>Ưu đãi</th>
                          <th>Đơn tối thiểu</th>
                          <th>Trạng thái</th>
                          <th>Thời hạn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeVouchers.map((v) => (
                          <tr key={v.code}>
                            <td>
                              <strong>{v.code}</strong>
                            </td>
                            <td>
                              {v.type === "percent"
                                ? `Giảm ${v.percent}%`
                                : `Giảm ${money(v.amount)}`}
                            </td>
                            <td>{money(v.minimum)}</td>
                            <td>
                              <span className={`${s.badge} ${s.completed}`}>
                                Đang diễn ra
                              </span>
                            </td>
                            <td>{v.expiresAt || "Đang hoạt động"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
              <div className={s.marketingGrid}>
                {[
                  [
                    Ticket,
                    "Mã Giảm Giá Của Shop",
                    "Tạo voucher thu hút người mua quay lại.",
                    "VOUCHER10",
                  ],
                  [
                    Megaphone,
                    "Chiến Dịch Siêu Sale",
                    "Tham gia các đợt bùng nổ đơn hàng cùng Shopee.",
                    "11.11",
                  ],
                  [
                    Gift,
                    "Combo Khuyến Mãi",
                    "Khuyến khích giỏ hàng giá trị lớn với gói ưu đãi.",
                    "COMBO",
                  ],
                ].map(([Icon, title, text, code]) => (
                  <Card key={title} title={title}>
                    <div className={s.marketingBody}>
                      <Icon size={30} />
                      <p>{text}</p>
                      <button
                        className={
                          campaigns.includes(code) ? s.outline : s.primary
                        }
                        disabled={campaigns.includes(code)}
                        onClick={() => {
                          setCampaigns([...campaigns, code]);
                          setNotice(`Đã kích hoạt ${title} cho phiên làm việc này.`);
                        }}
                      >
                        {campaigns.includes(code) ? (
                          <>
                            <Check size={16} /> Đã kích hoạt
                          </>
                        ) : (
                          <>
                            Bắt đầu <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : isAnalyticsTab ? (
            <Card
              title="Phân Tích Bán Hàng"
              action={
                <div className={s.period}>
                  <button
                    className={period === "today" ? s.selected : ""}
                    onClick={() => setPeriod("today")}
                  >
                    Hôm nay
                  </button>
                  <button
                    className={period === "week" ? s.selected : ""}
                    onClick={() => setPeriod("week")}
                  >
                    7 ngày qua
                  </button>
                </div>
              }
            >
              <div className={s.stats}>
                {[
                  ["Doanh thu", "+18.6%", Wallet],
                  ["Đơn hàng", "+12.4%", ShoppingBag],
                  ["Lượt truy cập", "+8.2%", Users],
                  ["Tỷ lệ chuyển đổi", "+2.1%", BarChart3],
                ].map(([label, growth, Icon], i) => (
                  <div key={label}>
                    <div className={s.statTitle}>
                      {label}
                      <Icon size={15} />
                    </div>
                    <strong>{metrics[i]}</strong>
                    <p>
                      <span>
                        <ArrowUpRight size={13} />
                        {growth}
                      </span>{" "}
                      so với kỳ trước
                    </p>
                  </div>
                ))}
              </div>
              {chart}
              <div className={s.chartFoot}>
                <span>Cập nhật lúc: 09:41 · 20/10/2026</span>
                <button className={s.textButton} onClick={exportOrders}>
                  Xuất dữ liệu bán hàng <ChevronRight size={14} />
                </button>
              </div>
            </Card>
          ) : isFinanceTab ? (
            <>
              <div className={s.finance}>
                <Wallet size={34} />
                <div>
                  <p>Số dư ví người bán (ước tính)</p>
                  <h2>{money(28450000)}</h2>
                </div>
                <span>
                  <ShieldCheck size={17} /> Thanh toán an toàn qua Escrow
                </span>
              </div>
              <Card title="Lịch Sử Doanh Thu Đã Quyết Toán">
                <div className={s.tableScroll}>
                  <table>
                    <thead>
                      <tr>
                        <th>Mã giao dịch</th>
                        <th>Nội dung</th>
                        <th>Ngày</th>
                        <th>Số tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2, 3].map((i) => (
                        <tr key={i}>
                          <td>TXN202610{20 - i}</td>
                          <td>Doanh thu đơn hàng đã giao thành công</td>
                          <td>{20 - i}/10/2026</td>
                          <td className={s.positive}>
                            +{money(1250000 + i * 450000)}
                          </td>
                          <td>
                            <span className={`${s.badge} ${s.completed}`}>
                              Đã giải ngân
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : isShopProfileTab || isShopSettingsTab ? (
            <Card
              title={
                isShopProfileTab ? "Thông Tin Hồ Sơ Shop" : "Thiết Lập Shop"
              }
            >
              <form
                className={s.shopForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  setSavedName(shopName.trim());
                  setNotice("Đã lưu thông tin Shop thành công!");
                }}
              >
                <div className={s.profileIntro}>
                  <span className={s.shopAvatar}>S</span>
                  <div>
                    <strong>{savedName}</strong>
                    <p>
                      <Star size={14} /> 4.9 · Shop Yêu Thích
                    </p>
                  </div>
                </div>
                <label>
                  Tên Shop
                  <input
                    required
                    maxLength={60}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </label>
                <label>
                  Mô tả Shop
                  <textarea
                    defaultValue="Trải nghiệm mua sắm chính hãng với hàng ngàn ưu đãi hấp dẫn tại Kênh Người Bán."
                    maxLength={500}
                  />
                </label>
                {isShopSettingsTab && (
                  <label className={s.checkbox}>
                    <input type="checkbox" defaultChecked /> Nhận thông báo khi có
                    đơn hàng mới
                  </label>
                )}
                <p className={s.muted}>
                  Thay đổi được đồng bộ cho phiên làm việc hiện tại.
                </p>
                <button className={s.primary} type="submit">
                  <Check size={16} /> Lưu thay đổi
                </button>
              </form>
            </Card>
          ) : null}

          <footer className={s.footer}>
            <span>© 2026 Shopee Việt Nam. Tất cả quyền được bảo lưu.</span>
            <span>
              <CircleHelp size={14} /> Shopee Kênh Người Bán
            </span>
          </footer>
        </main>
      </div>

      {notice && (
        <div className={s.toast} role="status">
          <Check size={17} />
          {notice}
          <button
            className={s.iconButton}
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
