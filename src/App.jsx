import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import MarketplaceLayout from "./layouts/MarketplaceLayout";
import AuthLayout from "./layouts/AuthLayout";
import HomePage from "./pages/home/HomePage";
import SearchResultsPage from "./pages/search/SearchResultsPage";
import BrowseResultsPage from "./pages/search/BrowseResultsPage";
import ProductPage from "./pages/product/ProductPage";
import PlaceholderPage from "./pages/placeholder/PlaceholderPage";
import FlashSalePage from "./pages/flash-sale/FlashSalePage";
import TopProductsPage from "./pages/top-products/TopProductsPage";
import MallPage from "./pages/mall/MallPage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ForgotPasswordPage from "./pages/login/ForgotPasswordPage";
import CartPage from "./pages/cart/CartPage";
import ShopPage from "./pages/shop/ShopPage";
import CheckoutPage from "./pages/checkout/CheckoutPage";
function ScrollManager() {
  const { pathname, search, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() =>
        document.getElementById(hash.slice(1))?.scrollIntoView(),
      );
    } else window.scrollTo(0, 0);
  }, [pathname, search, hash]);
  return null;
}
export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="signup" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route element={<MarketplaceLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="category/:name" element={<BrowseResultsPage />} />
          <Route path="collection/flash-deals" element={<FlashSalePage />} />
          <Route path="flash-sale" element={<FlashSalePage />} />
          <Route path="collection/top-products" element={<TopProductsPage />} />
          <Route path="top-product" element={<TopProductsPage />} />
          <Route path="collection/mall" element={<MallPage />} />
          <Route path="shopiz-mall" element={<MallPage />} />
          <Route path="collection/:name" element={<BrowseResultsPage />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="shop/:shopId" element={<ShopPage />} />
          {[
            "seller",
            "download",
            "notifications",
            "help",
            "language",
            "vouchers",
            "info/:slug",
            "social/:name",
            "*",
          ].map((path) => (
            <Route key={path} path={path} element={<PlaceholderPage />} />
          ))}
        </Route>
      </Routes>
    </>
  );
}
