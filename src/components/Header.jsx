import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  Bell,
  ChevronDown,
  HelpCircle,
  Globe,
  Instagram,
  Facebook,
  Menu,
  X,
} from "lucide-react";
import s from "./Header.module.css";
import { useAuth } from "./auth/AuthProvider";
export function UtilityNav() {
  const { user, logout } = useAuth();
  return (
    <div className={s.utility}>
      <div>
        <Link to="/seller">Seller Center</Link>
        <i />
        <Link to="/download">Download App</Link>
        <i />
        <span>Follow Us</span>
        <Link to="/social/facebook" aria-label="Facebook">
          <Facebook size={13} />
        </Link>
        <Link to="/social/instagram" aria-label="Instagram">
          <Instagram size={14} />
        </Link>
      </div>
      <div>
        <Link to="/notifications">
          <Bell size={13} /> Notifications
        </Link>
        <Link to="/help">
          <HelpCircle size={13} /> Help
        </Link>
        <Link to="/language">
          <Globe size={13} /> English <ChevronDown size={11} />
        </Link>
        {user ? (
          <>
            <span>{user.name}</span>
            <i />
            <button className={s.logout} onClick={logout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <i />
            <Link to="/register">
              <strong>Sign Up</strong>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
export function SearchBar() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  return (
    <div className={s.searchWrap}>
      <form
        className={s.search}
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim())
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }}
        role="search"
      >
        <input
          aria-label="Search products"
          placeholder="Search for your next favorite find"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button aria-label="Search" type="submit">
          <Search size={21} />
        </button>
      </form>
      <div className={s.suggestions}>
        {[
          "Wireless Headphones",
          "Summer Essentials",
          "Home & Living",
          "Sneakers",
          "Skincare",
          "Under $20",
        ].map((x) => (
          <Link
            key={x}
            to={`/search?q=${encodeURIComponent(x === "Under $20" ? "" : x)}${x === "Under $20" ? "&max=20" : ""}`}
          >
            {x}
          </Link>
        ))}
      </div>
    </div>
  );
}
export default function Header() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <header className={s.header}>
      <div className={s.container}>
        <UtilityNav />
        <div className={s.main}>
          <Link className={s.logo} to="/" aria-label="Shopiz homepage">
            <ShoppingBag strokeWidth={1.5} />
            <span>
              shopiz<span className={s.logoDot}>.</span>
            </span>
          </Link>
          <SearchBar />
          <Link className={s.cart} to="/cart" aria-label="Shopping cart">
            <ShoppingCart size={27} />
            <span>0</span>
          </Link>
          <button
            className={s.menuButton}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className={s.mobileNav}>
            {[
              ["Seller Center", "seller"],
              ["Download App", "download"],
              ["Notifications", "notifications"],
              ["Help", "help"],
              ["English", "language"],
              ["Login", "login"],
              ["Sign Up", "register"],
            ]
              .filter(
                ([, path]) => !user || !["login", "register"].includes(path),
              )
              .map(([label, path]) => (
                <Link onClick={() => setOpen(false)} key={path} to={`/${path}`}>
                  {label}
                </Link>
              ))}
            {user && (
              <>
                <span>{user.name}</span>
                <button
                  className={s.logout}
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
