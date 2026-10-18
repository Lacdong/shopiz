import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";

import shared from "../../styles/Page.module.css";
import page from "./PlaceholderPage.module.css";
const s = { ...shared, ...page };
const pageNames = {
  seller: "Seller Center",
  download: "Get the Shopiz App",
  notifications: "Notifications",
  help: "How can we help?",
  language: "Language & Region",
  login: "Welcome back",
  signup: "Join Shopiz",
  vouchers: "A little extra, on us",
};
export default function Placeholder({ title }) {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const { slug, name } = useParams();
  const heading =
    title ||
    pageNames[path] ||
    (slug || name || "Page not found")
      .split("-")
      .map((x) => x[0]?.toUpperCase() + x.slice(1))
      .join(" ");
  return (
    <div className={s.placeholder}>
      <span className={s.placeholderIcon}>
        {path === "cart" ? (
          <ShoppingCart size={35} strokeWidth={1.3} />
        ) : (
          <ShoppingBag size={35} strokeWidth={1.3} />
        )}
      </span>
      <span className={s.kicker}>THE SHOPIZ MARKETPLACE</span>
      <h1>{path === "cart" ? "Your next favorite is waiting." : heading}</h1>
      <p>
        {path === "cart"
          ? "Your shopping cart is empty. Explore our everyday finds and discover something you love."
          : path === "seller"
            ? "Your next chapter as a seller starts here. Seller Center is coming in a future simulator release."
            : "This page is part of the Shopiz simulator and is coming soon. There’s plenty to discover on the marketplace today."}
      </p>
      <Link className={s.primary} to="/">
        Explore the marketplace <ArrowRight size={16} />
      </Link>
    </div>
  );
}
