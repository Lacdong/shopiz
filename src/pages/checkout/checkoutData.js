export {
  sampleAddresses,
  validateAddress,
  formatAddress,
} from "../../data/addresses";
export const shippingMethods = [
  {
    id: "standard",
    name: "Standard delivery",
    fee: 0,
    estimate: "3–5 business days",
  },
  {
    id: "express",
    name: "Express delivery",
    fee: 2.9,
    estimate: "1–2 business days",
  },
];
export const paymentMethods = [
  {
    id: "cod",
    name: "Cash on delivery",
    description:
      "Pay on delivery in the simulated flow. No payment is collected.",
  },
  {
    id: "wallet",
    name: "Demo wallet",
    description:
      "A simulated wallet selection. No real balance or funds are used.",
  },
];
export { saveMockOrder } from "../../data/orders";
