import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Globe,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Zap,
} from "lucide-react";
import { products } from "../../data/catalog";
import { mockShops as brands } from "../../data/shops";
import { BannerCarousel, CategoryGrid } from "../../components/Discovery";
import { ProductGrid, TrustBar } from "../../components/Commerce";
import {
  Breadcrumb,
  CategoryTabs,
} from "../../components/collection/CollectionControls";
import shared from "../../components/collection/Collection.module.css";
import page from "./MallPage.module.css";
const s = { ...shared, ...page };
export default function MallPage() {
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
                {b.brand}
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
            <ShieldCheck size={14} /> {brand ? brand.brand : "All Mall brands"}{" "}
            · {items.length} finds
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
          title={brand ? `${brand.brand} · THE COLLECTION` : "MALL EXCLUSIVES"}
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
