import { products } from "./catalog";

export const orderStorageKey = "shopiz-demo-orders-v1";
let visitOrders = [];
export const orderTabs = [
  ["all", "All"],
  ["to-pay", "To Pay"],
  ["to-ship", "To Ship"],
  ["to-receive", "To Receive"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
  ["returns", "Returns / Refunds"],
];
export const orderStatus = (order) =>
  order.status === "demo-placed" ? "to-ship" : order.status;
export const statusLabel = (order) =>
  orderTabs.find(([id]) => id === orderStatus(order))?.[1] || "Processing";
function validOrder(order) {
  return (
    order &&
    typeof order.id === "string" &&
    typeof order.createdAt === "string" &&
    Number.isFinite(Date.parse(order.createdAt)) &&
    Array.isArray(order.items) &&
    order.items.length > 0 &&
    order.items.every(
      (item) =>
        item &&
        typeof item.title === "string" &&
        typeof item.variant === "string" &&
        typeof item.size === "string" &&
        products.some((product) => product.id === item.productId) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.price) &&
        item.price >= 0,
    ) &&
    ["subtotal", "shippingFee", "discount", "total"].every(
      (key) => Number.isFinite(order[key]) && order[key] >= 0,
    )
  );
}
export function readOrders() {
  let stored = [];
  try {
    const value = JSON.parse(localStorage.getItem(orderStorageKey) || "[]");
    if (Array.isArray(value)) stored = value.filter(validOrder);
  } catch {
    /* Keep visit-only orders available. */
  }
  return [...visitOrders, ...stored]
    .filter(
      (order, index, list) =>
        list.findIndex((item) => item.id === order.id) === index,
    )
    .slice(0, 20);
}
export function saveMockOrder(order) {
  if (!validOrder(order)) return false;
  const orders = [
    order,
    ...readOrders().filter((item) => item.id !== order.id),
  ].slice(0, 20);
  try {
    localStorage.setItem(orderStorageKey, JSON.stringify(orders));
    visitOrders = [];
    return true;
  } catch {
    visitOrders = orders;
    return false;
  }
}
function sample(id, productId, status, quantity = 1) {
  const product = products.find((product) => product.id === productId);
  const subtotal = Math.round(product.price * quantity * 100) / 100;
  return {
    id,
    createdAt: "2026-10-12T09:00:00+07:00",
    status,
    isSample: true,
    items: [
      {
        productId,
        title: product.title,
        variant: productId === "4" ? "Classic" : "Original",
        size: productId === "4" ? "EU 42" : "",
        quantity,
        price: product.price,
      },
    ],
    subtotal,
    shippingFee: 0,
    discount: 0,
    total: subtotal,
    payment: "cod",
    shipping: [],
  };
}
export const sampleOrders = [
  sample("SAMPLE-1004", "4", "completed"),
  sample("SAMPLE-1003", "3", "cancelled"),
  sample("SAMPLE-1002", "6", "completed", 2),
];
