import { products } from "../../data/catalog";
import { getProductDetails } from "../../data/productDetails";

export const cartStorageKey = "shopiz-cart-v1";
export const lineId = (item) =>
  JSON.stringify([item.productId, item.variant, item.size]);
export function normalizeCart(input) {
  if (!Array.isArray(input)) return [];
  const result = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const product = products.find((p) => String(p.id) === String(item.productId));
    const details = product ? getProductDetails(product) : { variants: ["Standard"], sizes: [] };
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isFinite(quantity) || quantity < 1) continue;
    const maxStock = product ? (product.stock || 50) : 50;
    const remaining =
      maxStock -
      result
        .filter((line) => String(line.productId) === String(item.productId))
        .reduce((sum, line) => sum + line.quantity, 0);
    if (remaining <= 0) continue;
    const existing = result.find((line) => lineId(line) === lineId(item));
    if (existing) existing.quantity += Math.min(quantity, remaining);
    else
      result.push({
        productId: String(item.productId),
        variant: item.variant || (details.variants?.[0] || "Standard"),
        size: item.size || "",
        quantity: Math.min(quantity, remaining),
        selected: item.selected !== false,
      });
  }
  return result;
}
export function addCartItem(items, item) {
  const clean = normalizeCart([{ ...item, selected: true }])[0];
  if (!clean)
    return {
      items,
      added: 0,
      error: "Please choose a valid product option and quantity.",
    };
  const product = products.find((p) => String(p.id) === String(clean.productId));
  const stock = product?.stock || 50;
  const inCart = items
    .filter((line) => String(line.productId) === String(clean.productId))
    .reduce((sum, line) => sum + line.quantity, 0);
  const added = Math.min(clean.quantity, Math.max(0, stock - inCart));
  if (!added)
    return {
      items,
      added: 0,
      error: "All available stock for this product is already in your cart.",
    };
  const existing = items.find((line) => lineId(line) === lineId(clean));
  const next = existing
    ? items.map((line) =>
        lineId(line) === lineId(clean)
          ? { ...line, quantity: line.quantity + added, selected: true }
          : line,
      )
    : [...items, { ...clean, quantity: added }];
  return {
    items: next,
    added,
    limited: added < Math.floor(Number(item.quantity)),
  };
}
export function updateCartQuantity(items, id, quantity) {
  const item = items.find((line) => lineId(line) === id);
  if (!item) return items;
  const value = Math.floor(Number(quantity));
  if (!Number.isFinite(value)) return items;
  const product = products.find((p) => p.id === item.productId);
  const others = items
    .filter((line) => line.productId === item.productId && lineId(line) !== id)
    .reduce((sum, line) => sum + line.quantity, 0);
  const max = Math.max(1, product.stock - others);
  return items.map((line) =>
    lineId(line) === id
      ? { ...line, quantity: Math.min(max, Math.max(1, value)) }
      : line,
  );
}
