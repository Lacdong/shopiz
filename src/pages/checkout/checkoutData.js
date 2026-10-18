export const sampleAddresses = [
  {
    id: "home",
    name: "Demo Shopper",
    phone: "0901234567",
    street: "12 Example Street",
    ward: "Ben Nghe",
    district: "District 1",
    city: "Ho Chi Minh City",
    label: "Home",
    isDefault: true,
  },
  {
    id: "work",
    name: "Demo Shopper",
    phone: "0901234567",
    street: "24 Sample Avenue",
    ward: "Dich Vong",
    district: "Cau Giay",
    city: "Hanoi",
    label: "Office",
    isDefault: false,
  },
];
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
export function validateAddress(address) {
  const errors = {};
  if (address.name.trim().length < 2)
    errors.name = "Enter the recipient’s full name.";
  if (!/^\+?\d{9,15}$/.test(address.phone.replace(/[\s().-]/g, "")))
    errors.phone = "Enter a valid phone number (9–15 digits).";
  if (address.street.trim().length < 5)
    errors.street = "Enter a complete street address.";
  for (const key of ["ward", "district", "city"])
    if (!address[key].trim()) errors[key] = `Enter your ${key}.`;
  return errors;
}
export const formatAddress = (address) =>
  [address.street, address.ward, address.district, address.city]
    .filter(Boolean)
    .join(", ");
export function saveMockOrder(order) {
  try {
    const stored = JSON.parse(
      localStorage.getItem("shopiz-demo-orders-v1") || "[]",
    );
    const orders = Array.isArray(stored)
      ? stored.filter(
          (item) =>
            item && typeof item === "object" && typeof item.id === "string",
        )
      : [];
    localStorage.setItem(
      "shopiz-demo-orders-v1",
      JSON.stringify(
        [order, ...orders.filter((item) => item.id !== order.id)].slice(0, 20),
      ),
    );
    return true;
  } catch {
    return false;
  }
}
