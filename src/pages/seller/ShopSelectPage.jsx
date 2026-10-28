import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Box,
  Check,
  ClipboardList,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  Store,
} from "lucide-react";
import sellerService from "../../services/sellerService";
import s from "./ShopSelectPage.module.css";

const fallbackShops = [
  {
    shop_id: 727720655,
    shop_name: "SmartOmni Official Flagship",
    region: "VN",
    status: "NORMAL",
    products_count: 5,
    orders_count: 54,
    isMall: true,
  },
  {
    shop_id: 839910244,
    shop_name: "Hanoi Streetwear Co.",
    region: "VN",
    status: "NORMAL",
    products_count: 3,
    orders_count: 7,
    isMall: false,
  },
  {
    shop_id: 910283751,
    shop_name: "Saigon Modern Living",
    region: "VN",
    status: "NORMAL",
    products_count: 3,
    orders_count: 1,
    isMall: false,
  },
  {
    shop_id: "sonora",
    shop_name: "SONORA Official Store",
    region: "VN",
    status: "NORMAL",
    products_count: 8,
    orders_count: 12,
    isMall: true,
    isMock: true,
  },
];

export default function ShopSelectPage() {
  const navigate = useNavigate();
  const [shops, setShops] = useState(fallbackShops);
  const [loading, setLoading] = useState(true);
  const [activeShopId, setActiveShopId] = useState(() => {
    return localStorage.getItem("shopiz-active-seller-shop-id") || "727720655";
  });

  useEffect(() => {
    document.title = "Select Shop · Shopiz Seller Center";
    sellerService
      .getShops()
      .then((serverShops) => {
        if (serverShops && serverShops.length > 0) {
          const mappedServer = serverShops.map((s) => ({
            ...s,
            isMall: Number(s.shop_id) === 727720655,
          }));
          const sonoraShop = fallbackShops.find((f) => f.shop_id === "sonora");
          setShops([...mappedServer, sonoraShop]);
        }
      })
      .catch(() => {
        // Fall back to predefined list
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleSelectShop(shop) {
    const idStr = String(shop.shop_id);
    localStorage.setItem("shopiz-active-seller-shop-id", idStr);
    localStorage.setItem("shopiz-active-seller-shop-name", shop.shop_name);
    setActiveShopId(idStr);
    navigate(`/seller?shop_id=${encodeURIComponent(idStr)}`);
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.brandArea}>
          <Link to="/" className={s.logo}>
            <ShoppingBag size={26} strokeWidth={1.8} />
            <span>
              shopiz<span>.</span>
            </span>
          </Link>
          <span className={s.headerDivider} />
          <span className={s.headerTitle}>Seller Center</span>
        </div>
        <Link to="/" className={s.marketLink}>
          Back to Shopiz <ExternalLink size={13} />
        </Link>
      </header>

      <main className={s.main}>
        <div className={s.headingArea}>
          <span className={s.badge}>
            <Store size={14} /> Multi-Shop Management
          </span>
          <h1>Select Your Shop</h1>
          <p>
            Choose which store console and operational metrics you want to manage.
          </p>
        </div>

        <div className={s.grid}>
          {shops.map((shop) => {
            const isCurrent = String(shop.shop_id) === String(activeShopId);
            const initials = shop.shop_name.charAt(0);

            return (
              <div
                key={shop.shop_id}
                className={`${s.card} ${isCurrent ? s.cardActive : ""}`}
              >
                {isCurrent && (
                  <span className={s.cardActiveBadge}>Active Shop</span>
                )}
                <div className={s.shopHeader}>
                  <div className={s.shopAvatar}>{initials}</div>
                  <div className={s.shopInfo}>
                    <h2>{shop.shop_name}</h2>
                    <div className={s.shopSub}>
                      {shop.isMall && <span className={s.mallPill}>Mall</span>}
                      <span>ID: {shop.shop_id}</span>
                      <span>·</span>
                      <span>{shop.region || "VN"}</span>
                    </div>
                  </div>
                </div>

                <div className={s.shopMetrics}>
                  <div className={s.metricItem}>
                    <span className={s.metricLabel}>Products</span>
                    <span className={s.metricValue}>
                      {shop.products_count ?? 0}
                    </span>
                  </div>
                  <div className={s.metricItem}>
                    <span className={s.metricLabel}>Orders</span>
                    <span className={s.metricValue}>
                      {shop.orders_count ?? 0}
                    </span>
                  </div>
                </div>

                <div className={s.cardAction}>
                  <button
                    className={`${s.selectButton} ${isCurrent ? s.selectButtonOutline : ""}`}
                    onClick={() => handleSelectShop(shop)}
                  >
                    {isCurrent ? (
                      <>
                        <Check size={16} /> Enter Console
                      </>
                    ) : (
                      <>
                        Manage this Shop <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className={s.footer}>
        <span>© 2026 Shopiz Seller Center · Enterprise Multi-Shop Console</span>
      </footer>
    </div>
  );
}
