import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Check,
  ChevronRight,
  Crown,
  Globe,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trophy,
  Zap,
} from "lucide-react";
import { products, topSearches } from "../data/catalog";
import { BannerCarousel, CategoryGrid } from "./Discovery";
import { Countdown, ProductCard, ProductGrid, TrustBar } from "./Commerce";
import s from "./CollectionPages.module.css";

const filters = [
  "All",
  "Electronics",
  "Home & Living",
  "Men’s Fashion",
  "Beauty & Skincare",
  "Bags & Accessories",
  "Shoes",
  "Watches",
  "Sports & Outdoors",
  "Gaming",
];
const sessions = [
  { time: "Now", label: "Live deals" },
  { time: "12:00", label: "Coming up" },
  { time: "15:00", label: "Coming up" },
  { time: "18:00", label: "Coming up" },
  { time: "21:00", label: "Tonight’s picks" },
];
const brands = [
  {
    id: "sonora",
    name: "SONORA",
    tagline: "Sound made personal.",
    offer: "Up to 40% off",
    products: ["1", "5", "13", "15"],
  },
  {
    id: "atelier",
    name: "atelier.",
    tagline: "Considered essentials.",
    offer: "Your everyday, elevated",
    products: ["6", "8", "9", "14", "16", "18"],
  },
  {
    id: "north-form",
    name: "NORTH / FORM",
    tagline: "Made for the everyday.",
    offer: "New season essentials",
    products: ["2", "3", "4", "7", "10", "11", "12", "17"],
  },
];
function Breadcrumb({ label }) {
  return (
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <ChevronRight size={12} />
      <span>{label}</span>
    </nav>
  );
}
function CategoryTabs({ selected, onSelect }) {
  return (
    <div
      className={s.categoryTabs}
      role="group"
      aria-label="Filter by category"
    >
      {filters.map((name) => (
        <button
          key={name}
          type="button"
          aria-pressed={selected === name}
          className={selected === name ? s.selected : ""}
          onClick={() => onSelect(name)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
function EmptyState() {
  return (
    <div className={s.empty}>
      <ShoppingBag size={28} />
      <h2>No products in this selection</h2>
      <p>Choose another category to discover more finds.</p>
    </div>
  );
}

export function FlashSalePage() {
  const [session, setSession] = useState(0);
  const [category, setCategory] = useState("All");
  const [reminders, setReminders] = useState([]);
  const [sort, setSort] = useState("discount");
  const items = products
    .filter((p) => category === "All" || p.category === category)
    .sort((a, b) =>
      sort === "price" ? a.price - b.price : b.discount - a.discount,
    );
  const upcoming = session !== 0;
  const toggleReminder = (id) =>
    setReminders((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  return (
    <div className={s.page}>
      <Breadcrumb label="Flash Sale" />
      <div className={s.flashHeading}>
        <h1>
          <Zap fill="currentColor" /> FLASH SALE
        </h1>
        <div>
          <span>
            {upcoming
              ? `Next session at ${sessions[session].time}`
              : "These deals won’t wait"}
          </span>
          {!upcoming && <Countdown />}
        </div>
      </div>
      <section className={s.flashHero}>
        <div>
          <span className={s.eyebrow}>BIG FINDS. SMALL PRICES.</span>
          <h2>
            Good timing.
            <br />
            Even better deals.
          </h2>
          <p>Everyday favorites at prices worth catching.</p>
          <a href="#sale-products">
            Explore the deals <ArrowRight size={15} />
          </a>
        </div>
        <div className={s.flashArtwork}>
          <Zap size={130} strokeWidth={1} />
          <span>
            UP TO
            <strong>{Math.max(...products.map((p) => p.discount))}%</strong>OFF
            SELECTED FINDS
          </span>
        </div>
      </section>
      <div
        className={s.sessionTabs}
        role="group"
        aria-label="Flash sale sessions"
      >
        {sessions.map((item, index) => (
          <button
            key={item.time}
            aria-pressed={session === index}
            className={session === index ? s.liveSession : ""}
            onClick={() => setSession(index)}
          >
            <strong>{item.time}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <CategoryTabs selected={category} onSelect={setCategory} />
      <div className={s.toolbar} id="sale-products">
        <span>
          {items.length} deals ·{" "}
          {upcoming ? `Preview for ${sessions[session].time}` : "Live now"}
        </span>
        <label>
          Sort by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="discount">Biggest discount</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      {upcoming && (
        <p className={s.sessionNotice}>
          Preview an upcoming simulator session. Reminders are saved for this
          visit only; no notifications are sent.
        </p>
      )}
      {items.length ? (
        <div className={s.dealGrid}>
          {items.map((p) => (
            <article className={s.dealCard} key={p.id}>
              <ProductCard product={p} />
              <div className={s.dealAction}>
                <div className={s.stock}>
                  <span style={{ width: `${p.progress}%` }} />
                  <small>
                    {upcoming ? "COMING SOON" : `${p.progress}% SOLD`}
                  </small>
                </div>
                {upcoming ? (
                  <button
                    aria-pressed={reminders.includes(`${session}-${p.id}`)}
                    onClick={() => toggleReminder(`${session}-${p.id}`)}
                  >
                    {reminders.includes(`${session}-${p.id}`) ? (
                      <Check size={13} />
                    ) : (
                      <Bell size={13} />
                    )}{" "}
                    {reminders.includes(`${session}-${p.id}`)
                      ? "Saved"
                      : "Remind me"}
                  </button>
                ) : (
                  <Link to={`/product/${p.id}`}>
                    Shop now <ChevronRight size={12} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <TrustBar />
    </div>
  );
}

export function TopProductsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [sort, setSort] = useState("sold");
  const topic = topSearches.find((t) => t.query === query);
  const ranked = products
    .filter(
      (p) =>
        !query ||
        query
          .toLowerCase()
          .split(/\s+/)
          .every((w) => `${p.title} ${p.category}`.toLowerCase().includes(w)),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.price - b.price
        : sort === "rating"
          ? Number(b.rating) - Number(a.rating) || b.sold - a.sold
          : b.sold - a.sold,
    );
  return (
    <div className={s.page}>
      <Breadcrumb label="Top Products" />
      <div className={s.topHeading}>
        <span className={s.eyebrow}>THE MARKETPLACE FAVORITES</span>
        <h1>
          <Trophy size={25} /> Top Products
        </h1>
        <p>Popular searches. Most-loved finds. See what’s leading the list.</p>
      </div>
      <div
        className={s.categoryTabs}
        role="group"
        aria-label="Popular searches"
      >
        <button
          aria-pressed={!query}
          className={!query ? s.selected : ""}
          onClick={() => setParams({})}
        >
          All top products
        </button>
        {topSearches.map((t) => (
          <button
            key={t.query}
            aria-pressed={query === t.query}
            className={query === t.query ? s.selected : ""}
            onClick={() => setParams({ q: t.query })}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={s.toolbar}>
        <span>
          {topic ? topic.label : query || "Trending across Shopiz"} ·{" "}
          {ranked.length} products
        </span>
        <label>
          Rank by{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="sold">Best selling</option>
            <option value="rating">Top rated</option>
            <option value="price">Price: low to high</option>
          </select>
        </label>
      </div>
      {ranked.length ? (
        <div className={s.rankingGrid}>
          {ranked.map((p, index) => (
            <div key={p.id} className={s.rankedCard}>
              <span
                className={`${s.rank} ${index < 3 ? s.podium : ""}`}
                aria-label={`Rank ${index + 1}`}
              >
                TOP <strong>{index + 1}</strong>
              </span>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
      <p className={s.dataNote}>
        Rankings and search trends use the simulator’s sample catalog.
      </p>
      <TrustBar />
    </div>
  );
}

export function MallPage() {
  const [params, setParams] = useSearchParams();
  const brand = brands.find((b) => b.id === params.get("brand"));
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  let items = products
    .filter(
      (p) =>
        (!brand || brand.products.includes(p.id)) &&
        (category === "All" || p.category === category),
    )
    .map((p) => ({ ...p, mall: true }));
  if (sort === "price") items.sort((a, b) => a.price - b.price);
  if (sort === "popular") items.sort((a, b) => b.sold - a.sold);
  const selectBrand = (id) => {
    setParams(id ? { brand: id } : {});
    setCategory("All");
  };
  return (
    <div className={s.page}>
      <Breadcrumb label="Shopiz Mall" />
      <div className={s.mallHeading}>
        <h1>
          <ShoppingBag size={28} /> Shopiz Mall
        </h1>
        <span>Good brands. Great peace of mind.</span>
      </div>
      <BannerCarousel headingLevel="h2" />
      <TrustBar />
      <nav className={s.mallShortcuts} aria-label="Mall shortcuts">
        {[
          [Crown, "Premium finds", "#mall-products"],
          [Ticket, "Brand offers", "#brand-offers"],
          [Sparkles, "Discover brands", "#mall-brands"],
          [Globe, "Everyday favorites", "#mall-products"],
        ].map(([Icon, label, to]) => (
          <a key={label} href={to}>
            <span>
              <Icon size={30} strokeWidth={1.3} />
            </span>
            {label}
          </a>
        ))}
        <Link to="/collection/flash-deals">
          <span>
            <Zap size={30} strokeWidth={1.3} />
          </span>
          Flash Sale
        </Link>
      </nav>
      <div className={s.offerBanner} id="brand-offers">
        <div>
          <span className={s.eyebrow}>THE BRAND EDIT</span>
          <h2>A little more of what you love.</h2>
          <p>Discover selected brand offers, all in one place.</p>
        </div>
        <a href="#mall-products">
          Shop the edit <ArrowRight size={17} />
        </a>
      </div>
      <CategoryGrid />
      <section className={s.brands} id="mall-brands">
        <div className={s.sectionHeading}>
          <h2>MEET YOUR NEW FAVORITES</h2>
          <button onClick={() => selectBrand("")}>
            See all brands <ChevronRight size={13} />
          </button>
        </div>
        <div className={s.brandGrid}>
          {brands.map((b) => (
            <button
              key={b.id}
              aria-pressed={brand?.id === b.id}
              className={brand?.id === b.id ? s.selectedBrand : ""}
              onClick={() => selectBrand(b.id)}
            >
              <strong className={b.id === "atelier" ? s.serif : ""}>
                {b.name}
              </strong>
              <span>{b.tagline}</span>
              <small>
                {b.offer} <ArrowRight size={12} />
              </small>
            </button>
          ))}
        </div>
      </section>
      <section id="mall-products">
        <div className={s.toolbar}>
          <span>
            <ShieldCheck size={14} /> {brand ? brand.name : "All Mall brands"} ·{" "}
            {items.length} finds
          </span>
          <label>
            Sort by{" "}
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="popular">Best selling</option>
              <option value="price">Price: low to high</option>
            </select>
          </label>
        </div>
        <CategoryTabs selected={category} onSelect={setCategory} />
        <ProductGrid
          items={items}
          title={brand ? `${brand.name} · THE COLLECTION` : "MALL EXCLUSIVES"}
          subtitle="Discover your next everyday favorite"
          loadMore={false}
        />
      </section>
      <div className={s.mallAbout}>
        <h2>SHOPIZ MALL — A LITTLE MORE CONFIDENCE</h2>
        <p>
          Explore our fictional brand collections, discover everyday favorites
          and compare the latest offers in the Shopiz marketplace simulator.
        </p>
        <p>
          Authenticity, shipping and return benefits illustrate the intended
          shopping experience. All products and offers are demonstration data;
          no orders or payments are processed.
        </p>
        <Link to="/help">
          Learn more about shopping with Shopiz <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
