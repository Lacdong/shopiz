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
  const lines = items.map((item) => {
    const product =
      products.find((p) => String(p.id) === String(item.productId)) || {
        id: String(item.productId),
        title: item.title || `Product #${item.productId}`,
        image:
          item.image ||
          "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=500&q=85",
        price: Number(item.price || 50),
        original: Number(item.original || item.price || 50),
        stock: 50,
        discount: 0,
        category: "General",
        mall: true,
      };
    return {
      ...item,
      id: lineId(item),
      product,
    };
  });
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
  function applyVoucher(code, { shippingFee = 0 } = {}) {
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
    const status = voucherStatus(voucher, {
      subtotal,
      selectedCount,
      shippingFee,
    });
    if (!status.eligible) return { success: false, error: status.reason };
    setVoucherCode(voucher.code);
    try {
      localStorage.setItem(voucherKey, voucher.code);
    } catch {
      setStorageError(true);
    }
    return { success: true };
  }
  function completeCheckout(expected) {
    if (!expected.length) return false;
    const valid = expected.every((line) =>
      current.current.some(
        (item) =>
          lineId(item) === line.id &&
          item.selected &&
          item.quantity === line.quantity,
      ),
    );
    if (!valid) return false;
    const ids = new Set(expected.map((line) => line.id));
    commit(current.current.filter((item) => !ids.has(lineId(item))));
    return true;
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
        completeCheckout,
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
