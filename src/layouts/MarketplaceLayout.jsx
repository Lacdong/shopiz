import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import s from "./MarketplaceLayout.module.css";
export default function MarketplaceLayout() {
  const { pathname } = useLocation();
  return (
    <>
      <Header variant={pathname === "/cart" ? "cart" : "marketplace"} />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
