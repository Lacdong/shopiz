import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import Footer from "../components/Footer";
import s from "./AuthLayout.module.css";
export default function AuthLayout() {
  const { pathname } = useLocation();
  const title =
    pathname === "/login"
      ? "Log In"
      : pathname === "/forgot-password"
        ? "Reset Password"
        : "Sign Up";
  return (
    <>
      <header className={s.header}>
        <div>
          <Link className={s.logo} to="/" aria-label="Shopiz homepage">
            <ShoppingBag strokeWidth={1.5} />
            <span>shopiz.</span>
          </Link>
          <span className={s.pageTitle}>{title}</span>
          <Link className={s.help} to="/help">
            <HelpCircle size={15} /> Need help?
          </Link>
        </div>
      </header>
      <main className={s.main}>
        <div className={s.content}>
          <section className={s.story} aria-label="Welcome to Shopiz">
            <span className={s.eyebrow}>A LITTLE MORE EVERYDAY</span>
            <div className={s.brand}>
              <ShoppingBag strokeWidth={1} />
              <span>shopiz.</span>
            </div>
            <h2>
              Your next favorite
              <br />
              starts here.
            </h2>
            <p>
              Good finds. Great prices.
              <br />A whole world of everyday possibilities.
            </p>
            <div className={s.benefits}>
              {[
                [ShieldCheck, "Shop with confidence"],
                [Truck, "More delivered for less"],
                [Sparkles, "Discover something new"],
              ].map(([Icon, text]) => (
                <span key={text}>
                  <Icon size={17} strokeWidth={1.4} />
                  {text}
                </span>
              ))}
            </div>
          </section>
          <section className={s.card} aria-label={title}>
            <Outlet key={pathname} />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
