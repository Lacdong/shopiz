import React from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products, money } from "../../data/catalog";
import { useCatalog } from "../../components/catalog/CatalogProvider";
import { ProductGrid, TrustBar } from "../../components/Commerce";

import s from "./BrowseResultsPage.module.css";
export default function BrowseResultsPage() {
  const { products: allProducts } = useCatalog();
  const { name } = useParams();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const query = params.get("q") || "";
  const collection = pathname.startsWith("/collection/");
  let items = allProducts;
  let title = name || `Search results for “${query}”`;
  if (pathname.startsWith("/category/")) {
    const norm = (s) => (s || "").toLowerCase().replace(/['’]/g, "").trim();
    const targetNorm = norm(name);
    items = allProducts.filter((p) => {
      const pCat = norm(p.category);
      return (
        pCat === targetNorm ||
        pCat.includes(targetNorm) ||
        targetNorm.includes(pCat)
      );
    });
  } else if (collection) {
    title = name
      .split("-")
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(" ");
    if (name === "mall") items = allProducts.filter((p) => p.mall);
    if (name === "flash-deals" || name === "daily-deals")
      items = [...allProducts].sort((a, b) => b.discount - a.discount);
    if (name === "top-products")
      items = [...allProducts].sort((a, b) => b.sold - a.sold);
    if (name === "new-arrivals") items = [...allProducts].reverse();
  } else {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    items = allProducts.filter((p) =>
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
