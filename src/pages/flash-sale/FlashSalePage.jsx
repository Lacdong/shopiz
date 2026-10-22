import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Check, ChevronRight, Zap } from "lucide-react";
import { products } from "../../data/catalog";
import { useCatalog } from "../../components/catalog/CatalogProvider";

import { Countdown, ProductCard, TrustBar } from "../../components/Commerce";
import {
  Breadcrumb,
  CategoryTabs,
  EmptyState,
} from "../../components/collection/CollectionControls";
import shared from "../../components/collection/Collection.module.css";
import page from "./FlashSalePage.module.css";
const s = { ...shared, ...page };
const sessions = [
  { time: "Now", label: "Live deals" },
  { time: "12:00", label: "Coming up" },
  { time: "15:00", label: "Coming up" },
  { time: "18:00", label: "Coming up" },
  { time: "21:00", label: "Tonight’s picks" },
];
export default function FlashSalePage() {
  const { products: allProducts } = useCatalog();
  const [session, setSession] = useState(0);
  const [category, setCategory] = useState("All");
  const [reminders, setReminders] = useState([]);
  const [sort, setSort] = useState("discount");
  const items = allProducts
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
