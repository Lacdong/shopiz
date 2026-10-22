import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CatalogProvider } from "./components/catalog/CatalogProvider";
import { AuthProvider } from "./components/auth/AuthProvider";
import { CartProvider } from "./components/cart/CartProvider";
import { AccountProvider } from "./components/account/AccountProvider";
import "./global.css";
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CatalogProvider>
        <AuthProvider>
          <AccountProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AccountProvider>
        </AuthProvider>
      </CatalogProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
