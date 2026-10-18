import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  Minus,
  Plus,
  Ticket,
  Coins,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { useCart } from "../../components/cart/CartProvider";
import { getProductDetails } from "../../data/productDetails";
import { money } from "../../data/catalog";
import { ProductGrid } from "../../components/Commerce";
import s from "./CartPage.module.css";
import VoucherDialog from "./VoucherDialog";

function SelectAll({
  all,
  some,
  onChange,
  label,
  ariaLabel = label,
  hideLabel = false,
}) {
  return (
    <label className={s.checkbox}>
      <input
        type="checkbox"
        aria-label={ariaLabel}
        checked={all}
        ref={(node) => {
          if (node) node.indeterminate = some && !all;
        }}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={hideLabel ? s.srOnly : undefined}>{label}</span>
    </label>
  );
}
function CartRow({ line, max }) {
  const { setQuantity, removeItem, toggleItem } = useCart();
  const [value, setValue] = useState(String(line.quantity));
  useEffect(() => setValue(String(line.quantity)), [line.quantity]);
  const name = `${line.product.title} · ${line.variant}${line.size ? ` · ${line.size}` : ""}`;
  function commit() {
    const number = Math.floor(Number(value));
    const next = Number.isFinite(number)
      ? Math.min(max, Math.max(1, number))
      : line.quantity;
    setValue(String(next));
    setQuantity(line.id, next);
  }
  return (
    <article className={s.row} aria-label={name}>
      <input
        className={s.rowSelect}
        type="checkbox"
        aria-label={`Select ${name}`}
        checked={line.selected}
        onChange={() => toggleItem(line.id)}
      />
      <div className={s.product}>
        <Link to={`/product/${line.productId}`}>
          <img src={line.product.image} alt={line.product.title} />
        </Link>
        <div>
          <Link className={s.productTitle} to={`/product/${line.productId}`}>
            {line.product.mall && <span className={s.mallBadge}>Mall</span>}
            {line.product.title}
          </Link>
          <small>
            <Truck size={11} /> Free standard delivery
          </small>
        </div>
      </div>
      <div className={s.variation}>
        <span>Variation:</span>
        <p>
          {line.variant}
          {line.size ? ` · ${line.size}` : ""}
        </p>
      </div>
      <div className={s.unitPrice}>
        <del>{money(line.product.original)}</del>
        <span>{money(line.product.price)}</span>
      </div>
      <div className={s.quantityCell}>
        <div className={s.quantity}>
          <button
            aria-label={`Decrease quantity for ${name}`}
            disabled={line.quantity <= 1}
            onClick={() => setQuantity(line.id, line.quantity - 1)}
          >
            <Minus size={12} />
          </button>
          <input
            aria-label={`Quantity for ${name}`}
            type="number"
            min="1"
            max={max}
            step="1"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
              }
            }}
          />
          <button
            aria-label={`Increase quantity for ${name}`}
            disabled={line.quantity >= max}
            onClick={() => setQuantity(line.id, line.quantity + 1)}
          >
            <Plus size={12} />
          </button>
        </div>
        <small>Up to {max} available</small>
      </div>
      <strong className={s.lineTotal}>
        {money(line.product.price * line.quantity)}
      </strong>
      <div className={s.actions}>
        <button
          className={s.remove}
          aria-label={`Remove ${name}`}
          onClick={() => removeItem(line.id)}
        >
          Delete
        </button>
        <Link to={`/category/${encodeURIComponent(line.product.category)}`}>
          Find similar
          <ChevronRight size={11} />
        </Link>
      </div>
    </article>
  );
}
export default function CartPage() {
  const {
    lines,
    selectedCount,
    subtotal,
    savings,
    appliedVoucher,
    voucherEligibility,
    voucherDiscount,
    total,
    applyVoucher,
    storageError,
    selectAll,
    removeSelected,
    selectItems,
  } = useCart();
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);
  const preview = useRef(null);
  const selected = lines.filter((line) => line.selected);
  const all = lines.length > 0 && selected.length === lines.length;
  const some = selected.length > 0;
  const groups = lines.reduce((list, line) => {
    const seller = getProductDetails(line.product).seller.name;
    const group = list.find((group) => group.seller === seller);
    if (group) group.lines.push(line);
    else list.push({ seller, lines: [line] });
    return list;
  }, []);
  return (
    <div className={s.page}>
      <div className={s.cartContent}>
        {storageError && (
          <p className={s.storageNotice} role="status">
            Your cart is available for this visit. Browser storage is
            unavailable, so it may not be saved after you leave.
          </p>
        )}
        {!lines.length ? (
          <section className={s.empty}>
            <span>
              <ShoppingCart size={42} strokeWidth={1.2} />
            </span>
            <h2>Your next favorite is waiting.</h2>
            <p>
              Your shopping cart is empty. Find a little more of what you love.
            </p>
            <Link to="/">
              Explore the marketplace
              <ArrowRight size={15} />
            </Link>
          </section>
        ) : (
          <>
            <div className={s.tableHeader}>
              <SelectAll
                all={all}
                some={some}
                onChange={selectAll}
                label="Product"
                ariaLabel="Select all products"
              />
              <span>Unit Price</span>
              <span>Quantity</span>
              <span>Item Subtotal</span>
              <span>Action</span>
            </div>
            {groups.map((group) => (
              <section
                className={s.sellerGroup}
                key={group.seller}
                aria-label={group.seller}
              >
                <div className={s.sellerHeading}>
                  <SelectAll
                    all={group.lines.every((line) => line.selected)}
                    some={group.lines.some((line) => line.selected)}
                    onChange={(value) =>
                      selectItems(
                        group.lines.map((line) => line.id),
                        value,
                      )
                    }
                    label={`Select ${group.seller} products`}
                    hideLabel
                  />
                  {group.lines.some((line) => line.product.mall) ? (
                    <span className={s.sellerMall}>Mall</span>
                  ) : (
                    <Store size={17} />
                  )}
                  <h2>{group.seller}</h2>
                  <Link
                    to={`/shop/${getProductDetails(group.lines[0].product).seller.id}`}
                  >
                    Visit Shop
                    <ChevronRight size={12} />
                  </Link>
                </div>
                <div className={s.groupProducts}>
                  <div className={s.offerStrip}>
                    <span>SHOP OFFERS</span>
                    <p>Discover more everyday favorites from this shop.</p>
                    <Link
                      to={`/shop/${getProductDetails(group.lines[0].product).seller.id}`}
                    >
                      Shop more
                      <ChevronRight size={12} />
                    </Link>
                  </div>
                  {group.lines.map((line) => {
                    const otherQuantity = lines
                      .filter(
                        (other) =>
                          other.productId === line.productId &&
                          other.id !== line.id,
                      )
                      .reduce((sum, other) => sum + other.quantity, 0);
                    return (
                      <CartRow
                        key={line.id}
                        line={line}
                        max={line.product.stock - otherQuantity}
                      />
                    );
                  })}
                </div>
                <div className={s.shopVouchers}>
                  <Ticket size={17} />
                  <span>See all shop vouchers</span>
                  <button onClick={() => setVoucherOpen(true)}>
                    Explore vouchers
                  </button>
                </div>
                <div className={s.shippingNote}>
                  <Truck size={16} />
                  <span>Free standard delivery on these selected finds.</span>
                  <Link to="/help">
                    Learn more
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </section>
            ))}
            <div className={s.summary}>
              <div className={s.voucherRow}>
                <span>
                  <Ticket size={18} />
                  Shopiz Voucher
                </span>
                <div className={s.voucherSelection}>
                  <button
                    onClick={() => setVoucherOpen(true)}
                    aria-haspopup="dialog"
                  >
                    {appliedVoucher
                      ? appliedVoucher.code
                      : "Select or enter a code"}
                    <ChevronRight size={13} />
                  </button>
                  {appliedVoucher && (
                    <button
                      className={s.removeVoucher}
                      aria-label="Remove voucher"
                      onClick={() => applyVoucher("")}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              {appliedVoucher && (
                <div className={s.voucherSavings}>
                  <span>
                    {voucherEligibility.eligible
                      ? appliedVoucher.type === "shipping"
                        ? "Shipping voucher selected"
                        : "Voucher discount"
                      : voucherEligibility.reason}
                  </span>
                  <strong>−{money(voucherDiscount)}</strong>
                </div>
              )}
              <div className={s.coinsRow}>
                <label>
                  <input type="checkbox" disabled />
                  <Coins size={18} />
                  Shopiz Coins
                </label>
                <span>
                  {some
                    ? "Coins are not available yet"
                    : "Select products to use coins"}
                </span>
                <small>−{money(0)}</small>
              </div>
              <div className={s.summaryTop}>
                <SelectAll
                  all={all}
                  some={some}
                  onChange={selectAll}
                  label={`Select all (${lines.length})`}
                />
                <button
                  className={s.deleteSelected}
                  disabled={!some}
                  onClick={removeSelected}
                >
                  <Trash2 size={14} />
                  Delete selected
                </button>
                <Link className={s.continueShopping} to="/">
                  Continue shopping
                </Link>
                <div className={s.totals}>
                  <div>
                    <span>
                      Total ({selectedCount}{" "}
                      {selectedCount === 1 ? "item" : "items"})
                    </span>
                    <strong data-testid="cart-total">{money(total)}</strong>
                  </div>
                  <small>
                    You save {money(savings + voucherDiscount)} · Standard
                    delivery is free
                  </small>
                </div>
                <button
                  className={s.checkout}
                  disabled={!some}
                  onClick={() => {
                    setCheckoutNotice(true);
                    preview.current.showModal();
                  }}
                >
                  Checkout ({selectedCount})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <ProductGrid
        title="A LITTLE MORE TO LOVE"
        subtitle="Everyday favorites for your cart"
      />
      {voucherOpen && <VoucherDialog onClose={() => setVoucherOpen(false)} />}
      <dialog
        ref={preview}
        className={s.checkoutDialog}
        aria-labelledby="checkout-heading"
        onClick={(e) => {
          if (e.target === e.currentTarget) preview.current.close();
        }}
      >
        <button
          className={s.close}
          aria-label="Close checkout preview"
          onClick={() => preview.current.close()}
        >
          <X size={20} />
        </button>
        <h2 id="checkout-heading">Checkout preview</h2>
        {checkoutNotice && (
          <p className={s.demoNotice}>
            Your cart is ready. Checkout and payments are not available in this
            simulator. Your items will stay in your cart.
          </p>
        )}
        <div className={s.previewItems}>
          {selected.map((line) => (
            <div key={line.id}>
              <span>
                {line.product.title}
                <small>
                  {line.variant}
                  {line.size ? ` · ${line.size}` : ""} · Qty: {line.quantity}
                </small>
              </span>
              <strong>{money(line.product.price * line.quantity)}</strong>
            </div>
          ))}
        </div>
        {voucherDiscount > 0 && (
          <div className={s.previewDiscount}>
            <span>Subtotal: {money(subtotal)}</span>
            <span>
              {appliedVoucher.code}: −{money(voucherDiscount)}
            </span>
          </div>
        )}
        <div className={s.previewTotal}>
          <span>Total · {selectedCount} items</span>
          <strong>{money(total)}</strong>
        </div>
        <button className={s.checkout} onClick={() => preview.current.close()}>
          Back to cart
        </button>
      </dialog>
    </div>
  );
}
