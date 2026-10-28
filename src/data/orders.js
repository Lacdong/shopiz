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
export function updateOrderAction(id, action, value) {
  if (
    action === "review" &&
    (!value ||
      !Number.isInteger(value.rating) ||
      value.rating < 1 ||
      value.rating > 5 ||
      typeof value.comment !== "string" ||
      value.comment.length > 1000)
  )
    return { success: false, error: "Choose a valid rating and review." };
  if (
    action === "cancel" &&
    ![
      "Changed my mind",
      "Ordered the wrong item",
      "Need to change delivery address",
      "Delivery is taking too long",
      "Other",
    ].includes(value)
  )
    return { success: false, error: "Select a cancellation reason." };
  const order = readOrders().find((order) => order.id === id);
  if (!order)
    return {
      success: false,
      error: "This order could not be found. Refresh your purchase history.",
    };
  const status = orderStatus(order);
  if (action === "cancel" && ["completed", "cancelled"].includes(status))
    return { success: false, error: "This order can no longer be cancelled." };
  if (action === "review" && status !== "completed")
    return { success: false, error: "Only completed orders can be reviewed." };
  if (!["cancel", "review"].includes(action))
    return { success: false, error: "Invalid order action." };
  const next =
    action === "cancel"
      ? {
          ...order,
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
          cancellationReason: value,
        }
      : { ...order, review: { ...value, createdAt: new Date().toISOString() } };
  const saved = saveMockOrder(next);
  return { success: true, saved, order: next };
}
// Hard-coded sample orders removed — all orders are fetched from Shopee Simulator backend
export const sampleOrders = [];
