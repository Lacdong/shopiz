import React, { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  Star,
  Store,
  Truck,
  Users,
  X,
} from "lucide-react";
import { products } from "../../data/catalog";
import { findShop, mockShops } from "../../data/shops";
import { mockVouchers } from "../../data/vouchers";
import { money } from "../../data/catalog";
import { ProductCard } from "../../components/Commerce";
import PlaceholderPage from "../placeholder/PlaceholderPage";
import s from "./ShopPage.module.css";
const followingKey = "shopiz-followed-shops-v1";
function readFollowing() {
  try {
    const stored = JSON.parse(localStorage.getItem(followingKey) || "[]");
    return Array.isArray(stored)
      ? stored.filter((id) => mockShops.some((shop) => shop.id === id))
      : [];
  } catch {
    return [];
  }
}
function ProductSection({ title, items, to, description }) {
  if (!items.length) return null;
  return (
    <section className={s.productSection}>
      <div className={s.sectionHeading}>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <Link to={to}>
          See all
          <ChevronRight size={13} />
        </Link>
      </div>
      <div className={s.featuredGrid}>
        {items.slice(0, 6).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
function Storefront({ shop }) {
  const [params, setParams] = useSearchParams();
  const allowedTabs = ["home", "products", "new", "top", "about"];
  const tab = allowedTabs.includes(params.get("tab"))
    ? params.get("tab")
    : "home";
  const keyword = params.get("keyword") || "";
  const category = params.get("category") || "";
  const [search, setSearch] = useState(keyword);
  useEffect(() => setSearch(keyword), [keyword]);
  const [followed, setFollowed] = useState(() =>
    readFollowing().includes(shop.id),
  );
  const [notice, setNotice] = useState("");
  const chat = useRef(null);
  const catalog = products.filter((product) =>
    shop.products.includes(product.id),
  );
  const categories = [...new Set(catalog.map((product) => product.category))];
  const filtered = catalog.filter(
    (product) =>
      (!category || product.category === category) &&
      keyword
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .every((word) =>
          `${product.title} ${product.category}`.toLowerCase().includes(word),
        ),
  );
  const sort =
    params.get("sort") ||
    (tab === "new" ? "latest" : tab === "top" ? "sales" : "featured");
  filtered.sort((a, b) =>
    sort === "price-asc"
      ? a.price - b.price
      : sort === "price-desc"
        ? b.price - a.price
        : sort === "latest"
          ? Number(b.id) - Number(a.id)
          : sort === "sales"
            ? b.sold - a.sold
            : 0,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 6));
  const page = Math.max(
    1,
    Math.min(totalPages, Math.floor(Number(params.get("page"))) || 1),
  );
  const visible = filtered.slice((page - 1) * 6, page * 6);
  const topProducts = [...catalog].sort((a, b) => b.sold - a.sold);
  const latest = [...catalog].reverse();
  const offers = mockVouchers.filter((v) => v.type !== "shipping").slice(0, 2);
  function update(values) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(values)) {
      if (value === "" || value === null) next.delete(key);
      else next.set(key, String(value));
    }
    if (!Object.hasOwn(values, "page")) next.delete("page");
    setParams(next);
  }
  function navigateTab(value) {
    setParams(value === "home" ? {} : { tab: value });
    setSearch("");
  }
  function toggleFollow() {
    const next = !followed;
    setFollowed(next);
    const existing = readFollowing().filter((id) => id !== shop.id);
    try {
      localStorage.setItem(
        followingKey,
        JSON.stringify(next ? [...existing, shop.id] : existing),
      );
      setNotice(
        next ? "You’re now following this shop." : "You unfollowed this shop.",
      );
    } catch {
      setNotice("Your follow preference is updated for this visit.");
    }
  }
  const shopUrl = `/shop/${shop.id}`;
  return (
    <div className={s.page}>
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/collection/mall">Shopiz Mall</Link>
        <ChevronRight size={12} />
        <span>{shop.brand}</span>
      </nav>
      <section className={s.profile} aria-label="Shop profile">
        <div className={s.identity}>
          <div className={s.brandRow}>
            <span className={s.avatar}>
              <Store size={35} strokeWidth={1.2} />
              <small>Mall</small>
            </span>
            <div>
              <h1>{shop.name}</h1>
              <p>
                <span />
                Online recently
              </p>
              <small>{shop.tagline}</small>
            </div>
          </div>
          <div className={s.profileActions}>
            <button aria-pressed={followed} onClick={toggleFollow}>
              {followed ? <Check size={14} /> : <Plus size={14} />}{" "}
              {followed ? "Following" : "Follow"}
            </button>
            <button onClick={() => chat.current.showModal()}>
              <MessageCircle size={14} />
              Chat Now
            </button>
          </div>
        </div>
        <dl className={s.stats}>
          {[
            [Package, "Products", catalog.length],
            [
              Users,
              "Followers",
              (shop.followers + (followed ? 1 : 0)).toLocaleString("en-US"),
            ],
            [Star, "Shop rating", `${shop.rating} / 5`],
            [MessageCircle, "Response rate", shop.responseRate],
            [Clock, "Response time", "Within a few hours"],
            [Store, "Joined", shop.joined],
          ].map(([Icon, label, value]) => (
            <div key={label}>
              <dt>
                <Icon size={15} strokeWidth={1.4} />
                {label}
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      {notice && (
        <p className={s.notice} role="status">
          {notice}
          <button
            aria-label="Dismiss shop notice"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </p>
      )}
      <div className={s.shopNavigation}>
        <nav aria-label="Shop navigation">
          {[
            ["home", "Home"],
            ["products", "All Products"],
            ["new", "New Arrivals"],
            ["top", "Top Sales"],
            ["about", "About Shop"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={tab === value ? s.activeTab : ""}
              aria-current={tab === value ? "page" : undefined}
              onClick={() => navigateTab(value)}
            >
              {label}
            </button>
          ))}
        </nav>
        <form
          role="search"
          aria-label="Search this shop"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({
              tab: "products",
              ...(search.trim() ? { keyword: search.trim() } : {}),
            });
          }}
        >
          <input
            aria-label="Search this shop"
            placeholder="Search in this shop"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button aria-label="Search shop products">
            <Search size={16} />
          </button>
        </form>
      </div>
      {tab === "home" ? (
        <>
          <ProductSection
            title="RECOMMENDED FOR YOU"
            description="A few favorites to get you started"
            items={topProducts}
            to={`${shopUrl}?tab=products`}
          />
          <section className={s.hero}>
            <div>
              <span className={s.eyebrow}>
                {shop.brand} · THE EVERYDAY COLLECTION
              </span>
              <h2>{shop.heroTitle}</h2>
              <p>{shop.heroText}</p>
              <Link to={`${shopUrl}?tab=products`}>
                Explore the collection
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className={s.heroArt}>
              <span className={s.heroCircle} />
              <img
                src={catalog[0].image}
                alt={`Featured ${shop.brand} product`}
              />
              <span className={s.heroStamp}>
                CONSIDERED
                <br />
                EVERYDAY FINDS
              </span>
            </div>
          </section>
          <section className={s.followPanel}>
            <div>
              <span className={s.eyebrow}>
                YOUR NEXT FAVORITES, ALL IN ONE PLACE
              </span>
              <h2>A little closer to what you love.</h2>
              <p>Follow {shop.brand} and keep your everyday finds close.</p>
            </div>
            <button onClick={toggleFollow} aria-pressed={followed}>
              {followed ? <Check size={17} /> : <Heart size={17} />}{" "}
              {followed ? "Following Store" : "Follow Store"}
            </button>
          </section>
          <section className={s.collectionSection}>
            <div className={s.sectionHeading}>
              <div>
                <h2>EVERY FIND HAS A STORY</h2>
                <p>Discover the collections, made for your everyday.</p>
              </div>
            </div>
            <div className={s.collections}>
              {categories.slice(0, 3).map((name) => {
                const product = catalog.find((p) => p.category === name);
                return (
                  <Link
                    key={name}
                    to={`${shopUrl}?tab=products&category=${encodeURIComponent(name)}`}
                  >
                    <div>
                      <img src={product.image} alt={name} loading="lazy" />
                    </div>
                    <span>
                      {name}
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
          <ProductSection
            title="THE MOST-LOVED FINDS"
            items={topProducts}
            to={`${shopUrl}?tab=top`}
            description="The favorites our sample catalog keeps coming back to"
          />
          <section className={s.offers}>
            <div className={s.sectionHeading}>
              <div>
                <h2>A LITTLE EXTRA, ON US</h2>
                <p>Shopiz marketplace offers for your selected finds.</p>
              </div>
              <Link to="/cart">
                View in cart
                <ChevronRight size={13} />
              </Link>
            </div>
            <div>
              {offers.map((offer) => (
                <article key={offer.code}>
                  <span>
                    {offer.type === "percent"
                      ? `${offer.percent}% OFF`
                      : money(offer.amount) + " OFF"}
                  </span>
                  <div>
                    <strong>{offer.code}</strong>
                    <p>
                      Min. spend {money(offer.minimum)}
                      {offer.maxDiscount
                        ? ` · Up to ${money(offer.maxDiscount)} off`
                        : ""}
                    </p>
                    <small>Valid through {offer.expiresAt} · Demo offer</small>
                  </div>
                  <Link to="/cart">
                    Use in cart
                    <ChevronRight size={12} />
                  </Link>
                </article>
              ))}
            </div>
          </section>
          <div className={s.benefits}>
            {[
              [
                ShieldCheck,
                "Shop with confidence",
                "A considered collection of everyday finds",
              ],
              [
                Truck,
                "Free standard shipping",
                "On all items in this sample collection",
              ],
              [Package, "Easy returns", "15-day return policy preview"],
            ].map(([Icon, title, text]) => (
              <div key={title}>
                <Icon size={30} strokeWidth={1.2} />
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <ProductSection
            title="NEW TO THE COLLECTION"
            items={latest}
            to={`${shopUrl}?tab=new`}
          />
          {categories.slice(0, 2).map((name) => (
            <section key={name}>
              <Link
                className={s.categoryBanner}
                to={`${shopUrl}?tab=products&category=${encodeURIComponent(name)}`}
              >
                <span>{name}</span>
                <small>
                  Explore the edit
                  <ArrowRight size={14} />
                </small>
              </Link>
              <ProductSection
                title={name.toUpperCase()}
                items={catalog.filter((p) => p.category === name)}
                to={`${shopUrl}?tab=products&category=${encodeURIComponent(name)}`}
              />
            </section>
          ))}
        </>
      ) : tab === "about" ? (
        <section className={s.about}>
          <span className={s.eyebrow}>MEET {shop.brand}</span>
          <h2>{shop.tagline}</h2>
          <p>{shop.story}</p>
          <div>
            <h3>Shopping with {shop.brand}</h3>
            <ul>
              <li>
                {catalog.length} sample products, curated for the everyday.
              </li>
              <li>Free standard delivery and a 15-day returns preview.</li>
              <li>
                Store ratings, follower counts and offers are illustrative.
              </li>
            </ul>
            <p>
              This is an independent Shopiz simulator storefront. Orders,
              payments and seller messaging are not connected.
            </p>
          </div>
          <Link to="/help">
            Shopping help
            <ArrowRight size={14} />
          </Link>
        </section>
      ) : (
        <div className={s.catalogLayout}>
          <aside className={s.sidebar} aria-label="Shop categories">
            <h2>
              <Store size={15} />
              SHOP CATEGORIES
            </h2>
            <button
              className={!category ? s.selectedCategory : ""}
              aria-pressed={!category}
              onClick={() => update({ category: "" })}
            >
              All Products<span>{catalog.length}</span>
            </button>
            {categories.map((name) => (
              <button
                key={name}
                className={category === name ? s.selectedCategory : ""}
                aria-pressed={category === name}
                onClick={() => update({ category: name })}
              >
                {name}
                <span>{catalog.filter((p) => p.category === name).length}</span>
              </button>
            ))}
          </aside>
          <section className={s.catalog}>
            <div className={s.catalogHeading}>
              <h2>
                {keyword
                  ? `Results for “${keyword}”`
                  : category || "All Products"}
                <span>
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "product" : "products"}
                </span>
              </h2>
              {(keyword || category) && (
                <button
                  onClick={() => {
                    setParams({ tab: "products" });
                    setSearch("");
                  }}
                >
                  Clear filters
                  <X size={12} />
                </button>
              )}
            </div>
            <div className={s.sortBar}>
              <span>Sort by</span>
              <button
                className={sort === "featured" ? s.activeSort : ""}
                onClick={() => update({ sort: "featured" })}
              >
                Featured
              </button>
              <button
                className={sort === "latest" ? s.activeSort : ""}
                onClick={() => update({ sort: "latest" })}
              >
                Latest
              </button>
              <button
                className={sort === "sales" ? s.activeSort : ""}
                onClick={() => update({ sort: "sales" })}
              >
                Top Sales
              </button>
              <select
                aria-label="Shop price sort"
                value={sort.startsWith("price-") ? sort : ""}
                onChange={(e) => update({ sort: e.target.value })}
              >
                <option value="" disabled>
                  Price
                </option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            {visible.length ? (
              <>
                <div className={s.catalogGrid} aria-label="Shop products">
                  {visible.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <nav className={s.pagination} aria-label="Shop product pages">
                  <button
                    aria-label="Previous shop page"
                    disabled={page === 1}
                    onClick={() => update({ page: page - 1 })}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      aria-label={`Shop page ${i + 1}`}
                      aria-current={page === i + 1 ? "page" : undefined}
                      onClick={() => update({ page: i + 1 })}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    aria-label="Next shop page"
                    disabled={page === totalPages}
                    onClick={() => update({ page: page + 1 })}
                  >
                    <ChevronRight size={16} />
                  </button>
                </nav>
              </>
            ) : (
              <div className={s.empty}>
                <Search size={30} strokeWidth={1.3} />
                <h3>No products found in this shop</h3>
                <p>Try another keyword or category.</p>
              </div>
            )}
          </section>
        </div>
      )}
      <dialog
        ref={chat}
        className={s.chatDialog}
        aria-labelledby="shop-chat-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) chat.current.close();
        }}
      >
        <button
          aria-label="Close shop chat"
          onClick={() => chat.current.close()}
        >
          <X size={20} />
        </button>
        <MessageCircle size={32} strokeWidth={1.3} />
        <h2 id="shop-chat-title">Chat with {shop.brand}</h2>
        <p>
          Seller messaging is not connected in this simulator. Explore the
          shop’s products or visit the Help Center for more information.
        </p>
        <Link to="/help">
          Visit Help Center
          <ArrowRight size={14} />
        </Link>
      </dialog>
    </div>
  );
}
export default function ShopPage() {
  const { shopId } = useParams();
  const shop = findShop(shopId);
  return shop ? (
    <Storefront key={shop.id} shop={shop} />
  ) : (
    <PlaceholderPage title="Shop not found" />
  );
}
