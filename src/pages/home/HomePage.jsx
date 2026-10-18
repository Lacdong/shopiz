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
import s from "./HomePage.module.css";
export default function HomePage() {
  return (
    <>
      <div className={s.top}>
        <BannerCarousel />
        <QuickAccess />
      </div>
      <CategoryGrid />
      <FlashDeals />
      <MallStrip />
      <TopSearches />
      <ProductGrid />
      <TrustBar />
    </>
  );
}
