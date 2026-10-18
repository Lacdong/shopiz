import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  MessageCircle,
  Store,
  Ticket,
  X,
  PackageCheck,
  Check,
} from "lucide-react";
import { products, money } from "../../data/catalog";
import { ProductGrid } from "../../components/Commerce";
import Placeholder from "../placeholder/PlaceholderPage";
import ProductGallery from "./ProductGallery";
import ProductReviews, { Stars } from "./ProductReviews";
import { getProductDetails } from "../../data/productDetails";
import { useCart } from "../../components/cart/CartProvider";
import s from "./ProductPage.module.css";

function ProductDetail({ product: p }) {
  const { addItem } = useCart();
  const [cartNotice, setCartNotice] = useState(null);
  useEffect(() => {
    if (!cartNotice) return;
    const timer = setTimeout(
      () => setCartNotice(null),
      cartNotice.error ? 5000 : 3000,
    );
    return () => clearTimeout(timer);
  }, [cartNotice]);
  const details = getProductDetails(p);
  const [variant, setVariant] = useState(details.variants[0]);
  const [size, setSize] = useState(details.sizes[0] || "");
  const [quantity, setQuantity] = useState("1");
  const [destination, setDestination] = useState("Ho Chi Minh City");
  const [delivery, setDelivery] = useState("standard");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("buy");
  const preview = useRef(null);
  const count = Math.max(
    1,
    Math.min(details.stock, Math.floor(Number(quantity) || 1)),
  );
  const shipping = delivery === "express" ? 2.9 : 0;
  const related = products
    .filter((x) => x.id !== p.id)
    .sort(
      (a, b) =>
        Number(b.category === p.category) - Number(a.category === p.category),
    )
    .slice(0, 6);
  function showPreview(next) {
    setQuantity(String(count));
    setMode(next);
    preview.current.showModal();
  }
  function addToCart() {
    setQuantity(String(count));
    const result = addItem({ productId: p.id, variant, size, quantity: count });
    setCartNotice({
      id: Date.now(),
      error: !result.added,
      text: result.added
        ? `Product added to cart.${result.limited ? " Quantity adjusted to available stock." : ""}`
        : result.error,
    });
  }
  return (
    <div className={s.page}>
      {cartNotice && (
        <div
          key={cartNotice.id}
          className={s.cartToast}
          role={cartNotice.error ? "alert" : "status"}
          aria-atomic="true"
        >
          {cartNotice.error ? <ShoppingCart size={21} /> : <Check size={23} />}
          <span>{cartNotice.text}</span>
        </div>
      )}
      <nav className={s.breadcrumb} aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/category/${encodeURIComponent(p.category)}`}>
          {p.category}
        </Link>
        <ChevronRight size={12} />
        <span>{p.title}</span>
      </nav>
      <section className={s.overview}>
        <ProductGallery
          product={p}
          gallery={details.gallery}
          onMessage={setMessage}
        />
        <div className={s.purchase}>
          <h1>
            {p.mall && <span className={s.mallBadge}>Mall</span>}
            {p.title}
          </h1>
          <div className={s.metrics}>
            <a href="#product-reviews">
              <strong>{p.rating}</strong>
              <Stars rating={Number(p.rating)} />
            </a>
            <a href="#product-reviews">
              <strong>{details.reviews.length}</strong>Ratings
            </a>
            <span>
              <strong>{p.sold.toLocaleString()}</strong>Sold
            </span>
          </div>
          <div className={s.pricePanel}>
            <div>
              <del>{money(p.original)}</del>
              <strong>{money(p.price)}</strong>
              <span>{p.discount}% OFF</span>
            </div>
            <p>
              <ShieldCheck size={14} />
              Everyday value, selected for you.
            </p>
          </div>
          <dl className={s.purchaseRows}>
            <div>
              <dt>Shop offers</dt>
              <dd>
                <Link className={s.voucher} to="/vouchers">
                  <Ticket size={14} />
                  Explore vouchers
                  <ChevronRight size={12} />
                </Link>
              </dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>
                <span className={s.deliveryLine}>
                  <Truck size={17} />
                  Ships from {p.location}
                </span>
                <label className={s.deliveryLabel}>
                  Deliver to{" "}
                  <select
                    aria-label="Delivery destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    {["Ho Chi Minh City", "Hanoi", "Da Nang"].map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </label>
                <label className={s.deliveryLabel}>
                  Shipping{" "}
                  <select
                    aria-label="Shipping method"
                    value={delivery}
                    onChange={(e) => setDelivery(e.target.value)}
                  >
                    <option value="standard">Standard · Free</option>
                    <option value="express">Express · {money(2.9)}</option>
                  </select>
                </label>
                <small>
                  Estimated delivery: {delivery === "express" ? "1–2" : "3–5"}{" "}
                  business days
                </small>
              </dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>
                <span className={s.deliveryLine}>
                  <RotateCcw size={16} />
                  15-day easy returns
                </span>
                <small>Illustrative shipping and return benefits.</small>
              </dd>
            </div>
            <div>
              <dt>{details.option}</dt>
              <dd
                className={s.optionGroup}
                role="group"
                aria-label={details.option}
              >
                {details.variants.map((value) => (
                  <button
                    key={value}
                    aria-pressed={variant === value}
                    className={variant === value ? s.selectedOption : ""}
                    onClick={() => setVariant(value)}
                  >
                    {value}
                    {variant === value && <Check size={11} />}
                  </button>
                ))}
              </dd>
            </div>
            {details.sizes.length > 0 && (
              <div>
                <dt>Size</dt>
                <dd className={s.optionGroup} role="group" aria-label="Size">
                  {details.sizes.map((value) => (
                    <button
                      key={value}
                      aria-pressed={size === value}
                      className={size === value ? s.selectedOption : ""}
                      onClick={() => setSize(value)}
                    >
                      {value}
                    </button>
                  ))}
                </dd>
              </div>
            )}
            <div>
              <dt>Quantity</dt>
              <dd className={s.quantityRow}>
                <div className={s.quantity}>
                  <button
                    aria-label="Decrease quantity"
                    disabled={count <= 1}
                    onClick={() => setQuantity(String(count - 1))}
                  >
                    <Minus size={13} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={details.stock}
                    step="1"
                    aria-label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onBlur={() => setQuantity(String(count))}
                  />
                  <button
                    aria-label="Increase quantity"
                    disabled={count >= details.stock}
                    onClick={() => setQuantity(String(count + 1))}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span>{details.stock} pieces available</span>
              </dd>
            </div>
          </dl>
          <div className={s.buyActions}>
            <button className={s.addToCart} onClick={addToCart}>
              <ShoppingCart size={19} />
              Add to Cart
            </button>
            <button className={s.buyNow} onClick={() => showPreview("buy")}>
              Buy Now
            </button>
          </div>
          <div className={s.assurance}>
            <ShieldCheck size={21} />
            <span>
              <strong>Shopiz Guarantee</strong>
              <small>A little more confidence in every find.</small>
            </span>
            <Link to="/help">
              Learn more
              <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </section>
      {message && (
        <p className={s.message} role="status">
          {message}
          <button aria-label="Dismiss message" onClick={() => setMessage("")}>
            <X size={14} />
          </button>
        </p>
      )}
      <section className={s.seller} aria-label="Seller information">
        <div className={s.sellerIdentity}>
          <span className={s.storeAvatar}>
            <Store size={28} strokeWidth={1.3} />
          </span>
          <div>
            <h2>{details.seller.name}</h2>
            <p>Online recently</p>
            <div>
              <button onClick={() => showPreview("chat")}>
                <MessageCircle size={13} />
                Chat Now
              </button>
              <Link to="/collection/mall">
                <Store size={13} />
                View Shop
              </Link>
            </div>
          </div>
        </div>
        <dl className={s.sellerStats}>
          {[
            ["Ratings", details.seller.rating],
            ["Products", details.seller.products],
            ["Response rate", details.seller.responseRate],
            ["Response time", details.seller.responseTime],
            ["Joined", details.seller.joined],
            ["Followers", details.seller.followers],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className={s.section}>
        <h2 className={s.sectionTitle}>PRODUCT SPECIFICATIONS</h2>
        <dl className={s.specs}>
          {[
            ["Category", p.category],
            ["Brand", details.brand],
            ["SKU", details.sku],
            ["Material", details.material],
            ["Condition", "New"],
            ["Stock", `${details.stock} pieces`],
            ["Ships from", p.location],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {label === "Category" ? (
                  <Link to={`/category/${encodeURIComponent(p.category)}`}>
                    {value}
                    <ChevronRight size={11} />
                  </Link>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
        <h2 className={s.sectionTitle}>PRODUCT DESCRIPTION</h2>
        <div className={s.description}>
          <h3>{p.title}</h3>
          <p>
            Meet your next everyday favorite. Part of the {details.brand}{" "}
            collection, this find brings simple design and practical details
            into your daily routine.
          </p>
          <h4>A little more in the details</h4>
          <ul>
            {details.highlights.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <h4>What’s included</h4>
          <p>
            1 × {p.title.split(" · ")[0]}. Select your preferred{" "}
            {details.option.toLowerCase()}
            {details.sizes.length ? " and size" : ""} before reviewing your
            order.
          </p>
          <p className={s.demoNote}>
            This is a sample product listing. Specifications, stock and reviews
            are demonstration data. Gallery detail images are crops of the main
            product photo.
          </p>
        </div>
      </section>
      <ProductReviews product={p} reviews={details.reviews} />
      <ProductGrid
        items={related}
        title="MORE FROM THIS COLLECTION"
        subtitle="Find something that goes together"
        loadMore={false}
      />
      <ProductGrid
        items={products.filter((x) => x.id !== p.id).slice(-6)}
        title="YOU MAY ALSO LIKE"
        loadMore={false}
      />
      <dialog
        ref={preview}
        className={s.previewDialog}
        aria-labelledby="preview-heading"
        onClick={(e) => {
          if (e.target === e.currentTarget) preview.current.close();
        }}
      >
        <button
          className={s.closeDialog}
          aria-label="Close preview"
          onClick={() => preview.current.close()}
        >
          <X size={20} />
        </button>
        <h2 id="preview-heading">
          {mode === "chat" ? "Chat with the shop" : "Review your selection"}
        </h2>
        {mode === "chat" ? (
          <>
            <p>{details.seller.name}</p>
            <p className={s.demoNote}>
              Seller messaging is not connected in this simulator.
            </p>
          </>
        ) : (
          <>
            <div className={s.orderItem}>
              <img src={p.image} alt={p.title} />
              <div>
                <h3>{p.title}</h3>
                <p>
                  {variant}
                  {size ? ` · ${size}` : ""} · Quantity: {count}
                </p>
                <strong>{money(p.price * count)}</strong>
              </div>
            </div>
            <dl className={s.orderTotals}>
              <div>
                <dt>Delivery to</dt>
                <dd>{destination}</dd>
              </div>
              <div>
                <dt>Shipping</dt>
                <dd>{money(shipping)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{money(p.price * count + shipping)}</dd>
              </div>
            </dl>
            <p className={s.demoNote}>
              <PackageCheck size={16} />
              This is a selection preview. Checkout is not available.
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}
export default function ProductPage() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  return product ? (
    <ProductDetail key={product.id} product={product} />
  ) : (
    <Placeholder title="Product not found" />
  );
}
