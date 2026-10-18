import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Store,
  MessageCircle,
  Truck,
  PackageOpen,
  CheckCircle2,
} from "lucide-react";
import AccountSidebar from "../../components/account/AccountSidebar";
import { useCart } from "../../components/cart/CartProvider";
import { products, money } from "../../data/catalog";
import { getProductDetails } from "../../data/productDetails";
import {
  readOrders,
  sampleOrders,
  orderTabs,
  orderStatus,
  statusLabel,
  orderStorageKey,
  updateOrderAction,
} from "../../data/orders";
import CheckoutDialog from "../checkout/CheckoutDialog";
import dialogStyles from "../checkout/CheckoutPage.module.css";
import s from "./PurchasesPage.module.css";
import OrderActionDialog from "./OrderActionDialog";

export default function PurchasesPage() {
  const { addItem } = useCart();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(readOrders);
  const [popup, setPopup] = useState(null);
  const [notice, setNotice] = useState("");
  const [feedback, setFeedback] = useState("");
  const active = orderTabs.some(([id]) => id === params.get("status"))
    ? params.get("status")
    : "all";
  const query = params.get("q") || "";
  useEffect(() => {
    function sync(e) {
      if (e.key === orderStorageKey || e.key === null) setOrders(readOrders());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: key === "q" });
  }
  const all = [
    ...orders,
    ...sampleOrders.filter(
      (sample) => !orders.some((order) => order.id === sample.id),
    ),
  ];
  function submitAction(value) {
    const result = updateOrderAction(popup.order.id, popup.type, value);
    setPopup(null);
    setOrders(readOrders());
    setFeedback(
      result.success
        ? `${popup.type === "review" ? "Your review has been saved." : "Your order has been cancelled."}${result.saved ? "" : " Browser storage is unavailable; this change is kept for this visit only."}`
        : result.error,
    );
  }
  const shown = all
    .filter((order) => active === "all" || orderStatus(order) === active)
    .filter((order) => {
      const text = [
        order.id,
        ...order.items.flatMap((item) => {
          const product = products.find(
            (product) => product.id === item.productId,
          );
          return [item.title, getProductDetails(product).seller.name];
        }),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });
  function buyAgain(order) {
    let added = 0;
    const errors = [];
    for (const item of order.items) {
      const result = addItem(item);
      added += result.added || 0;
      if (result.error) errors.push(result.error);
      else if (result.limited) errors.push("Stock limit reached.");
    }
    setNotice(
      added
        ? `Added ${added} ${added === 1 ? "item" : "items"} to your cart.${errors.length ? " Some items reached their stock limit." : ""}`
        : "These items have reached their stock limit. Review your cart.",
    );
  }
  return (
    <div className={s.page}>
      <AccountSidebar />
      <section className={s.content} aria-label="Purchase history">
        <h1 className={s.srOnly}>My Purchases</h1>
        <nav className={s.tabs} aria-label="Order status">
          {orderTabs.map(([id, label]) => (
            <button
              key={id}
              className={active === id ? s.active : ""}
              aria-current={active === id ? "page" : undefined}
              onClick={() => update("status", id === "all" ? "" : id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <label className={s.search}>
          <Search size={17} />
          <input
            aria-label="Search orders"
            placeholder="Search by shop name, order ID or product name"
            value={query}
            onChange={(e) => update("q", e.target.value)}
          />
          {query && <button onClick={() => update("q", "")}>Clear</button>}
        </label>
        {notice && (
          <div className={s.notice} role="status">
            <CheckCircle2 size={16} />
            <span>{notice}</span>
            <Link to="/cart">View Cart</Link>
            <button
              aria-label="Dismiss cart notification"
              onClick={() => setNotice("")}
            >
              ×
            </button>
          </div>
        )}
        <p className={s.demoNote}>
          Browser-local demo orders · Sample orders are labelled below.
        </p>
        {feedback && (
          <p className={s.actionFeedback} role="status">
            {feedback}
          </p>
        )}
        {shown.length ? (
          shown.map((order) => {
            const groups = order.items.reduce((list, item) => {
              const product = products.find(
                (product) => product.id === item.productId,
              );
              const shop = getProductDetails(product).seller;
              let group = list.find((group) => group.shop.id === shop.id);
              if (!group) {
                group = { shop, items: [] };
                list.push(group);
              }
              group.items.push({ ...item, product });
              return list;
            }, []);
            return (
              <article
                key={order.id}
                className={s.order}
                aria-label={`Order ${order.id}`}
              >
                {groups.map((group) => (
                  <section key={group.shop.id}>
                    <header className={s.shopHeader}>
                      <span className={s.mall}>Mall</span>
                      <Link
                        to={`/shop/${group.shop.id}`}
                        className={s.shopName}
                      >
                        {group.shop.name}
                      </Link>
                      <button
                        className={s.chat}
                        onClick={() =>
                          setPopup({ type: "chat", shop: group.shop })
                        }
                      >
                        <MessageCircle size={12} />
                        Chat
                      </button>
                      <Link className={s.visit} to={`/shop/${group.shop.id}`}>
                        <Store size={12} />
                        View Shop
                      </Link>
                      <div className={s.status}>
                        {orderStatus(order) === "completed" && (
                          <span>
                            <Truck size={14} />
                            Delivered successfully
                          </span>
                        )}
                        <strong>{statusLabel(order)}</strong>
                      </div>
                    </header>
                    {group.items.map((item, index) => (
                      <div
                        className={s.product}
                        key={`${item.productId}-${index}`}
                      >
                        <Link to={`/product/${item.productId}`}>
                          <img src={item.product.image} alt={item.title} />
                        </Link>
                        <div>
                          <Link to={`/product/${item.productId}`}>
                            {item.title}
                          </Link>
                          <p>
                            Variation: {item.variant}
                            {item.size ? ` · ${item.size}` : ""}
                          </p>
                          <span>x{item.quantity}</span>
                        </div>
                        <div className={s.price}>
                          {item.product.original > item.price && (
                            <del>{money(item.product.original)}</del>
                          )}
                          <strong>{money(item.price)}</strong>
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
                <footer className={s.orderFooter}>
                  <div className={s.meta}>
                    <button
                      className={s.orderDetailsLink}
                      aria-label="Order Details"
                      onClick={() => setPopup({ type: "details", order })}
                    >
                      {order.isSample ? `Sample order · ${order.id}` : order.id}
                    </button>
                    <time dateTime={order.createdAt}>
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                  <p className={s.total}>
                    Order Total:<strong>{money(order.total)}</strong>
                  </p>
                  <div className={s.actions}>
                    <span>
                      {orderStatus(order) === "cancelled"
                        ? order.isSample
                          ? "Cancelled in the sample history"
                          : "Cancelled by you"
                        : orderStatus(order) === "completed"
                          ? "Thank you for shopping with Shopiz"
                          : "Awaiting seller confirmation or shipping"}
                    </span>
                    {orderStatus(order) === "completed" ? (
                      <>
                        <button
                          className={s.primary}
                          onClick={() => setPopup({ type: "review", order })}
                        >
                          {order.review ? "Edit Review" : "Review"}
                        </button>
                        <button
                          onClick={() =>
                            setPopup({ type: "chat", shop: groups[0].shop })
                          }
                        >
                          Contact Seller
                        </button>
                        <button onClick={() => buyAgain(order)}>
                          Buy Again
                        </button>
                      </>
                    ) : orderStatus(order) === "cancelled" ? (
                      <>
                        <button
                          className={s.primary}
                          onClick={() => buyAgain(order)}
                        >
                          Buy Again
                        </button>
                        <button
                          onClick={() =>
                            setPopup({ type: "cancellation", order })
                          }
                        >
                          View Cancellation Details
                        </button>
                        <button
                          onClick={() =>
                            setPopup({ type: "chat", shop: groups[0].shop })
                          }
                        >
                          Contact Seller
                        </button>
                      </>
                    ) : (
                      <>
                        <button className={s.pending} disabled>
                          Pending
                        </button>
                        <button
                          onClick={() =>
                            setPopup({ type: "chat", shop: groups[0].shop })
                          }
                        >
                          Contact Seller
                        </button>
                        <button
                          onClick={() => setPopup({ type: "cancel", order })}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}
                  </div>
                </footer>
              </article>
            );
          })
        ) : (
          <section className={s.empty}>
            <PackageOpen size={43} strokeWidth={1.2} />
            <h2>No orders found</h2>
            <p>
              {query
                ? "Try another order ID, product or shop name."
                : "You have no orders in this category yet."}
            </p>
            <button onClick={() => setParams({})}>View All Orders</button>
            <Link to="/">Continue Shopping</Link>
          </section>
        )}
      </section>
      {popup && ["review", "cancel", "cancellation"].includes(popup.type) && (
        <OrderActionDialog
          key={`${popup.type}-${popup.order.id}`}
          type={popup.type}
          order={popup.order}
          onClose={() => setPopup(null)}
          onSubmit={submitAction}
        />
      )}
      {popup && ["details", "chat"].includes(popup.type) && (
        <CheckoutDialog
          title={
            popup.type === "details"
              ? "Order Details"
              : `Contact ${popup.shop.name}`
          }
          onClose={() => setPopup(null)}
        >
          <div className={dialogStyles.dialogBody}>
            {popup.type === "details" ? (
              <>
                <p className={s.detailId}>{popup.order.id}</p>
                <p className={s.demoNote}>
                  {popup.order.isSample ? "Sample order" : "Demo order"} ·{" "}
                  {statusLabel(popup.order)}
                </p>
                {popup.order.items.map((item, index) => (
                  <p key={index} className={s.detailLine}>
                    <span>
                      {item.title} × {item.quantity}
                    </span>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </p>
                ))}
                <dl className={s.breakdown}>
                  {[
                    ["Merchandise Subtotal", popup.order.subtotal],
                    ["Shipping", popup.order.shippingFee],
                    ["Voucher Discount", -popup.order.discount],
                    ["Order Total", popup.order.total],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {value < 0 ? "−" : ""}
                        {money(Math.abs(value))}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className={s.demoNote}>
                  Payment:{" "}
                  {popup.order.payment === "wallet"
                    ? "Demo wallet"
                    : "Cash on delivery"}
                  . No real payment or shipment.
                </p>
              </>
            ) : (
              <p className={dialogStyles.muted}>
                Seller messaging is not connected in this demo. You can browse
                the shop’s products below.
              </p>
            )}
          </div>
          <footer className={dialogStyles.dialogFooter}>
            <button
              className={dialogStyles.secondary}
              onClick={() => setPopup(null)}
            >
              Close
            </button>
            {popup.type === "chat" && (
              <Link
                className={dialogStyles.primary}
                to={`/shop/${popup.shop.id}`}
              >
                View Shop
              </Link>
            )}
          </footer>
        </CheckoutDialog>
      )}
    </div>
  );
}
