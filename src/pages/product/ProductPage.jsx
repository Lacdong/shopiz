import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
import { useAuth } from "../../components/auth/AuthProvider";
import catalogService, { mapBackendProduct } from "../../services/catalogService";
import ChatDialog from "../../components/chat/ChatDialog";
import s from "./ProductPage.module.css";

function ProductDetail({ product: p }) {
  const { addItem } = useCart();
  const { user, buyerId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [likeState, setLikeState] = useState({ liked: false, likes: 0 });
  const itemId = p.itemId || p.id;
  const backendItem = Boolean(p.itemId);
  const [cartNotice, setCartNotice] = useState(null);
  useEffect(() => {
    if (!cartNotice) return;
    const timer = setTimeout(
      () => setCartNotice(null),
      cartNotice.error ? 5000 : 3000,
    );
    return () => clearTimeout(timer);
  }, [cartNotice]);

  const catTitle =
    typeof p.category === "string"
      ? p.category
      : p.category?.category_name || "General";

  const isMockItem = Number(p.id) >= 1 && Number(p.id) <= 18 && p.price < 1000;
  const details = getProductDetails(p);
  const [variant, setVariant] = useState(details.variants[0] || "Standard");
  const [size, setSize] = useState(details.sizes[0] || "");
  const [quantity, setQuantity] = useState("1");
  const [destination, setDestination] = useState("Ho Chi Minh City");
  const [delivery, setDelivery] = useState(isMockItem ? "standard" : "30001");
  const [shippingChannels, setShippingChannels] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const preview = useRef(null);

  useEffect(() => {
    if (!backendItem || !user || !buyerId) return;
    let active = true;
    catalogService.getProductLike(itemId, buyerId).then((data) => {
      if (active) setLikeState({ liked: Boolean(data.liked), likes: Number(data.likes || 0) });
    }).catch(() => {});
    return () => { active = false; };
  }, [backendItem, itemId, buyerId, user]);

  async function toggleLike() {
    if (!user || !buyerId) {
      navigate("/login", { state: { returnTo: `${location.pathname}${location.search}${location.hash}` } });
      return;
    }
    if (!backendItem) {
      setMessage("Favorites are available for simulator products after sign-in.");
      return;
    }
    try {
      const data = await catalogService.toggleProductLike(itemId, buyerId);
      setLikeState({ liked: Boolean(data.liked), likes: Number(data.likes || 0) });
    } catch {
      setMessage("Could not update favorites. Please try again.");
    }
  }

  // Model-specific pricing and stock if multi-variant
  const selectedModel =
    Array.isArray(p.models) && p.models.length > 0
      ? p.models.find((m) => {
          const name = (m.model_name || "").toLowerCase();
          const v = (variant || "").toLowerCase();
          const sz = (size || "").toLowerCase();
          if (sz) {
            return name.includes(v) && name.includes(sz);
          }
          return name.includes(v);
        }) || p.models[0]
      : null;

  const currentPrice = selectedModel?.current_price ?? p.price ?? 0;
  const currentOriginal =
    selectedModel?.original_price ?? p.original ?? currentPrice;
  const currentStock = selectedModel?.seller_stock ?? details.stock ?? 50;

  const count = Math.max(
    1,
    Math.min(currentStock, Math.floor(Number(quantity) || 1)),
  );

  // Dynamic shipping calculation for backend simulator products
  useEffect(() => {
    if (isMockItem) return;

    let active = true;
    setShippingLoading(true);

    const items = [
      {
        item_id: p.itemId || p.id,
        item_price: currentPrice,
        quantity: count,
      },
    ];

    catalogService
      .calculateShippingFee({
        shopId: p.shopId || p.seller?.id || 727720655,
        recipientCity: destination,
        items,
      })
      .then((res) => {
        if (!active) return;
        const channels = res?.channels || [];
        setShippingChannels(channels);
        const currentChannel = channels.find(
          (c) => String(c.channel_id || c.channelId) === String(delivery),
        );
        if (!currentChannel || !currentChannel.enabled) {
          const firstEnabled = channels.find((c) => c.enabled);
          if (firstEnabled) {
            setDelivery(String(firstEnabled.channel_id || firstEnabled.channelId));
          }
        }
      })
      .catch((err) => {
        console.warn("Could not calculate dynamic shipping fee:", err);
      })
      .finally(() => {
        if (active) setShippingLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isMockItem, p.shopId, p.seller?.id, p.itemId, p.id, destination, count, currentPrice]);

  const activeChannel =
    shippingChannels.find(
      (c) => String(c.channel_id || c.channelId) === String(delivery),
    ) || shippingChannels[0];

  const shippingFee = isMockItem
    ? delivery === "express"
      ? 2.9
      : 0
    : activeChannel
      ? Number(
          activeChannel.buyer_paid_shipping_fee ??
            activeChannel.buyerPaidShippingFee ??
            0,
        )
      : 0;

  const estimatedDays = isMockItem
    ? `${delivery === "express" ? "1–2" : "3–5"} business days`
    : activeChannel
      ? activeChannel.estimated_delivery_days ||
        activeChannel.estimatedDeliveryDays ||
        "1–3 business days"
      : "1–3 business days";

  const related = products
    .filter((x) => String(x.id) !== String(p.id))
    .sort(
      (a, b) =>
        Number((a.category || "") === catTitle) -
        Number((b.category || "") === catTitle),
    )
    .slice(0, 6);
  function showPreview() {
    setQuantity(String(count));
    preview.current.showModal();
  }
  function addToCart() {
    setQuantity(String(count));
    const result = addItem({
      productId: p.id,
      modelId: selectedModel?.model_id,
      variant,
      size,
      quantity: count,
      price: currentPrice,
      shippingFee,
      carrierName: activeChannel?.channel_name || activeChannel?.channelName || "SPX Express",
    });
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
        <Link to={`/category/${encodeURIComponent(catTitle)}`}>
          {catTitle}
        </Link>
        <ChevronRight size={12} />
        <span>{p.title || "Product"}</span>
      </nav>
      <section className={s.overview}>
        <ProductGallery
          product={p}
          gallery={details.gallery}
          onMessage={setMessage}
          liked={likeState.liked}
          likeCount={likeState.likes}
          onToggleLike={toggleLike}
        />
        <div className={s.purchase}>
          <h1>
            {p.mall && <span className={s.mallBadge}>Mall</span>}
            {p.title}
          </h1>
          <div className={s.metrics}>
            <a href="#product-reviews">
              <strong>{p.rating || "5.0"}</strong>
              <Stars rating={Number(p.rating) || 5.0} />
            </a>
            <a href="#product-reviews">
              <strong>{(details.reviews || []).length}</strong>Ratings
            </a>
            <span>
              <strong>{(p.sold ?? 0).toLocaleString()}</strong>Sold
            </span>
          </div>
          <div className={s.pricePanel}>
            <div>
              <del>{money(currentOriginal)}</del>
              <strong>{money(currentPrice)}</strong>
              {p.discount ? <span>{p.discount}% OFF</span> : null}
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
                  Ships from {p.location || "Ho Chi Minh City"}
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
                    disabled={shippingLoading && !shippingChannels.length}
                  >
                    {isMockItem ? (
                      <>
                        <option value="standard">Standard · Free</option>
                        <option value="express">Express · {money(2.9)}</option>
                      </>
                    ) : shippingChannels.length > 0 ? (
                      shippingChannels.map((c) => {
                        const cid = String(c.channel_id || c.channelId);
                        const cname = c.channel_name || c.channelName;
                        const fee = Number(
                          c.buyer_paid_shipping_fee ?? c.buyerPaidShippingFee ?? 0,
                        );
                        const feeStr = fee === 0 ? "Free" : money(fee);
                        const isDis = !c.enabled;
                        const disReason = c.disabled_reason || c.disabledReason;
                        return (
                          <option key={cid} value={cid} disabled={isDis}>
                            {cname} · {feeStr} {isDis && disReason ? `(${disReason})` : ""}
                          </option>
                        );
                      })
                    ) : (
                      <>
                        <option value="30001">SPX Express · Free</option>
                        <option value="30002">SPX Instant · {money(25000)}</option>
                        <option value="30003">SPX Economy · Free</option>
                      </>
                    )}
                  </select>
                </label>
                <small>
                  {shippingLoading ? (
                    "Calculating shipping fee..."
                  ) : (
                    <>Estimated delivery: {estimatedDays}</>
                  )}
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
                    max={currentStock}
                    step="1"
                    aria-label="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    onBlur={() => setQuantity(String(count))}
                  />
                  <button
                    aria-label="Increase quantity"
                    disabled={count >= currentStock}
                    onClick={() => setQuantity(String(count + 1))}
                  >
                    <Plus size={13} />
                  </button>
                </div>
                <span>{currentStock} pieces available</span>
              </dd>
            </div>
          </dl>
          <div className={s.buyActions}>
            <button className={s.addToCart} onClick={addToCart}>
              <ShoppingCart size={19} />
              Add to Cart
            </button>
            <button className={s.buyNow} onClick={showPreview}>
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
            <h2>{details.seller?.name || p.shopName || "Official Store"}</h2>
            <p>Online recently</p>
            <div>
              <button onClick={() => setChatOpen(true)}>
                <MessageCircle size={13} />
                Chat Now
              </button>
              <Link to={`/shop/${details.seller?.id || p.shopId || "shop-001"}`}>
                <Store size={13} />
                View Shop
              </Link>
            </div>
          </div>
        </div>
        <dl className={s.sellerStats}>
          {[
            ["Ratings", details.seller?.rating || "4.9"],
            ["Products", details.seller?.products || 24],
            ["Response rate", details.seller?.responseRate || details.seller?.response_rate || "98%"],
            ["Response time", details.seller?.responseTime || "Within a few hours"],
            ["Joined", details.seller?.joined || "2 years ago"],
            ["Followers", details.seller?.followers || "15.4k"],
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
            ["Category", catTitle],
            ["Brand", details.brand || "Shopiz Select"],
            ["SKU", details.sku || "SZ-0001"],
            ["Material", details.material || "High Quality Material"],
            ["Condition", "New"],
            ["Stock", `${currentStock} pieces`],
            ["Ships from", p.location || "Ho Chi Minh City"],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {label === "Category" ? (
                  <Link to={`/category/${encodeURIComponent(value)}`}>
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
            {(details.highlights || []).map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
          <h4>What’s included</h4>
          <p>
            1 × {(p.title || "").split(" · ")[0]}. Select your preferred{" "}
            {(details.option || "style").toLowerCase()}
            {details.sizes?.length ? " and size" : ""} before reviewing your
            order.
          </p>
          <p className={s.demoNote}>
            This is a sample product listing. Specifications, stock and reviews
            are demonstration data. Gallery detail images are crops of the main
            product photo.
          </p>
        </div>
      </section>
      <ProductReviews product={p} reviews={details.reviews || []} />
      <ProductGrid
        items={related}
        title="MORE FROM THIS COLLECTION"
        subtitle="Find something that goes together"
        loadMore={false}
      />
      <ProductGrid
        items={products.filter((x) => String(x.id) !== String(p.id)).slice(-6)}
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
        <h2 id="preview-heading">Review your selection</h2>
        <div className={s.orderItem}>
          <img src={p.image} alt={p.title} />
          <div>
            <h3>{p.title}</h3>
            <p>
              {variant}
              {size ? ` · ${size}` : ""} · Quantity: {count}
            </p>
            <strong>{money(currentPrice * count)}</strong>
          </div>
        </div>
        <dl className={s.orderTotals}>
          <div>
            <dt>Delivery to</dt>
            <dd>{destination}</dd>
          </div>
          <div>
            <dt>Carrier</dt>
            <dd>{activeChannel?.channel_name || activeChannel?.channelName || "SPX Express"}</dd>
          </div>
          <div>
            <dt>Shipping</dt>
            <dd>{money(shippingFee)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{money(currentPrice * count + shippingFee)}</dd>
          </div>
        </dl>
        <p className={s.demoNote}>
          <PackageCheck size={16} />
          This is a selection preview. Checkout is not available.
        </p>
      </dialog>
      <ChatDialog
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        shop={details.seller || { id: p.shopId, name: p.shopName }}
        productContext={{
          id: p.id,
          title: p.title,
          image: p.image,
          price: currentPrice,
        }}
      />
    </div>
  );
}
export default function ProductPage() {
  const { id } = useParams();
  const lastVisited = useRef(null);
  const localProduct = products.find((p) => String(p.id) === String(id));
  const [product, setProduct] = useState(localProduct || null);
  const [loading, setLoading] = useState(!localProduct);

  useEffect(() => {
    let isMounted = true;
    const found = products.find((p) => String(p.id) === String(id));
    if (found) {
      setProduct(found);
    } else {
      setLoading(true);
    }

    catalogService
      .getProductDetail(id)
      .then((detail) => {
        if (isMounted && detail) {
          const mapped = mapBackendProduct(detail);
          setProduct(mapped);
          if (lastVisited.current !== String(id)) {
            lastVisited.current = String(id);
            catalogService.recordProductView(id).catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch remote product detail:", err);
        if (isMounted && !found) {
          setProduct(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading product details...
      </div>
    );
  }

  return product ? (
    <ProductDetail key={product.id} product={product} />
  ) : (
    <Placeholder title="Product not found" />
  );
}
