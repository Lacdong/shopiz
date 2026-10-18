// Illustrative USD voucher offers for the frontend simulator.
export const mockVouchers = [
  {
    code: "FREESHIP",
    type: "shipping",
    title: "Free standard delivery",
    minimum: 20,
    maxDiscount: 3,
    expiresAt: "2026-12-31",
    description: "Save up to $3 on standard shipping.",
  },
  {
    code: "SHIPPLUS",
    type: "shipping",
    title: "Shipping savings up to $5",
    minimum: 50,
    maxDiscount: 5,
    expiresAt: "2026-12-31",
    description: "A little more delivery value on bigger finds.",
  },
  {
    code: "SHOPIZ10",
    type: "percent",
    title: "10% off your selected items",
    minimum: 25,
    percent: 10,
    maxDiscount: 15,
    expiresAt: "2026-12-31",
    description: "Save up to $15 on your everyday favorites.",
  },
  {
    code: "SHOPIZ5",
    type: "fixed",
    title: "$5 off your selected items",
    minimum: 50,
    amount: 5,
    expiresAt: "2026-12-31",
    description: "A little extra off your next selection.",
  },
  {
    code: "WELCOME15",
    type: "percent",
    title: "15% off a bigger selection",
    minimum: 100,
    percent: 15,
    maxDiscount: 25,
    expiresAt: "2026-12-31",
    description: "Save up to $25 when you spend $100.",
  },
];
export const findVoucher = (code) =>
  mockVouchers.find(
    (v) =>
      v.code ===
      String(code || "")
        .trim()
        .toUpperCase(),
  ) || null;
export function voucherStatus(
  voucher,
  { subtotal, selectedCount, shippingFee = 0, now = Date.now() },
) {
  if (!voucher)
    return {
      eligible: false,
      reason: "Voucher code not found. Please try another code.",
      discount: 0,
    };
  if (now > new Date(`${voucher.expiresAt}T23:59:59+07:00`).getTime())
    return {
      eligible: false,
      reason: "This voucher has expired.",
      discount: 0,
    };
  if (!selectedCount)
    return {
      eligible: false,
      reason: "Select products in your cart to use this voucher.",
      discount: 0,
    };
  if (Math.round(subtotal * 100) < Math.round(voucher.minimum * 100))
    return {
      eligible: false,
      reason: `Add $${((Math.round(voucher.minimum * 100) - Math.round(subtotal * 100)) / 100).toFixed(2)} more in selected items to use this voucher.`,
      discount: 0,
    };
  const cents = Math.round(subtotal * 100);
  const raw =
    voucher.type === "percent"
      ? Math.round((cents * voucher.percent) / 100)
      : voucher.type === "fixed"
        ? Math.round(voucher.amount * 100)
        : Math.round(shippingFee * 100);
  const cap =
    voucher.maxDiscount === undefined
      ? cents
      : Math.round(voucher.maxDiscount * 100);
  return {
    eligible: true,
    reason:
      voucher.type === "shipping" && shippingFee === 0
        ? "Standard delivery is already free for this cart."
        : "",
    discount: Math.min(cents, raw, cap) / 100,
  };
}
