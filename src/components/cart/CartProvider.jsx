import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { products } from "../../data/catalog";
import { findVoucher, voucherStatus } from "../../data/vouchers";
import {
  addCartItem,
  cartStorageKey,
  lineId,
  normalizeCart,
  updateCartQuantity,
} from "./cartUtils";

const CartContext = createContext(null);
const voucherKey = "shopiz-cart-voucher-v1";
function readVoucher() {
  try {
    return findVoucher(localStorage.getItem(voucherKey))?.code || null;
  } catch {
    return null;
  }
}
function readCart() {
  try {
    return normalizeCart(
      JSON.parse(localStorage.getItem(cartStorageKey) || "[]"),
    );
  } catch {
    return [];
  }
}
export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const current = useRef(items);
  const [storageError, setStorageError] = useState(false);
  const [voucherCode, setVoucherCode] = useState(readVoucher);
  function commit(next) {
    current.current = next;
    setItems(next);
    try {
      localStorage.setItem(cartStorageKey, JSON.stringify(next));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  useEffect(() => {
    function sync(event) {
      if (event.key === cartStorageKey || event.key === null) {
        const next = readCart();
        current.current = next;
        setItems(next);
      }
      if (event.key === voucherKey || event.key === null)
        setVoucherCode(readVoucher());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function addItem(item) {
    const result = addCartItem(current.current, item);
    if (result.added) commit(result.items);
    return result;
  }
  function setQuantity(id, value) {
    commit(updateCartQuantity(current.current, id, value));
  }
  function removeItem(id) {
    commit(current.current.filter((item) => lineId(item) !== id));
  }
  function toggleItem(id) {
    commit(
      current.current.map((item) =>
        lineId(item) === id ? { ...item, selected: !item.selected } : item,
      ),
    );
  }
  function selectAll(selected) {
    commit(current.current.map((item) => ({ ...item, selected })));
  }
  function selectItems(ids, selected) {
    commit(
      current.current.map((item) =>
        ids.includes(lineId(item)) ? { ...item, selected } : item,
      ),
    );
  }
  function removeSelected() {
    commit(current.current.filter((item) => !item.selected));
  }
  const lines = items.map((item) => ({
    ...item,
    id: lineId(item),
    product: products.find((p) => p.id === item.productId),
  }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const selected = lines.filter((item) => item.selected);
  const selectedCount = selected.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal =
    selected.reduce(
      (sum, item) => sum + Math.round(item.product.price * 100) * item.quantity,
      0,
    ) / 100;
  const savings =
    selected.reduce(
      (sum, item) =>
        sum +
        (Math.round(item.product.original * 100) -
          Math.round(item.product.price * 100)) *
          item.quantity,
      0,
    ) / 100;
  const appliedVoucher = findVoucher(voucherCode);
  const voucherEligibility = voucherStatus(appliedVoucher, {
    subtotal,
    selectedCount,
  });
  const voucherDiscount = voucherEligibility.discount;
  const total = Math.max(
    0,
    Math.round((subtotal - voucherDiscount) * 100) / 100,
  );
  function applyVoucher(code) {
    if (!code) {
      setVoucherCode(null);
      try {
        localStorage.removeItem(voucherKey);
      } catch {
        setStorageError(true);
      }
      return { success: true };
    }
    const voucher = findVoucher(code);
    const status = voucherStatus(voucher, { subtotal, selectedCount });
    if (!status.eligible) return { success: false, error: status.reason };
    setVoucherCode(voucher.code);
    try {
      localStorage.setItem(voucherKey, voucher.code);
    } catch {
      setStorageError(true);
    }
    return { success: true };
  }
  return (
    <CartContext.Provider
      value={{
        lines,
        itemCount,
        selectedCount,
        subtotal,
        savings,
        appliedVoucher,
        voucherEligibility,
        voucherDiscount,
        total,
        applyVoucher,
        storageError,
        addItem,
        setQuantity,
        removeItem,
        toggleItem,
        selectAll,
        selectItems,
        removeSelected,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
export function useCart() {
  return useContext(CartContext);
}
