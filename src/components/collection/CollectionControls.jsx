import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import s from "./Collection.module.css";
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
export function Breadcrumb({ label }) {
  return (
    <nav className={s.breadcrumb} aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <ChevronRight size={12} />
      <span>{label}</span>
    </nav>
  );
}
export function CategoryTabs({ selected, onSelect }) {
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
export function EmptyState() {
  return (
    <div className={s.empty}>
      <ShoppingBag size={28} />
      <h2>No products in this selection</h2>
      <p>Choose another category to discover more finds.</p>
    </div>
  );
}
