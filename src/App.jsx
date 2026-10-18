import React, { useEffect } from "react";
import {
  Link,
  Outlet,
  Route,
  Routes,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  Star,
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import {
  BannerCarousel,
  QuickAccess,
  CategoryGrid,
} from "./components/Discovery";
import {
  FlashDeals,
  MallStrip,
  TopSearches,
  ProductGrid,
  TrustBar,
} from "./components/Commerce";
import { products, money } from "./data/catalog";
import s from "./App.module.css";
import {
  FlashSalePage,
  TopProductsPage,
  MallPage,
} from "./components/CollectionPages";
function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo(0, 0);
  }, [pathname, search, hash]);
  return null;
}
export function MarketplaceLayout() {
  return (
    <>
      <ScrollManager />
      <Header />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
function Home() {
  return (
    <>
      <div className={s.top}>
        <BannerCarousel />
        <QuickAccess />
      </div>
      <CategoryGrid />
      <FlashDeals />
      <MallStrip />
      <TopSearches />
      <ProductGrid />
      <TrustBar />
    </>
  );
}
function Results() {
  const { name } = useParams();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const query = params.get("q") || "";
  const collection = pathname.startsWith("/collection/");
  let items = products;
  let title = name || `Search results for “${query}”`;
  if (pathname.startsWith("/category/"))
    items = products.filter((p) => p.category === name);
  else if (collection) {
    title = name
      .split("-")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(" ");
    if (name === "mall") items = products.filter((p) => p.mall);
    if (name === "flash-deals" || name === "daily-deals")
      items = [...products].sort((a, b) => b.discount - a.discount);
    if (name === "top-products")
      items = [...products].sort((a, b) => b.sold - a.sold);
    if (name === "new-arrivals") items = [...products].reverse();
  } else {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    items = products.filter((p) =>
      words.every((w) => `${p.title} ${p.category}`.toLowerCase().includes(w)),
    );
    if (params.get("max"))
      items = items.filter((p) => p.price <= Number(params.get("max")));
    if (params.get("max"))
      title = `Finds under ${money(Number(params.get("max")))}`;
  }
  return (
    <div className={s.routePage}>
      <Link className={s.back} to="/">
        <ArrowLeft size={14} /> Back to shopping
      </Link>
      <h1>{title}</h1>
      <p className={s.muted}>{items.length} curated finds for your everyday.</p>
      <ProductGrid
        key={pathname + params.toString()}
        items={items}
        title="EXPLORE THE FINDS"
        subtitle="Selected for you"
        loadMore={false}
      />
      <TrustBar />
    </div>
  );
}
function ProductPage() {
  const { id } = useParams();
  const p = products.find((x) => x.id === id);
  if (!p) return <Placeholder title="Product not found" />;
  return (
    <div className={s.routePage}>
      <Link className={s.back} to="/">
        <ArrowLeft size={14} /> Back to shopping
      </Link>
      <div className={s.productDetail}>
        <img src={p.image} alt={p.title} />
        <div>
          <span className={s.kicker}>{p.category}</span>
          <h1>{p.title}</h1>
          <p className={s.productRating}>
            <Star size={15} fill="currentColor" /> {p.rating}{" "}
            <span>· {p.sold.toLocaleString()} sold</span>
          </p>
          <div className={s.detailPrice}>
            {money(p.price)} <del>{money(p.original)}</del>
            <small>{p.discount}% OFF</small>
          </div>
          <p className={s.muted}>
            An everyday favorite, selected for the Shopiz marketplace. Ships
            from {p.location}.
          </p>
          <p className={s.notice}>
            <ShieldCheck size={18} /> This is a simulator preview. Checkout is
            not available.
          </p>
          <Link className={s.primary} to="/cart">
            <ShoppingCart size={16} /> View shopping cart
          </Link>
        </div>
      </div>
      <ProductGrid
        items={products.filter((x) => x.id !== id).slice(0, 6)}
        title="YOU MAY ALSO LIKE"
        loadMore={false}
      />
    </div>
  );
}
const pageNames = {
  seller: "Seller Center",
  download: "Get the Shopiz App",
  notifications: "Notifications",
  help: "How can we help?",
  language: "Language & Region",
  login: "Welcome back",
  signup: "Join Shopiz",
  vouchers: "A little extra, on us",
};
function Placeholder({ title }) {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const { slug, name } = useParams();
  const heading =
    title ||
    pageNames[path] ||
    (slug || name || "Page not found")
      .split("-")
      .map((x) => x[0]?.toUpperCase() + x.slice(1))
      .join(" ");
  return (
    <div className={s.placeholder}>
      <span className={s.placeholderIcon}>
        {path === "cart" ? (
          <ShoppingCart size={35} strokeWidth={1.3} />
        ) : (
          <ShoppingBag size={35} strokeWidth={1.3} />
        )}
      </span>
      <span className={s.kicker}>THE SHOPIZ MARKETPLACE</span>
      <h1>{path === "cart" ? "Your next favorite is waiting." : heading}</h1>
      <p>
        {path === "cart"
          ? "Your shopping cart is empty. Explore our everyday finds and discover something you love."
          : path === "seller"
            ? "Your next chapter as a seller starts here. Seller Center is coming in a future simulator release."
            : "This page is part of the Shopiz simulator and is coming soon. There’s plenty to discover on the marketplace today."}
      </p>
      <Link className={s.primary} to="/">
        Explore the marketplace <ArrowRight size={16} />
      </Link>
    </div>
  );
}
export default function App() {
  return (
    <Routes>
      <Route element={<MarketplaceLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Results />} />
        <Route path="category/:name" element={<Results />} />
        <Route path="collection/flash-deals" element={<FlashSalePage />} />
        <Route path="flash-sale" element={<FlashSalePage />} />
        <Route path="collection/top-products" element={<TopProductsPage />} />
        <Route path="top-product" element={<TopProductsPage />} />
        <Route path="collection/mall" element={<MallPage />} />
        <Route path="shopiz-mall" element={<MallPage />} />
        <Route path="collection/:name" element={<Results />} />
        <Route path="product/:id" element={<ProductPage />} />
        {[
          "cart",
          "seller",
          "download",
          "notifications",
          "help",
          "language",
          "login",
          "signup",
          "vouchers",
          "info/:slug",
          "social/:name",
          "*",
        ].map((path) => (
          <Route key={path} path={path} element={<Placeholder />} />
        ))}
      </Route>
    </Routes>
  );
}
