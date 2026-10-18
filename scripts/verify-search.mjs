import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const results = () => page.locator('[aria-label="Search result products"]');
async function count(n) {
  await page
    .getByText(`${n} ${n === 1 ? "result" : "results"}`, { exact: true })
    .waitFor();
}
async function cardCount(n) {
  await page.waitForFunction(
    (n) =>
      document.querySelectorAll('[aria-label="Search result products"] > a')
        .length === n,
    n,
  );
}
async function first(href) {
  await page.waitForFunction(
    (href) =>
      document
        .querySelector('[aria-label="Search result products"] > a')
        ?.getAttribute("href") === href,
    href,
  );
  assert.equal(await results().locator("a").first().getAttribute("href"), href);
}
async function filters() {
  const button = page.getByRole("button", { name: /^Filters/ });
  if (
    (await button.isVisible()) &&
    (await button.getAttribute("aria-expanded")) !== "true"
  )
    await button.click();
}
try {
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const query of ["", "home"]) {
      await page.goto(`${base}/search?q=${query}`);
      await page.locator("h1").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Search overflow ${width}`,
      );
      if (query)
        await page
          .getByRole("heading", { name: "SHOP RELATED TO “home”", exact: true })
          .waitFor();
    }
    console.log(
      `PASS search layout and related shop at ${width}px; no screenshots`,
    );
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base + "/search");
  await count(18);
  assert.equal(await results().locator("a").count(), 15);
  await page
    .getByRole("button", { name: "Next results page", exact: true })
    .click();
  await page.waitForURL("**page=2");
  await cardCount(3);
  assert.equal(await results().locator("a").count(), 3);
  await page
    .getByRole("button", { name: "Previous results page", exact: true })
    .click();
  await cardCount(15);
  assert.equal(await results().locator("a").count(), 15);
  await page
    .getByRole("combobox", { name: "Sort by price" })
    .selectOption("price-asc");
  await first("/product/6");
  await page
    .getByRole("combobox", { name: "Sort by price" })
    .selectOption("price-desc");
  await first("/product/13");
  await page.getByRole("button", { name: "Latest", exact: true }).click();
  await first("/product/18");
  await page.getByRole("button", { name: "Top Sales", exact: true }).click();
  await first("/product/3");
  const sidebar = page.getByRole("complementary", { name: "Search filters" });
  await sidebar
    .getByRole("checkbox", { name: "Electronics", exact: true })
    .click();
  await count(3);
  await sidebar.getByRole("checkbox", { name: "Hanoi", exact: true }).click();
  await count(1);
  await sidebar.getByRole("checkbox", { name: "SONORA", exact: true }).click();
  await count(1);
  await first("/product/5");
  await sidebar.getByRole("spinbutton", { name: "Minimum price" }).fill("50");
  await sidebar.getByRole("spinbutton", { name: "Maximum price" }).fill("10");
  await sidebar.getByRole("button", { name: "Apply", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Minimum price must not exceed maximum price." })
    .waitFor();
  await sidebar.getByRole("spinbutton", { name: "Minimum price" }).fill("");
  await sidebar.getByRole("spinbutton", { name: "Maximum price" }).fill("20");
  await sidebar.getByRole("button", { name: "Apply", exact: true }).click();
  await count(0);
  await page
    .getByRole("heading", { name: "No products found", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await count(18);
  await sidebar
    .getByRole("checkbox", { name: "Shopiz Mall", exact: true })
    .click();
  await count(6);
  await page.reload();
  await count(6);
  assert.equal(
    await sidebar
      .getByRole("checkbox", { name: "Shopiz Mall", exact: true })
      .isChecked(),
    true,
  );
  await page
    .getByRole("button", { name: "Remove filter Shopiz Mall", exact: true })
    .click();
  await count(18);
  await sidebar.getByRole("button", { name: "5 stars", exact: true }).click();
  await count(0);
  await sidebar
    .getByRole("button", { name: "Clear all filters", exact: true })
    .click();
  await count(18);
  await page.goto(base + "/search?q=headphones");
  await count(1);
  assert.equal(
    await page
      .getByRole("textbox", { name: "Search products", exact: true })
      .inputValue(),
    "headphones",
  );
  await page
    .getByRole("textbox", { name: "Search products", exact: true })
    .fill("Sonora");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await count(4);
  await page.goBack();
  await count(1);
  assert.equal(
    await page
      .getByRole("textbox", { name: "Search products", exact: true })
      .inputValue(),
    "headphones",
  );
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(base + "/search");
  await filters();
  await sidebar
    .getByRole("checkbox", { name: "Electronics", exact: true })
    .click();
  await count(3);
  await sidebar.getByRole("button", { name: "Close filters" }).click();
  assert.equal(await sidebar.isVisible(), false);
  await results().locator("a").first().click();
  await page.waitForURL("**/product/*");
  await page.getByRole("heading", { level: 1 }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS matching, 15-item pagination, price/latest/sales sorting, combined filters, price validation, empty/reset, Mall filter persistence/chips, ratings, query/back synchronization, mobile filters and product navigation",
  );
} finally {
  await browser.close();
}
