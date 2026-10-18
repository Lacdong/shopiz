import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ShoppingCart, ShieldCheck, Star } from "lucide-react";
import { products, money } from "../../data/catalog";
import { ProductGrid } from "../../components/Commerce";
import shared from "../../styles/Page.module.css";
import Placeholder from "../placeholder/PlaceholderPage";
import page from "./ProductPage.module.css";
const s = { ...shared, ...page };
export default function ProductPage() {
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
