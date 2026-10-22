import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Star,
  Store,
  X,
  ArrowRight,
} from "lucide-react";
import { ProductCard } from "../../components/Commerce";
import { money } from "../../data/catalog";
import { getProductDetails } from "../../data/productDetails";
import SearchFilters from "./SearchFilters";
import { filterSearch, searchCatalog } from "./searchUtils";
import { useCatalog } from "../../components/catalog/CatalogProvider";
import s from "./SearchResultsPage.module.css";
const pageSize = 15;
const filterKeys = [
  "category",
  "location",
  "brand",
  "min",
  "max",
  "rating",
  "mall",
  "shipping",
];
export default function SearchResultsPage() {
  const { products: catalogProducts } = useCatalog();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") || "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => setFiltersOpen(false), [query]);
  const { base, filtered } = filterSearch(params);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.max(
    1,
    Math.min(totalPages, Math.floor(Number(params.get("page"))) || 1),
  );
  const items = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const sort = [
    "relevance",
    "latest",
    "sales",
    "price-asc",
    "price-desc",
  ].includes(params.get("sort"))
    ? params.get("sort")
    : "relevance";
  const chips = [...params.entries()]
    .filter(([key, value]) => filterKeys.includes(key) && value)
    .map(([key, value]) => ({
      key,
      value,
      label:
        key === "mall"
          ? "Shopiz Mall"
          : key === "shipping"
            ? "Free shipping"
            : key === "rating"
              ? `${value} stars & up`
              : key === "min"
                ? `From ${money(Number(value) || 0)}`
                : key === "max"
                  ? `Up to ${money(Number(value) || 0)}`
                  : value,
    }));
  const related = base[0];
  const shop = related ? getProductDetails(related).seller : null;
  const shopProducts = related
    ? searchCatalog.filter((p) => p.brand === related.brand).slice(0, 4)
    : [];
  const shopSlug = shop?.id;
  function update(values, multi = false) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (multi) {
        const current = next.getAll(key);
        const list = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        next.delete(key);
        list.forEach((item) => next.append(key, item));
      } else if (value === "" || value === null) next.delete(key);
      else next.set(key, String(value));
    });
    if (!Object.hasOwn(values, "page")) next.delete("page");
    setParams(next);
  }
  function clear() {
    const next = new URLSearchParams(params);
    filterKeys.forEach((key) => next.delete(key));
    next.delete("page");
    setParams(next);
  }
  function goPage(value) {
    update({ page: value });
  }
  return (
    <div className={s.page}>
      <button
        className={s.mobileFilter}
        aria-expanded={filtersOpen}
        aria-controls="search-filters"
        onClick={() => setFiltersOpen(!filtersOpen)}
      >
        <SlidersHorizontal size={16} />
        Filters{chips.length > 0 && ` (${chips.length})`}
      </button>
      <div className={s.layout}>
        <aside
          id="search-filters"
          className={`${s.sidebar} ${filtersOpen ? s.openSidebar : ""}`}
          aria-label="Search filters"
        >
          <SearchFilters
            params={params}
            update={update}
            clear={clear}
            onClose={() => setFiltersOpen(false)}
          />
        </aside>
        <div className={s.results}>
          {query && shop && (
            <section
              className={s.relatedShop}
              aria-labelledby="related-shop-heading"
            >
              <div className={s.shopSectionTitle}>
                <h2 id="related-shop-heading">SHOP RELATED TO “{query}”</h2>
                <Link to={`/shop/${shopSlug}`}>
                  See all
                  <ChevronRight size={12} />
                </Link>
              </div>
              <div className={s.shopPanel}>
                <div className={s.shopIdentity}>
                  <span className={s.shopAvatar}>
                    <Store size={30} strokeWidth={1.2} />
                  </span>
                  <strong>{shop.name}</strong>
                  <span>
                    <Star size={10} fill="currentColor" /> {shop.rating}
                    <i /> {shop.followers} followers
                  </span>
                  <Link to={`/shop/${shopSlug}`}>
                    View Shop
                    <ArrowRight size={11} />
                  </Link>
                </div>
                <div className={s.shopProducts}>
                  {shopProducts.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`}>
                      <img src={p.image} alt={p.title} loading="lazy" />
                      <span>{p.title}</span>
                      <strong>{money(p.price)}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
          <div className={s.resultHeading}>
            <Search size={18} strokeWidth={1.5} />
            <div>
              <h1>
                {query ? (
                  <>
                    Search results for <strong>“{query}”</strong>
                  </>
                ) : (
                  "Discover your next favorite"
                )}
              </h1>
              <p aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>
            </div>
          </div>
          {chips.length > 0 && (
            <div className={s.activeFilters} aria-label="Active filters">
              {chips.map(({ key, value, label }) => (
                <button
                  key={`${key}-${value}`}
                  aria-label={`Remove filter ${label}`}
                  onClick={() =>
                    update(
                      {
                        [key]: ["category", "location", "brand"].includes(key)
                          ? value
                          : "",
                      },
                      ["category", "location", "brand"].includes(key),
                    )
                  }
                >
                  {label}
                  <X size={12} />
                </button>
              ))}
              <button className={s.clearChips} onClick={clear}>
                Clear all
              </button>
            </div>
          )}
          <div className={s.sortBar}>
            <span>Sort by</span>
            <div
              className={s.sortButtons}
              role="group"
              aria-label="Sort results"
            >
              {[
                ["relevance", "Relevance"],
                ["latest", "Latest"],
                ["sales", "Top Sales"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={sort === value}
                  className={sort === value ? s.activeSort : ""}
                  onClick={() => update({ sort: value })}
                >
                  {label}
                </button>
              ))}
            </div>
            <select
              aria-label="Sort by price"
              value={sort.startsWith("price-") ? sort : ""}
              onChange={(e) => update({ sort: e.target.value })}
            >
              <option value="" disabled>
                Price
              </option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <div className={s.pageControls}>
              <span>
                <strong>{currentPage}</strong>/{totalPages}
              </span>
              <button
                aria-label="Previous results page"
                disabled={currentPage === 1}
                onClick={() => goPage(currentPage - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                aria-label="Next results page"
                disabled={currentPage >= totalPages}
                onClick={() => goPage(currentPage + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
          {items.length ? (
            <>
              <div
                className={s.productGrid}
                aria-label="Search result products"
              >
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <nav className={s.pagination} aria-label="Search result pages">
                <button
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => goPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    aria-label={`Page ${i + 1}`}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                    onClick={() => goPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() => goPage(currentPage + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </nav>
            </>
          ) : (
            <section className={s.empty}>
              <Search size={36} strokeWidth={1.2} />
              <h2>No products found</h2>
              <p>Try a different keyword or adjust your filters.</p>
              {chips.length > 0 ? (
                <button onClick={clear}>Clear filters</button>
              ) : (
                <Link to="/">
                  Explore the marketplace
                  <ArrowRight size={14} />
                </Link>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
