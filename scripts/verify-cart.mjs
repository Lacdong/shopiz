import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
function check(value, message) {
  if (!value) throw new Error(message);
}
async function total(value) {
  await page.getByTestId("cart-total").filter({ hasText: value }).waitFor();
}
async function add(id, { variant, size, quantity = 1 } = {}) {
  await page.goto(`${base}/product/${id}`);
  if (variant)
    await page
      .getByRole("group", { name: id === "1" ? "Color" : "Style", exact: true })
      .getByRole("button", { name: variant, exact: true })
      .click();
  if (size)
    await page
      .getByRole("group", { name: "Size", exact: true })
      .getByRole("button", { name: size, exact: true })
      .click();
  await page
    .getByRole("spinbutton", { name: "Quantity", exact: true })
    .fill(String(quantity));
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Product added to cart." })
    .waitFor();
  check(
    (await page.getByRole("dialog").count()) === 0,
    "Add to Cart opened a popup",
  );
  check(
    (await page
      .getByRole("button", { name: "Continue browsing", exact: true })
      .count()) === 0,
    "Continue browsing button still present",
  );
  await page.getByRole("link", { name: "Shopping cart", exact: true }).click();
  await page.waitForURL("**/cart");
}
try {
  await page.goto(base + "/cart");
  await page
    .getByRole("heading", {
      name: "Your next favorite is waiting.",
      exact: true,
    })
    .waitFor();
  await add("1", { variant: "Cloud", quantity: 2 });
  await total("$99.80");
  check(
    (await page.getByRole("article").count()) === 1,
    "Initial cart row missing",
  );
  await page.getByLabel("2 items in cart", { exact: true }).waitFor();
  await page.reload();
  await total("$99.80");
  await add("1", { variant: "Cloud" });
  await total("$149.70");
  check(
    (await page.getByRole("article").count()) === 1,
    "Duplicate variant not merged",
  );
  await add("1", { variant: "Midnight" });
  await total("$199.60");
  check(
    (await page.getByRole("article").count()) === 2,
    "Variants not separated",
  );
  await add("4", { size: "EU 42", quantity: 2 });
  await total("$277.60");
  await page.getByLabel("6 items in cart", { exact: true }).waitFor();
  check(
    (await page.getByRole("article").count()) === 3,
    "Different product/size not separated",
  );
  const recommendations = page.locator("section").filter({
    has: page.getByRole("heading", {
      name: "A LITTLE MORE TO LOVE",
      exact: true,
    }),
  });
  check(
    (await recommendations.locator('a[href^="/product/"]').count()) === 12,
    "Cart recommendations changed",
  );
  await recommendations
    .getByRole("button", { name: "Discover more", exact: true })
    .click();
  check(
    (await recommendations.locator('a[href^="/product/"]').count()) === 18,
    "Recommendation load more failed",
  );
  const shopSelection = page.getByRole("checkbox", {
    name: "Select SONORA Official Store products",
    exact: true,
  });
  await shopSelection.uncheck();
  await total("$78.00");
  await shopSelection.check();
  await total("$277.60");
  check(
    (await page
      .locator("header")
      .evaluate((header) => getComputedStyle(header).backgroundColor)) ===
      "rgb(255, 255, 255)",
    "Cart header should be white",
  );
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Cart overflow at ${width}`,
    );
    check(
      (await page
        .getByRole("search")
        .evaluate((form) => form.getBoundingClientRect().height)) === 40,
      "Cart search dimensions changed",
    );
    console.log(`PASS populated cart at ${width}px; no screenshots`);
  }
  const cloud = page.getByRole("article", { name: /Cloud/ });
  await cloud.getByRole("checkbox").uncheck();
  await total("$127.90");
  await page
    .getByRole("checkbox", { name: "Select all products", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Select all products", exact: true })
    .uncheck();
  await total("$0.00");
  check(
    await page
      .getByRole("button", { name: "Checkout (0)", exact: true })
      .isDisabled(),
    "Checkout not disabled without selected items",
  );
  await page
    .getByRole("checkbox", { name: "Select all products", exact: true })
    .check();
  await total("$277.60");
  await cloud.getByRole("button", { name: /Increase quantity/ }).click();
  await total("$327.50");
  await cloud.getByRole("spinbutton").fill("100");
  await cloud.getByRole("spinbutton").blur();
  check(
    (await cloud.getByRole("spinbutton").inputValue()) === "35",
    "Shared product stock cap failed",
  );
  await page.goto(base + "/product/1");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "All available stock" })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Shopping cart", exact: true }).click();
  const cloudAgain = page.getByRole("article", { name: /Cloud/ });
  await cloudAgain.getByRole("spinbutton").fill("2");
  await cloudAgain.getByRole("spinbutton").blur();
  await total("$227.70");
  await page.getByRole("button", { name: "Checkout (5)", exact: true }).click();
  await page.waitForURL("**/checkout");
  assert.equal(
    await page.getByTestId("checkout-total").textContent(),
    "$227.70",
  );
  await page.getByRole("link", { name: "Back to cart", exact: true }).click();
  await cloudAgain.getByRole("button", { name: /Remove / }).click();
  await total("$127.90");
  await page
    .getByRole("button", { name: "Delete selected", exact: true })
    .click();
  await page
    .getByRole("heading", {
      name: "Your next favorite is waiting.",
      exact: true,
    })
    .waitFor();
  await page.reload();
  await page
    .getByRole("heading", {
      name: "Your next favorite is waiting.",
      exact: true,
    })
    .waitFor();
  check(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("shopiz-cart-v1")).length === 0,
    ),
    "Empty cart was not persisted",
  );
  await page.evaluate(() =>
    localStorage.setItem("shopiz-cart-v1", "broken-json"),
  );
  await page.reload();
  await page
    .getByRole("heading", {
      name: "Your next favorite is waiting.",
      exact: true,
    })
    .waitFor();
  check(!errors.length, errors.join("; "));
  console.log(
    "PASS white cart header, shop selection, compact search and unchanged recommendation cards/load more",
  );
  console.log(
    "PASS Add to Cart, persistence, duplicate merge, variants/sizes, badge, selection/totals, quantity and shared stock caps, checkout navigation/totals, single/bulk delete and corrupt-storage recovery; no runtime errors",
  );
} finally {
  await browser.close();
}
