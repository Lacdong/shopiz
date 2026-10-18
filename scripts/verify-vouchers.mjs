import assert from "node:assert/strict";
import { chromium } from "playwright";
import { findVoucher, voucherStatus } from "../src/data/vouchers.js";
const at = Date.parse("2026-10-18T12:00:00+07:00");
assert.equal(
  voucherStatus(findVoucher(" shopiz10 "), {
    subtotal: 99.8,
    selectedCount: 2,
    now: at,
  }).discount,
  9.98,
);
assert.equal(
  voucherStatus(findVoucher("SHOPIZ10"), {
    subtotal: 199.6,
    selectedCount: 4,
    now: at,
  }).discount,
  15,
);
assert.equal(
  voucherStatus(findVoucher("SHOPIZ5"), {
    subtotal: 50,
    selectedCount: 1,
    now: at,
  }).discount,
  5,
);
assert.equal(
  voucherStatus(findVoucher("SHOPIZ5"), {
    subtotal: 49.99,
    selectedCount: 1,
    now: at,
  }).eligible,
  false,
);
assert.equal(
  voucherStatus(findVoucher("SHOPIZ10"), {
    subtotal: 100,
    selectedCount: 0,
    now: at,
  }).eligible,
  false,
);
assert.equal(
  voucherStatus(findVoucher("SHOPIZ10"), {
    subtotal: 100,
    selectedCount: 1,
    now: Date.parse("2027-01-01T00:00:00+07:00"),
  }).eligible,
  false,
);
assert.equal(
  voucherStatus(findVoucher("FREESHIP"), {
    subtotal: 100,
    selectedCount: 1,
    shippingFee: 0,
    now: at,
  }).discount,
  0,
);
console.log(
  "PASS voucher rounding, caps, thresholds, selection requirements, expiry and already-free shipping",
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const popup = () =>
  page.getByRole("dialog", { name: "Select Shopiz Voucher", exact: true });
async function open() {
  await page
    .getByRole("button", {
      name: /Select or enter a code|SHOPIZ10|SHOPIZ5|FREESHIP/,
      exact: false,
    })
    .first()
    .click();
  await popup().waitFor();
}
async function total(value) {
  await page.getByTestId("cart-total").filter({ hasText: value }).waitFor();
}
async function code(value) {
  await popup()
    .getByRole("textbox", { name: "Voucher code", exact: true })
    .fill(value);
  await popup().getByRole("button", { name: "Apply", exact: true }).click();
}
try {
  await page.goto(base + "/cart");
  await page.evaluate(() => {
    localStorage.removeItem("shopiz-cart-voucher-v1");
    localStorage.setItem(
      "shopiz-cart-v1",
      JSON.stringify([
        {
          productId: "1",
          variant: "Cloud",
          size: "",
          quantity: 2,
          selected: true,
        },
      ]),
    );
  });
  await page.reload();
  await total("$99.80");
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await open();
    assert.equal(
      await popup()
        .getByRole("textbox", { name: "Voucher code" })
        .evaluate((input) => document.activeElement === input),
      true,
    );
    const bounds = await popup().evaluate((node) => {
      const r = node.getBoundingClientRect();
      return {
        left: r.left,
        right: r.right,
        top: r.top,
        bottom: r.bottom,
        width: innerWidth,
        height: innerHeight,
        scroll: node.scrollWidth,
        client: node.clientWidth,
      };
    });
    assert.ok(
      bounds.left >= 0 &&
        bounds.right <= bounds.width &&
        bounds.top >= 0 &&
        bounds.bottom <= bounds.height &&
        bounds.scroll <= bounds.client,
      `Popup overflow at ${width}`,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    console.log(`PASS voucher popup at ${width}px; no screenshots`);
  }
  await open();
  assert.equal(
    await popup()
      .getByRole("button", { name: "Apply", exact: true })
      .isDisabled(),
    true,
  );
  await code("NOTREAL");
  await popup()
    .getByRole("alert")
    .filter({ hasText: "Voucher code not found" })
    .waitFor();
  await code("WELCOME15");
  await popup()
    .getByRole("alert")
    .filter({ hasText: "Add $0.20 more" })
    .waitFor();
  await code(" shopiz10 ");
  await popup()
    .getByRole("status")
    .filter({ hasText: "SHOPIZ10 selected" })
    .waitFor();
  await total("$99.80");
  await popup().getByRole("button", { name: "Confirm", exact: true }).click();
  await total("$89.82");
  await page.reload();
  await total("$89.82");
  await open();
  await popup().getByRole("radio", { name: "SHOPIZ5", exact: true }).check();
  await popup().getByRole("button", { name: "Back", exact: true }).click();
  await total("$89.82");
  await page.getByRole("article").getByRole("spinbutton").fill("4");
  await page.getByRole("article").getByRole("spinbutton").blur();
  await total("$184.60");
  await page.getByRole("button", { name: "Checkout (4)", exact: true }).click();
  await page.waitForURL("**/checkout");
  assert.equal(
    await page.getByTestId("checkout-discount").textContent(),
    "−$15.00",
  );
  assert.equal(
    await page.getByTestId("checkout-total").textContent(),
    "$184.60",
  );
  await page.getByRole("link", { name: "Back to cart", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Select all products", exact: true })
    .uncheck();
  await total("$0.00");
  await open();
  assert.equal(
    await popup()
      .getByRole("radio", { name: "SHOPIZ10", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await popup()
      .getByRole("button", { name: "Confirm", exact: true })
      .isDisabled(),
    true,
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("checkbox", { name: "Select all products", exact: true })
    .check();
  await total("$184.60");
  await open();
  await popup()
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await popup().getByRole("button", { name: "Confirm", exact: true }).click();
  await total("$199.60");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("shopiz-cart-voucher-v1")),
    null,
  );
  await open();
  await popup().getByRole("radio", { name: "FREESHIP", exact: true }).check();
  await popup().getByRole("button", { name: "Confirm", exact: true }).click();
  await total("$199.60");
  await page.getByText("Shipping voucher selected", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Remove voucher", exact: true })
    .click();
  await total("$199.60");
  assert.deepEqual(errors, []);
  console.log(
    "PASS invalid/minimum-spend codes, normalized input, draft/confirm/cancel, persistence, stock-change recalculation/cap, selection invalidation, checkout totals, clear/remove and free shipping; no runtime errors",
  );
} finally {
  await browser.close();
}
