import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Zap,
  Truck,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Sparkles,
  CalendarDays,
  Grid2X2,
  Shirt,
  Smartphone,
  House,
  Headphones,
  Briefcase,
  Footprints,
  Watch,
  Dumbbell,
  Heart,
  Blocks,
  Apple,
  BookOpen,
  Cat,
  Car,
  Gem,
  Plane,
  Gamepad2,
  Ellipsis,
  Flower2,
} from "lucide-react";
import { banners, categories, image } from "../data/catalog";
import s from "./Discovery.module.css";
const quickItems = [
  ["Flash Deals", Zap, "/collection/flash-deals"],
  ["Free Shipping", Truck, "/collection/free-shipping"],
  ["Shopiz Mall", ShoppingBag, "/collection/mall"],
  ["Vouchers", Ticket, "/vouchers"],
  ["Top Products", TrendingUp, "/collection/top-products"],
  ["New Arrivals", Sparkles, "/collection/new-arrivals"],
  ["Daily Deals", CalendarDays, "/collection/daily-deals"],
  ["Categories", Grid2X2, "/#categories"],
];
const icons = [
  Shirt,
  Shirt,
  Flower2,
  Smartphone,
  House,
  Headphones,
  Briefcase,
  Footprints,
  Watch,
  Dumbbell,
  Heart,
  Blocks,
  Apple,
  BookOpen,
  Cat,
  Car,
  Gem,
  Plane,
  Gamepad2,
  Ellipsis,
];
export function BannerCarousel({ headingLevel = "h1" }) {
  const HeroHeading = headingLevel;
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setActive((x) => (x + 1) % banners.length),
      6500,
    );
    return () => clearInterval(id);
  }, []);
  const banner = banners[active];
  return (
    <div className={s.banners}>
      <div
        className={s.hero}
        aria-roledescription="carousel"
        aria-label="Featured promotions"
      >
        <div className={s.heroCopy}>
          <span className={s.eyebrow}>{banner.eyebrow}</span>
          <HeroHeading className={s.heroTitle}>{banner.title}</HeroHeading>
          <p>{banner.description}</p>
          <Link className={s.cta} to={banner.to}>
            {banner.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className={s.art}>
          <div className={s.circle} />
          <img
            key={banner.photo}
            src={image(banner.photo, 700)}
            alt="Featured everyday essentials"
          />
          <span className={s.dealTag}>{banner.tag}</span>
        </div>
        <button
          className={`${s.arrow} ${s.prev}`}
          aria-label="Previous promotion"
          onClick={() =>
            setActive((active + banners.length - 1) % banners.length)
          }
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className={`${s.arrow} ${s.next}`}
          aria-label="Next promotion"
          onClick={() => setActive((active + 1) % banners.length)}
        >
          <ChevronRight size={18} />
        </button>
        <div className={s.dots}>
          {banners.map((b, i) => (
            <button
              key={b.title}
              aria-label={`Show promotion ${i + 1}`}
              aria-pressed={i === active}
              className={i === active ? s.activeDot : ""}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
        <span className={s.slideCount}>
          0{active + 1} / 0{banners.length}
        </span>
      </div>
      <div className={s.sideBanners}>
        <Link to="/collection/free-shipping" className={s.shipping}>
          <div>
            <span className={s.eyebrow}>A LITTLE EXTRA, ON US</span>
            <h2>
              Great finds.
              <br />
              Free delivery.
            </h2>
            <span className={s.smallCta}>
              Claim your vouchers <ArrowRight size={13} />
            </span>
          </div>
          <div className={s.truckArt}>
            <Truck size={73} strokeWidth={1} />
            <span>
              FREE
              <br />
              SHIPPING
            </span>
          </div>
        </Link>
        <Link className={s.mall} to="/collection/mall">
          <div>
            <span className={s.eyebrow}>SHOPIZ MALL</span>
            <h2>
              Brands you love.
              <br />
              Prices you’ll love more.
            </h2>
            <span className={s.smallCta}>
              Shop authentic <ArrowRight size={13} />
            </span>
          </div>
          <ShoppingBag size={76} strokeWidth={1} />
        </Link>
      </div>
    </div>
  );
}
export function QuickAccess() {
  return (
    <nav aria-label="Shopping shortcuts" className={s.quick}>
      {quickItems.map(([label, Icon, to]) =>
        to.startsWith("/#") ? (
          <a key={label} href={to}>
            <span>
              <Icon size={23} strokeWidth={1.5} />
            </span>
            {label}
          </a>
        ) : (
          <Link key={label} to={to}>
            <span>
              <Icon size={23} strokeWidth={1.5} />
            </span>
            {label}
          </Link>
        ),
      )}
    </nav>
  );
}
export function CategoryItem({ name, index }) {
  const Icon = icons[index];
  return (
    <Link className={s.category} to={`/category/${encodeURIComponent(name)}`}>
      <span>
        <Icon size={33} strokeWidth={1.2} />
      </span>
      <p>{name}</p>
    </Link>
  );
}
export function CategoryGrid() {
  return (
    <section className={s.categorySection} id="categories">
      <div className={s.sectionTitle}>
        <h2>SHOP BY CATEGORY</h2>
        <span>Find your kind of everything</span>
      </div>
      <div className={s.categories}>
        {categories.map((name, index) => (
          <CategoryItem key={name} name={name} index={index} />
        ))}
      </div>
    </section>
  );
}
