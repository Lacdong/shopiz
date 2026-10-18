import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dialog = () => page.getByRole("dialog");
async function amount(id, value) {
  await page.getByTestId(`checkout-${id}`).filter({ hasText: value }).waitFor();
  assert.equal(await page.getByTestId(`checkout-${id}`).textContent(), value);
}
async function shipping(name, method) {
  await page
    .getByRole("button", { name: `Change shipping for ${name}`, exact: true })
    .click();
  await dialog().getByRole("radio", { name: method, exact: true }).check();
  await dialog()
    .getByRole("button", { name: "Confirm shipping", exact: true })
    .click();
}
try {
  await page.goto(base + "/cart");
  await page.evaluate(() => {
    localStorage.clear();
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
        {
          productId: "4",
          variant: "Classic",
          size: "EU 42",
          quantity: 1,
          selected: true,
        },
        {
          productId: "6",
          variant: "Original",
          size: "",
          quantity: 1,
          selected: false,
        },
      ]),
    );
    localStorage.setItem("shopiz-cart-voucher-v1", "SHOPIZ10");
  });
  await page.reload();
  await page.getByRole("button", { name: "Checkout (3)", exact: true }).click();
  await page.waitForURL("**/checkout");
  await amount("subtotal", "$138.80");
  await amount("total", "$124.92");
  assert.equal(await page.getByRole("article").count(), 2);
  assert.equal(await page.getByRole("search").count(), 0);
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Checkout overflow ${width}`,
    );
    await page
      .getByRole("button", { name: "Change address", exact: true })
      .click();
    const r = await dialog().evaluate((el) => ({
      width: el.clientWidth,
      scroll: el.scrollWidth,
      left: el.getBoundingClientRect().left,
      right: el.getBoundingClientRect().right,
    }));
    assert.ok(
      r.scroll <= r.width && r.left >= 0 && r.right <= width,
      `Address overflow ${width}`,
    );
    await page.keyboard.press("Escape");
    console.log(
      `PASS checkout and address popup at ${width}px, no screenshots`,
    );
  }
  await page
    .getByRole("button", { name: "Change address", exact: true })
    .click();
  await dialog().getByRole("radio").nth(1).check();
  await dialog().getByRole("button", { name: "Confirm", exact: true }).click();
  await page
    .getByText("24 Sample Avenue, Dich Vong, Cau Giay, Hanoi", { exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Change address", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Edit", exact: true })
    .nth(1)
    .click();
  await dialog()
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("");
  await dialog()
    .getByRole("button", { name: "Save address", exact: true })
    .click();
  assert.equal(
    await dialog()
      .getByRole("textbox", { name: "Full name", exact: true })
      .getAttribute("aria-invalid"),
    "true",
  );
  await dialog()
    .getByRole("textbox", { name: "Full name", exact: true })
    .fill("Checkout Tester");
  await dialog()
    .getByRole("button", { name: "Save address", exact: true })
    .click();
  await page.getByText("Checkout Tester", { exact: false }).first().waitFor();
  const names = await page
    .getByRole("button", { name: /Change shipping for/ })
    .evaluateAll((els) =>
      els.map((el) =>
        el.getAttribute("aria-label").replace("Change shipping for ", ""),
      ),
    );
  for (const name of names) await shipping(name, "Express delivery");
  await amount("shipping", "$5.80");
  await amount("total", "$130.72");
  await page.getByRole("button", { name: "SHOPIZ10", exact: true }).click();
  await dialog().getByRole("radio", { name: "FREESHIP", exact: true }).check();
  await dialog().getByRole("button", { name: "Confirm", exact: true }).click();
  await amount("discount", "−$3.00");
  await amount("total", "$141.60");
  for (const name of names) await shipping(name, "Standard delivery");
  await amount("shipping", "$0.00");
  await amount("total", "$138.80");
  await page
    .getByRole("button", { name: "Change payment", exact: true })
    .click();
  await dialog()
    .getByRole("radio", { name: "Demo wallet", exact: true })
    .check();
  await dialog()
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Change payment", exact: true })
    .click();
  await dialog()
    .getByRole("radio", { name: "Cash on delivery", exact: true })
    .check();
  await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByRole("textbox", { name: /Message to/ })
    .first()
    .fill("Temporary seller note");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .evaluate((el) => {
      el.click();
      el.click();
    });
  await page
    .getByRole("dialog", { name: "Order placed successfully", exact: true })
    .waitFor();
  const state = await page.evaluate(() => ({
    orders: JSON.parse(localStorage.getItem("shopiz-demo-orders-v1")),
    cart: JSON.parse(localStorage.getItem("shopiz-cart-v1")),
  }));
  assert.equal(state.orders.length, 1);
  assert.equal(state.orders[0].total, 138.8);
  assert.equal(state.orders[0].payment, "wallet");
  assert.equal(state.orders[0].items.length, 2);
  assert.equal(state.cart.length, 1);
  assert.equal(state.cart[0].productId, "6");
  assert.equal(state.cart[0].selected, false);
  assert.ok(!JSON.stringify(state.orders).includes("Checkout Tester"));
  assert.ok(!JSON.stringify(state.orders).includes("Temporary seller note"));
  await page.reload();
  await page
    .getByRole("heading", {
      name: "No items selected for checkout",
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("shopiz-demo-orders-v1")).length,
    ),
    1,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS selected lines, address validation/edit, per-shop shipping, voucher recalculation, payment draft/cancel, duplicate-submit protection, mock receipt, unselected-cart preservation and empty checkout; no runtime errors",
  );
} finally {
  await browser.close();
}
