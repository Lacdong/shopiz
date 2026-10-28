import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Trophy } from "lucide-react";
import { products, topSearches } from "../../data/catalog";
import { useCatalog } from "../../components/catalog/CatalogProvider";

import { ProductCard, TrustBar } from "../../components/Commerce";
import {
  Breadcrumb,
  EmptyState,
} from "../../components/collection/CollectionControls";
import shared from "../../components/collection/Collection.module.css";
import page from "./TopProductsPage.module.css";
const s = { ...shared, ...page };
export default function TopProductsPage() {
  const { products: allProducts } = useCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [sort, setSort] = useState("sold");
  const topic = topSearches.find((t) => t.query === query);
  const ranked = allProducts
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
