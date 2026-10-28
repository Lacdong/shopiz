import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function SellerRouteGuard({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user?.role === "seller" && user?.shopId) {
      localStorage.setItem("shopiz-active-seller-shop-id", String(user.shopId));
      if (user?.shopName) {
        localStorage.setItem("shopiz-active-seller-shop-name", user.shopName);
      }
    }
  }, [user]);

  // If logged in as buyer, strictly block access to Seller Center
  if (user && user.role !== "seller") {
    return (
      <Navigate
        to="/login"
        state={{ returnTo: "/seller", notice: "seller_required" }}
        replace
      />
    );
  }

  // If unauthenticated: allow direct deep links or active shop context in development/testing,
  // but redirect naked /seller entry to login
  if (!user) {
    const searchParams = new URLSearchParams(location.search);
    const hasExplicitShop =
      searchParams.has("shop_id") ||
      Boolean(localStorage.getItem("shopiz-active-seller-shop-id"));

    if (!hasExplicitShop) {
      return (
        <Navigate
          to="/login"
          state={{ returnTo: location.pathname + location.search }}
          replace
        />
      );
    }
  }

  return children;
}
