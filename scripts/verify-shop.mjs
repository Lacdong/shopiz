import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const catalog = () => page.locator('[aria-label="Shop products"]');
const nav = () =>
  page.getByRole("navigation", { name: "Shop navigation", exact: true });
async function count(n) {
  await page
    .getByText(`${n} ${n === 1 ? "product" : "products"}`, { exact: true })
    .waitFor();
}
async function first(href) {
  await page.waitForFunction(
    (href) =>
      document
        .querySelector('[aria-label="Shop products"] > a')
        ?.getAttribute("href") === href,
    href,
  );
}
async function cards(n) {
  await page.waitForFunction(
    (n) =>
      document.querySelectorAll('[aria-label="Shop products"] > a').length ===
      n,
    n,
  );
}
try {
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ["sonora", "atelier", "north-form"]) {
      await page.goto(`${base}/shop/${id}`);
      await page.getByRole("heading", { level: 1 }).waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Storefront overflow ${id} at ${width}`,
      );
      await page
        .getByRole("heading", { name: "RECOMMENDED FOR YOU", exact: true })
        .waitFor();
      await nav()
        .getByRole("button", { name: "All Products", exact: true })
        .click();
      await catalog().waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Shop catalog overflow ${id} at ${width}`,
      );
    }
    console.log(
      `PASS three storefronts and catalogs at ${width}px; no screenshots`,
    );
  }
  await page.goto(base + "/shop/north-form");
  const profile = () =>
    page.getByRole("region", { name: "Shop profile", exact: true });
  await profile().getByRole("button", { name: "Follow", exact: true }).click();
  await profile()
    .getByRole("button", { name: "Following", exact: true })
    .waitFor();
  await page.reload();
  await profile()
    .getByRole("button", { name: "Following", exact: true })
    .waitFor();
  await page.goto(base + "/shop/atelier");
  await profile()
    .getByRole("button", { name: "Follow", exact: true })
    .waitFor();
  await page.goto(base + "/shop/north-form");
  await profile()
    .getByRole("button", { name: "Following", exact: true })
    .click();
  await profile()
    .getByRole("button", { name: "Follow", exact: true })
    .waitFor();
  await profile()
    .getByRole("button", { name: "Chat Now", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Chat with NORTH / FORM", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await nav()
    .getByRole("button", { name: "All Products", exact: true })
    .click();
  await count(8);
  await cards(6);
  await page
    .getByRole("button", { name: "Next shop page", exact: true })
    .click();
  await cards(2);
  await page
    .getByRole("button", { name: "Previous shop page", exact: true })
    .click();
  await cards(6);
  await page
    .getByRole("combobox", { name: "Shop price sort" })
    .selectOption("price-desc");
  await first("/product/12");
  await page.getByRole("button", { name: "Latest", exact: true }).click();
  await first("/product/17");
  await page
    .getByRole("button", { name: "Top Sales", exact: true })
    .last()
    .click();
  await first("/product/3");
  await page
    .getByRole("complementary", { name: "Shop categories" })
    .getByRole("button", { name: /^Men’s Fashion/ })
    .click();
  await count(2);
  await page.reload();
  await count(2);
  const search = () =>
    page.getByRole("textbox", { name: "Search this shop", exact: true });
  await search().fill("shoes");
  await page
    .getByRole("button", { name: "Search shop products", exact: true })
    .click();
  await count(2);
  assert.equal(await catalog().locator("a").count(), 2);
  await search().fill("unfindable123");
  await page
    .getByRole("button", { name: "Search shop products", exact: true })
    .click();
  await count(0);
  await page
    .getByRole("heading", { name: "No products found in this shop" })
    .waitFor();
  await page.goBack();
  await count(2);
  await page.waitForFunction(
    () =>
      document.querySelector('input[aria-label="Search this shop"]').value ===
      "shoes",
  );
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await count(8);
  await nav()
    .getByRole("button", { name: "New Arrivals", exact: true })
    .click();
  await first("/product/17");
  await nav().getByRole("button", { name: "About Shop", exact: true }).click();
  await page
    .getByRole("heading", { name: "Made for the everyday.", exact: true })
    .waitFor();
  await page.goto(base + "/search?q=headphones");
  await page.getByRole("link", { name: "View Shop", exact: true }).click();
  await page.waitForURL("**/shop/sonora");
  await page
    .getByRole("heading", { name: "SONORA Official Store", exact: true })
    .waitFor();
  await page.goto(base + "/product/4");
  await page
    .getByRole("region", { name: "Seller information" })
    .getByRole("link", { name: "View Shop", exact: true })
    .click();
  await page.waitForURL("**/shop/north-form");
  await page.goto(base + "/cart");
  await page.evaluate(() =>
    localStorage.setItem(
      "shopiz-cart-v1",
      JSON.stringify([
        {
          productId: "1",
          variant: "Cloud",
          size: "",
          quantity: 1,
          selected: true,
        },
      ]),
    ),
  );
  await page.reload();
  await page.getByRole("link", { name: "Visit Shop", exact: true }).click();
  await page.waitForURL("**/shop/sonora");
  await nav()
    .getByRole("button", { name: "All Products", exact: true })
    .click();
  await count(4);
  await catalog().locator("a").first().click();
  await page.waitForURL("**/product/*");
  await page.goto(base + "/shop/missing");
  await page
    .getByRole("heading", { name: "Shop not found", exact: true })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS follow persistence/isolation, chat notice, tabs, shop search/back, category filtering, sorting, pagination, missing-shop fallback and View Shop links from search/product/cart",
  );
} finally {
  await browser.close();
}
