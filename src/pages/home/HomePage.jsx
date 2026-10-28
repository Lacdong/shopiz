import React from "react";
import {
  BannerCarousel,
  QuickAccess,
  CategoryGrid,
} from "../../components/Discovery";
import {
  FlashDeals,
  MallStrip,
  TopSearches,
  ProductGrid,
  TrustBar,
} from "../../components/Commerce";
import { useCatalog } from "../../components/catalog/CatalogProvider";
import s from "./HomePage.module.css";
export default function HomePage() {
  const { products: liveProducts } = useCatalog();
  return (
    <>
      <div className={s.top}>
        <BannerCarousel />
        <QuickAccess />
      </div>
      <CategoryGrid />
      <FlashDeals items={liveProducts.slice(0, 6)} />
      <MallStrip />
      <TopSearches />
      <ProductGrid items={liveProducts} />
      <TrustBar />
    </>
  );
}
