import React from "react";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { products, money } from "../../data/catalog";
import { ProductGrid, TrustBar } from "../../components/Commerce";

import s from "./SearchResultsPage.module.css";
export default function SearchResultsPage() {
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
