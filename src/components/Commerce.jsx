import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  Flame,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { products, money, topSearches } from "../data/catalog";
import s from "./Commerce.module.css";
export function ProductCard({ product, flash = false }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className={`${s.card} ${flash ? s.flashCard : ""}`}
    >
      <div className={s.imageWrap}>
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.classList.add(s.imageFallback);
          }}
        />
        {!flash && product.mall && <span className={s.mallBadge}>Mall</span>}
        <span className={s.discount}>−{product.discount}%</span>
        {!flash && (
          <span className={s.shippingBadge}>
            <Truck size={11} /> Free shipping
          </span>
        )}
      </div>
      <div className={s.cardBody}>
        {!flash && <h3>{product.title}</h3>}
        <div className={s.price}>
          <strong>{money(product.price)}</strong>
          {flash && <del>{money(product.original)}</del>}
        </div>
        {flash ? (
          <div
            className={s.progress}
            role="progressbar"
            aria-label={`${product.title} deal stock sold`}
            aria-valuenow={product.progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${product.progress}%` }} />
            <small>
              <Flame size={11} />{" "}
              {product.progress > 75
                ? "SELLING FAST"
                : `${product.sold.toLocaleString()} SOLD`}
            </small>
          </div>
        ) : (
          <>
            <span className={s.savings}>
              {product.discount}% off <del>{money(product.original)}</del>
            </span>
            <div className={s.rating}>
              <span>
                <Star size={10} fill="currentColor" /> {product.rating}
              </span>
              <span>
                {product.sold >= 1000
                  ? `${(product.sold / 1000).toFixed(1)}k`
                  : product.sold}{" "}
                sold
              </span>
            </div>
            <p className={s.location}>{product.location}</p>
          </>
        )}
      </div>
    </Link>
  );
}
export function Countdown() {
  const [end] = useState(() => {
    try {
      const stored = Number(sessionStorage.getItem("shopiz-deal-end"));
      if (stored > Date.now()) return stored;
      const value = Date.now() + 1000 * (3 * 3600 + 24 * 60 + 18);
      sessionStorage.setItem("shopiz-deal-end", String(value));
      return value;
    } catch {
      return Date.now() + 1000 * 12258;
    }
  });
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((end - Date.now()) / 1000)),
  );
  useEffect(() => {
    const id = setInterval(
      () => setRemaining(Math.max(0, Math.floor((end - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(id);
  }, [end]);
  return (
    <div
      className={s.countdown}
      aria-label={`Deal ends in ${Math.floor(remaining / 3600)} hours ${Math.floor((remaining % 3600) / 60)} minutes ${remaining % 60} seconds`}
    >
      <span className={s.ends}>ENDS IN</span>
      {[
        Math.floor(remaining / 3600),
        Math.floor((remaining % 3600) / 60),
        remaining % 60,
      ].map((n, i) => (
        <span className={s.digit} key={i}>
          {String(n).padStart(2, "0")}
        </span>
      ))}
      {remaining === 0 && <span>Deals ended</span>}
    </div>
  );
}
export function FlashDeals() {
  return (
    <section className={s.flash} id="flash-deals">
      <div className={s.sectionHeader}>
        <div className={s.flashTitle}>
          <h2>
            FLASH <Zap size={20} fill="currentColor" /> DEALS
          </h2>
          <Countdown />
        </div>
        <Link className={s.seeAll} to="/collection/flash-deals">
          See all deals <ChevronRight size={13} />
        </Link>
      </div>
      <div className={s.flashGrid}>
        {products.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} flash />
        ))}
      </div>
    </section>
  );
}
export function MallStrip() {
  return (
    <section className={s.mallSection} aria-labelledby="brands-heading">
      <div className={s.sectionHeader}>
        <h2 className={s.sectionHeading} id="brands-heading">
          SHOPIZ MALL
        </h2>
        <Link className={s.seeAll} to="/collection/mall">
          See all <ChevronRight size={13} />
        </Link>
      </div>
      <div className={s.mallStrip}>
        <div className={s.mallIntro}>
          <span>THE REAL DEAL.</span>
          <h2>
            Shopiz Mall
            <span>
              Good brands.
              <br />
              Great peace of mind.
            </span>
          </h2>
          <Link to="/collection/mall">
            Explore the brands <ArrowRight size={15} />
          </Link>
        </div>
        <Link to="/collection/mall?brand=sonora" className={s.brandBlock}>
          <strong>SONORA</strong>
          <span>Sound made personal.</span>
          <p>Up to 40% off</p>
        </Link>
        <Link to="/collection/mall?brand=atelier" className={s.brandBlock}>
          <strong className={s.serif}>atelier.</strong>
          <span>Considered essentials.</span>
          <p>New season arrivals</p>
        </Link>
        <Link to="/collection/mall?brand=north-form" className={s.brandBlock}>
          <strong>NORTH / FORM</strong>
          <span>Made for the everyday.</span>
          <p>Buy more, save more</p>
        </Link>
      </div>
    </section>
  );
}
export function TopSearches() {
  return (
    <section className={s.topSearches} aria-labelledby="top-searches-heading">
      <div className={s.sectionHeader}>
        <h2 className={s.sectionHeading} id="top-searches-heading">
          TOP SEARCHES
        </h2>
        <Link className={s.seeAll} to="/collection/top-products">
          See all <ChevronRight size={13} />
        </Link>
      </div>
      <div className={s.searchGrid}>
        {topSearches.map((item, index) => (
          <Link
            className={s.searchCard}
            to={`/collection/top-products?q=${encodeURIComponent(item.query)}`}
            key={item.query}
          >
            <div className={s.searchImage}>
              <img src={item.image} alt={item.label} loading="lazy" />
              <span className={s.searchRank}>TOP {index + 1}</span>
              <span className={s.searchVolume}>
                {item.searches} searches / month
              </span>
            </div>
            <h3>{item.label}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
export function ProductGrid({
  items = products,
  title = "JUST FOR YOU",
  subtitle = "A fresh selection of things you’ll love",
  loadMore = true,
}) {
  const [count, setCount] = useState(12);
  useEffect(() => setCount(12), [items]);
  return (
    <section className={s.recommendations}>
      <div className={s.recommendHeader}>
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      {items.length ? (
        <div className={s.productGrid}>
          {items.slice(0, loadMore ? count : items.length).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className={s.empty}>
          <h2>No finds just yet</h2>
          <p>Try another search or explore all our everyday favorites.</p>
          <Link to="/">
            Continue shopping <ArrowRight size={15} />
          </Link>
        </div>
      )}
      {loadMore && count < items.length && (
        <button className={s.loadMore} onClick={() => setCount((x) => x + 12)}>
          Discover more <ChevronRight size={14} />
        </button>
      )}
    </section>
  );
}
export function TrustBar() {
  return (
    <div className={s.trustBar}>
      {[
        [Truck, "A little extra, delivered", "Free shipping on selected finds"],
        [
          ShieldCheck,
          "Shop with confidence",
          "Secure payments. Trusted sellers.",
        ],
        [
          RotateCcw,
          "Easy from start to finish",
          "Simple returns within 15 days",
        ],
      ].map(([Icon, title, text]) => (
        <div key={title}>
          <Icon size={25} strokeWidth={1.3} />
          <span>
            <strong>{title}</strong>
            <small>{text}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
