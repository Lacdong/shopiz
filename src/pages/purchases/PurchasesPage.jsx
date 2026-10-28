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
import { useAuth } from "../../components/auth/AuthProvider";
import orderService from "../../services/orderService";
import { getNumericBuyerId } from "../../services/authService";
import { products, money } from "../../data/catalog";
import { getProductDetails } from "../../data/productDetails";
import {
  readOrders,
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
import ChatDialog from "../../components/chat/ChatDialog";

export default function PurchasesPage() {
  const { addItem } = useCart();
  const { user } = useAuth();
  const buyerId = getNumericBuyerId(user?.id);
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState(readOrders);
  const [backendOrders, setBackendOrders] = useState([]);
  const [popup, setPopup] = useState(null);
  const [notice, setNotice] = useState("");
  const [feedback, setFeedback] = useState("");
  const active = orderTabs.some(([id]) => id === params.get("status"))
    ? params.get("status")
    : "all";
  const query = params.get("q") || "";

  const contactSeller = (shop, order) => {
    const productContext =
      order?.items?.[0] ||
      order?.lines?.[0]?.product ||
      order?.product ||
      null;
    setPopup({ type: "chat", shop, productContext });
  };

  function mapBackendOrder(o) {
    let status = "to-ship";
    if (o.order_status === "UNPAID") status = "to-pay";
    else if (o.order_status === "READY_TO_SHIP" || o.order_status === "PROCESSED") status = "to-ship";
    else if (o.order_status === "SHIPPED") status = "to-receive";
    else if (o.order_status === "COMPLETED") status = "completed";
    else if (o.order_status === "CANCELLED") status = "cancelled";
    if (o.has_return || o.return_status) status = "returns";

    return {
      id: o.order_sn,
      orderSn: o.order_sn,
      backendStatus: o.order_status,
      status,
      createdAt: o.create_time ? new Date(o.create_time * 1000).toISOString() : new Date().toISOString(),
      items: (o.items || []).map((it) => ({
        productId: String(it.item_id),
        itemId: it.item_id,
        modelId: it.model_id,
        title: it.item_name,
        variant: it.model_name ? it.model_name.split(",")[0]?.trim() : "Standard",
        size: it.model_name && it.model_name.includes(",") ? it.model_name.split(",")[1]?.trim() : "",
        quantity: it.model_quantity_purchased || 1,
        price: it.model_discounted_price || it.model_original_price || 0,
        image: it.image || "",
      })),
      subtotal: Number(o.total_amount || 0),
      shippingFee: Number(o.buyer_paid_shipping_fee || 0),
      discount: 0,
      total: Number(o.total_amount || 0),
      payment: o.payment_method || "cod",
      shipping: [{ method: o.shipping_carrier || "Shopee Xpress", fee: Number(o.buyer_paid_shipping_fee || 0) }],
      hasReviewed: o.has_reviewed,
      hasReturn: o.has_return,
      returnStatus: o.return_status,
      isBackend: true,
    };
  }

  const loadBackendOrders = () => {
    const token =
      localStorage.getItem("shopiz-auth-token") ||
      sessionStorage.getItem("shopiz-auth-token");
    if (!token) return;
    orderService
      .getOrders(buyerId)
      .then((serverOrders) => {
        if (serverOrders && Array.isArray(serverOrders)) {
          setBackendOrders(serverOrders.map(mapBackendOrder));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadBackendOrders();
  }, [buyerId]);

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
    if (key === "q" && value) {
      next.delete("status");
    }
    setParams(next, { replace: key === "q" });
  }

  const all = [
    ...backendOrders,
    ...orders.filter((o) => !backendOrders.some((b) => b.id === o.id)),
  ];

  async function handleConfirmDelivery(order) {
    try {
      await orderService.confirmDelivery(order.orderSn || order.id, buyerId);
      setNotice("Delivery confirmed! Your order is now marked as Completed.");
      loadBackendOrders();
    } catch (err) {
      setNotice(`Failed to confirm delivery: ${err.message}`);
    }
  }

  async function submitAction(value) {
    if (popup.type === "return") {
      const orderSn = popup.order.orderSn || popup.order.id;
      const formData = new FormData();
      formData.append("order_sn", orderSn);
      formData.append("reason", value.reason);
      formData.append("refund_amount", String(popup.order.total));
      formData.append("description", value.description || "");
      if (value.files?.length) {
        value.files.forEach((file) => formData.append("files", file));
      }
      try {
        await orderService.requestReturn(formData);
        setPopup(null);
        setFeedback("Return and refund request submitted successfully to Shopee.");
        loadBackendOrders();
      } catch (err) {
        setFeedback(`Return request failed: ${err.message}`);
      }
      return;
    }

    if (popup.type === "review" && popup.order.isBackend) {
      const firstItem = popup.order.items[0];
      try {
        await orderService.createReview({
          orderSn: popup.order.orderSn || popup.order.id,
          itemId: firstItem.itemId || Number(firstItem.productId) || 10001,
          modelId: firstItem.modelId,
          ratingStar: value.rating,
          comment: value.comment,
          buyerUsername: user?.username || "demo",
          buyerUserId: buyerId,
        });
        loadBackendOrders();
      } catch {}
    } else if (popup.type === "cancel" && popup.order.isBackend) {
      try {
        await orderService.cancelOrder(
          popup.order.orderSn || popup.order.id,
          value,
          popup.order.backendStatus,
        );
        loadBackendOrders();
      } catch {}
    }

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
          const sellerName =
            getProductDetails(product)?.seller?.name ||
            item.shopName ||
            "Official Store";
          return [item.title, sellerName];
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
              const details = getProductDetails(product);
              const shop = details?.seller || {
                id: item.shopId || "shop-001",
                name: item.shopName || "Official Store",
                rating: "4.9",
                followers: "15.4k",
                responseRate: "99%",
              };
              let group = list.find((group) => group.shop.id === shop.id);
              if (!group) {
                group = { shop, items: [] };
                list.push(group);
              }
              const safeProduct = product || {
                id: item.productId,
                title: item.title,
                image:
                  item.image ||
                  "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85",
                price: item.price,
                original: item.price,
              };
              group.items.push({ ...item, product: safeProduct });
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
                          contactSeller(group.shop, order)
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
                          <img
                            src={
                              item.product?.image ||
                              item.image ||
                              "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85"
                            }
                            alt={item.title}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85";
                            }}
                          />
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
                          {item.product?.original > item.price && (
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
                    {order.isBackend && (order.status === "to-receive" || order.backendStatus === "SHIPPED") ? (
                      <>
                        <button
                          className={s.primary}
                          onClick={() => handleConfirmDelivery(order)}
                        >
                          Confirm Delivery
                        </button>
                        <button
                          onClick={() =>
                            contactSeller(groups[0].shop, order)
                          }
                        >
                          Contact Seller
                        </button>
                        <button onClick={() => buyAgain(order)}>
                          Buy Again
                        </button>
                      </>
                    ) : orderStatus(order) === "completed" ? (
                      <>
                        <button
                          className={s.primary}
                          onClick={() => setPopup({ type: "review", order })}
                        >
                          {order.review ? "Edit Review" : "Review"}
                        </button>
                        <button
                          onClick={() => setPopup({ type: "return", order })}
                        >
                          Return / Refund
                        </button>
                        <button
                          onClick={() =>
                            contactSeller(groups[0].shop, order)
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
                            contactSeller(groups[0].shop, order)
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
                            contactSeller(groups[0].shop, order)
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
      {popup &&
        ["review", "cancel", "cancellation", "return"].includes(popup.type) && (
        <OrderActionDialog
          key={`${popup.type}-${popup.order.id}`}
          type={popup.type}
          order={popup.order}
          onClose={() => setPopup(null)}
          onSubmit={submitAction}
        />
      )}
      {popup && popup.type === "chat" && (
        <ChatDialog
          isOpen={true}
          shop={popup.shop}
          productContext={popup.productContext}
          onClose={() => setPopup(null)}
        />
      )}
      {popup && popup.type === "details" && (
        <CheckoutDialog
          title="Order Details"
          onClose={() => setPopup(null)}
        >
          <div className={dialogStyles.dialogBody}>
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
          </div>
          <footer className={dialogStyles.dialogFooter}>
            <button
              className={dialogStyles.secondary}
              onClick={() => setPopup(null)}
            >
              Close
            </button>
          </footer>
        </CheckoutDialog>
      )}
    </div>
  );
}
