import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Coins,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Ticket,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../../components/cart/CartProvider";
import { useAuth } from "../../components/auth/AuthProvider";
import { getProductDetails } from "../../data/productDetails";
import { money } from "../../data/catalog";
import { voucherStatus } from "../../data/vouchers";
import VoucherDialog from "../cart/VoucherDialog";
import AddressDialog from "./AddressDialog";
import CheckoutDialog from "./CheckoutDialog";
import {
  sampleAddresses,
  shippingMethods,
  paymentMethods,
  formatAddress,
  validateAddress,
  saveMockOrder,
} from "./checkoutData";
import s from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const {
    lines,
    subtotal,
    selectedCount,
    appliedVoucher,
    applyVoucher,
    storageError,
    completeCheckout,
  } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(() =>
    sampleAddresses.map((address) => ({
      ...address,
      ...(user ? { name: user.name, phone: user.phone } : {}),
    })),
  );
  const [addressId, setAddressId] = useState("home");
  const [editor, setEditor] = useState(null);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [shipping, setShipping] = useState({});
  const [draftShipping, setDraftShipping] = useState("standard");
  const [payment, setPayment] = useState("cod");
  const [draftPayment, setDraftPayment] = useState("cod");
  const [notes, setNotes] = useState({});
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [receiptPopup, setReceiptPopup] = useState(false);
  const placing = useRef(false);
  const selected = lines.filter((line) => line.selected);
  const address =
    addresses.find((item) => item.id === addressId) || addresses[0];
  const groups = selected.reduce((list, line) => {
    const shop = getProductDetails(line.product).seller;
    const group = list.find((group) => group.shop.id === shop.id);
    if (group) group.lines.push(line);
    else list.push({ shop, lines: [line] });
    return list;
  }, []);
  const methodFor = (id) =>
    shippingMethods.find((method) => method.id === shipping[id]) ||
    shippingMethods[0];
  const shippingFee =
    groups.reduce(
      (sum, group) => sum + Math.round(methodFor(group.shop.id).fee * 100),
      0,
    ) / 100;
  const discountStatus = voucherStatus(appliedVoucher, {
    subtotal,
    selectedCount,
    shippingFee,
  });
  const discount = discountStatus.discount;
  const total = Math.max(
    0,
    (Math.round(subtotal * 100) +
      Math.round(shippingFee * 100) -
      Math.round(discount * 100)) /
      100,
  );
  function saveAddress(next) {
    if (!next) return;
    setAddresses((current) =>
      current.some((item) => item.id === next.id)
        ? current.map((item) => (item.id === next.id ? next : item))
        : [...current, next],
    );
    setAddressId(next.id);
    setEditor(null);
    setError("");
  }
  function placeOrder() {
    if (placing.current) return;
    if (Object.keys(validateAddress(address)).length) {
      setError("Please complete your delivery address.");
      setEditor({ type: "address" });
      return;
    }
    if (!selected.length) {
      setError("Select at least one product in your cart.");
      return;
    }
    placing.current = true;
    const order = {
      id: `SZ-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "demo-placed",
      items: selected.map((line) => ({
        productId: line.productId,
        title: line.product.title,
        variant: line.variant,
        size: line.size,
        quantity: line.quantity,
        price: line.product.price,
      })),
      shipping: groups.map((group) => ({
        shopId: group.shop.id,
        method: methodFor(group.shop.id).id,
        fee: methodFor(group.shop.id).fee,
      })),
      payment,
      subtotal,
      shippingFee,
      discount,
      voucherCode: discountStatus.eligible ? appliedVoucher.code : null,
      total,
    };
    if (!completeCheckout(selected)) {
      placing.current = false;
      setError(
        "Your cart has changed. Review the selected products before placing your demo order.",
      );
      return;
    }
    const saved = saveMockOrder(order);
    applyVoucher("");
    setReceipt({ ...order, saved });
    setReceiptPopup(true);
    window.scrollTo(0, 0);
  }
  if (receipt)
    return (
      <div className={s.page}>
        <section className={s.success}>
          <span className={s.successIcon}>
            <CheckCircle2 size={44} strokeWidth={1.4} />
          </span>
          <span className={s.eyebrow}>A LITTLE MORE EVERYDAY</span>
          <h2>Demo order placed</h2>
          <p role="status">
            Your order has been created in this browser. No payment was taken
            and no order was sent to a seller.
          </p>
          <strong className={s.orderId}>{receipt.id}</strong>
          <dl>
            <div>
              <dt>Items</dt>
              <dd>
                {receipt.items.reduce((sum, item) => sum + item.quantity, 0)}
              </dd>
            </div>
            <div>
              <dt>Payment method</dt>
              <dd>
                {
                  paymentMethods.find((method) => method.id === receipt.payment)
                    .name
                }
              </dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{money(receipt.total)}</dd>
            </div>
          </dl>
          {!receipt.saved && (
            <p className={s.warning}>
              Your demo order is available for this visit, but browser storage
              could not save it.
            </p>
          )}
          <div className={s.successActions}>
            <Link className={s.primary} to="/account/purchases">
              View My Purchases
              <ArrowRight size={15} />
            </Link>
            <Link className={s.secondary} to="/">
              Continue shopping
              <ArrowRight size={15} />
            </Link>
            <Link className={s.secondary} to="/cart">
              View remaining cart
            </Link>
          </div>
        </section>
        {receiptPopup && (
          <CheckoutDialog
            title="Order placed successfully"
            onClose={() => setReceiptPopup(false)}
          >
            <div className={`${s.dialogBody} ${s.successDialog}`}>
              <CheckCircle2 size={44} strokeWidth={1.4} />
              <p>Your demo order is ready to view in My Purchases.</p>
              <strong className={s.orderId}>{receipt.id}</strong>
              <p className={s.muted}>
                Order total: {money(receipt.total)}. No real payment or
                shipment.
              </p>
            </div>
            <footer className={s.dialogFooter}>
              <Link className={s.secondary} to="/">
                Continue Shopping
              </Link>
              <Link className={s.primary} to="/account/purchases">
                View My Purchases
                <ArrowRight size={15} />
              </Link>
            </footer>
          </CheckoutDialog>
        )}
      </div>
    );
  if (!selected.length)
    return (
      <div className={s.page}>
        <section className={s.empty}>
          <ShoppingBag size={43} strokeWidth={1.3} />
          <h2>No items selected for checkout</h2>
          <p>
            Choose the products you’d like to order from your shopping cart.
          </p>
          <Link className={s.primary} to="/cart">
            Review your cart
            <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    );
  return (
    <div className={s.page}>
      <section
        className={s.addressBlock}
        aria-labelledby="delivery-address-heading"
      >
        <h2 id="delivery-address-heading">
          <MapPin size={18} />
          Delivery Address
        </h2>
        <div>
          <strong>
            {address.name}
            <span>{address.phone}</span>
          </strong>
          <p>{formatAddress(address)}</p>
          {address.isDefault && <span className={s.defaultBadge}>Default</span>}
          <button onClick={() => setEditor({ type: "address" })}>
            Change address
          </button>
        </div>
      </section>
      {storageError && (
        <p className={s.warning} role="status">
          Browser storage is unavailable. Your cart and demo order may only be
          available for this visit.
        </p>
      )}
      <div className={s.productHeader}>
        <h2>Products Ordered</h2>
        <span>Unit Price</span>
        <span>Quantity</span>
        <span>Item Subtotal</span>
      </div>
      {groups.map((group) => {
        const method = methodFor(group.shop.id);
        const groupSubtotal =
          group.lines.reduce(
            (sum, line) =>
              sum + Math.round(line.product.price * 100) * line.quantity,
            0,
          ) / 100;
        const quantity = group.lines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );
        return (
          <section
            className={s.shopBlock}
            key={group.shop.id}
            aria-label={`${group.shop.name} checkout`}
          >
            <div className={s.shopHeading}>
              <span className={s.mallBadge}>Mall</span>
              <Link to={`/shop/${group.shop.id}`}>{group.shop.name}</Link>
              <button
                onClick={() => setEditor({ type: "chat", shop: group.shop })}
              >
                <MessageCircle size={13} />
                Chat Now
              </button>
            </div>
            {group.lines.map((line) => (
              <article
                key={line.id}
                className={s.orderRow}
                aria-label={line.product.title}
              >
                <div className={s.product}>
                  <Link to={`/product/${line.productId}`}>
                    <img src={line.product.image} alt={line.product.title} />
                  </Link>
                  <Link to={`/product/${line.productId}`}>
                    {line.product.title}
                  </Link>
                  <span>
                    Variation: {line.variant}
                    {line.size ? ` · ${line.size}` : ""}
                  </span>
                </div>
                <div className={s.unitPrice}>
                  <span>{money(line.product.price)}</span>
                  <del>{money(line.product.original)}</del>
                </div>
                <span className={s.quantity}>{line.quantity}</span>
                <strong>{money(line.product.price * line.quantity)}</strong>
              </article>
            ))}
            <div className={s.shopVoucher}>
              <span>
                <Ticket size={15} />
                Shopiz offers
              </span>
              <button onClick={() => setVoucherOpen(true)}>
                Select voucher
                <ChevronRight size={12} />
              </button>
            </div>
            <div className={s.fulfillment}>
              <label className={s.sellerNote}>
                Message:
                <input
                  aria-label={`Message to ${group.shop.name}`}
                  placeholder="Leave a note for the seller"
                  maxLength={200}
                  value={notes[group.shop.id] || ""}
                  onChange={(e) =>
                    setNotes({ ...notes, [group.shop.id]: e.target.value })
                  }
                />
              </label>
              <div className={s.delivery}>
                <div>
                  <span>
                    <Truck size={15} />
                    Shipping option:
                  </span>
                  <strong>{method.name}</strong>
                  <button
                    aria-label={`Change shipping for ${group.shop.name}`}
                    onClick={() => {
                      setDraftShipping(method.id);
                      setEditor({ type: "shipping", shop: group.shop });
                    }}
                  >
                    Change
                  </button>
                  <span>{money(method.fee)}</span>
                </div>
                <p>Estimated delivery: {method.estimate}</p>
                <small>
                  <PackageCheck size={12} />
                  Inspect your parcel on delivery · Demo shipping benefit
                </small>
              </div>
            </div>
            <div className={s.shopTotal}>
              <span>
                Shop total ({quantity} {quantity === 1 ? "item" : "items"},
                including delivery):
              </span>
              <strong>{money(groupSubtotal + method.fee)}</strong>
            </div>
          </section>
        );
      })}
      <section className={s.voucherBlock}>
        <div>
          <h2>
            <Ticket size={17} />
            Shopiz Voucher
          </h2>
          <div className={s.voucherActions}>
            <button onClick={() => setVoucherOpen(true)}>
              {appliedVoucher ? appliedVoucher.code : "Select voucher"}
              <ChevronRight size={12} />
            </button>
            {appliedVoucher && (
              <button
                aria-label="Remove checkout voucher"
                onClick={() => applyVoucher("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        {appliedVoucher && (
          <p className={s.voucherNote}>
            {discountStatus.eligible
              ? discountStatus.reason || `Voucher savings: ${money(discount)}`
              : discountStatus.reason}
          </p>
        )}
        <div className={s.coins}>
          <span>
            <Coins size={17} />
            Shopiz Coins<small>Coins are not available yet</small>
          </span>
          <label>
            −{money(0)}
            <input type="checkbox" disabled aria-label="Use Shopiz Coins" />
          </label>
        </div>
      </section>
      <section className={s.paymentBlock}>
        <div className={s.paymentHeading}>
          <h2>Payment Method</h2>
          <span>
            {paymentMethods.find((method) => method.id === payment).name}
          </span>
          <button
            onClick={() => {
              setDraftPayment(payment);
              setEditor({ type: "payment" });
            }}
          >
            Change payment
          </button>
        </div>
        <dl className={s.totals}>
          <div>
            <dt>Merchandise Subtotal</dt>
            <dd data-testid="checkout-subtotal">{money(subtotal)}</dd>
          </div>
          <div>
            <dt>Shipping Total</dt>
            <dd data-testid="checkout-shipping">{money(shippingFee)}</dd>
          </div>
          <div>
            <dt>Voucher Discount</dt>
            <dd data-testid="checkout-discount">−{money(discount)}</dd>
          </div>
          <div className={s.grandTotal}>
            <dt>Total Payment</dt>
            <dd data-testid="checkout-total" aria-live="polite">
              {money(total)}
            </dd>
          </div>
        </dl>
        <div className={s.placeOrder}>
          <div>
            <p>
              By placing a demo order, you agree to Shopiz’s{" "}
              <Link to="/info/terms-of-service">Terms of Service</Link>.
            </p>
            <small>
              <ShieldCheck size={13} />
              Simulation only. No real payment, shipment or seller notification.
            </small>
            {error && (
              <p className={s.fieldError} role="alert">
                {error}
              </p>
            )}
          </div>
          <button className={s.primary} onClick={placeOrder}>
            Place demo order
          </button>
        </div>
      </section>
      {voucherOpen && (
        <VoucherDialog
          shippingFee={shippingFee}
          onClose={() => setVoucherOpen(false)}
        />
      )}
      {editor?.type === "address" && (
        <AddressDialog
          addresses={addresses}
          selectedId={addressId}
          onSave={saveAddress}
          onClose={() => setEditor(null)}
        />
      )}
      {editor?.type === "shipping" && (
        <CheckoutDialog
          title="Shipping options"
          onClose={() => setEditor(null)}
        >
          <div className={s.dialogBody}>
            <p className={s.muted}>{editor.shop.name}</p>
            {shippingMethods.map((method) => (
              <label
                key={method.id}
                className={`${s.methodChoice} ${draftShipping === method.id ? s.selectedChoice : ""}`}
              >
                <input
                  type="radio"
                  name="shipping-method"
                  aria-label={method.name}
                  checked={draftShipping === method.id}
                  onChange={() => setDraftShipping(method.id)}
                />
                <span>
                  <strong>{method.name}</strong>
                  <small>{method.estimate}</small>
                </span>
                <strong>{money(method.fee)}</strong>
              </label>
            ))}
          </div>
          <footer className={s.dialogFooter}>
            <button className={s.secondary} onClick={() => setEditor(null)}>
              Cancel
            </button>
            <button
              className={s.primary}
              onClick={() => {
                setShipping({ ...shipping, [editor.shop.id]: draftShipping });
                setEditor(null);
              }}
            >
              Confirm shipping
            </button>
          </footer>
        </CheckoutDialog>
      )}
      {editor?.type === "payment" && (
        <CheckoutDialog
          title="Select payment method"
          onClose={() => setEditor(null)}
        >
          <div className={s.dialogBody}>
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`${s.methodChoice} ${draftPayment === method.id ? s.selectedChoice : ""}`}
              >
                <input
                  type="radio"
                  name="payment-method"
                  aria-label={method.name}
                  checked={draftPayment === method.id}
                  onChange={() => setDraftPayment(method.id)}
                />
                <span>
                  <strong>{method.name}</strong>
                  <small>{method.description}</small>
                </span>
              </label>
            ))}
            <label className={`${s.methodChoice} ${s.unavailable}`}>
              <input type="radio" disabled />
              <span>
                <strong>Credit / Debit Card</strong>
                <small>Not connected. Do not enter real card details.</small>
              </span>
            </label>
          </div>
          <footer className={s.dialogFooter}>
            <button className={s.secondary} onClick={() => setEditor(null)}>
              Cancel
            </button>
            <button
              className={s.primary}
              onClick={() => {
                setPayment(draftPayment);
                setEditor(null);
              }}
            >
              Confirm payment
            </button>
          </footer>
        </CheckoutDialog>
      )}
      {editor?.type === "chat" && (
        <CheckoutDialog
          title={`Chat with ${editor.shop.name}`}
          onClose={() => setEditor(null)}
        >
          <div className={s.dialogBody}>
            <p className={s.muted}>
              Seller messaging is not connected in this simulator. Your checkout
              notes remain on this page for the demo.
            </p>
          </div>
          <footer className={s.dialogFooter}>
            <button className={s.primary} onClick={() => setEditor(null)}>
              Close
            </button>
          </footer>
        </CheckoutDialog>
      )}
    </div>
  );
}
