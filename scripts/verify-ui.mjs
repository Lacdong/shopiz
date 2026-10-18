import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5174";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
function check(value, message) {
  if (!value) throw new Error(message);
}
try {
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base);
    await page.locator("h1").waitFor();
    await page.waitForTimeout(1200);
    check(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${width}`,
    );
    check(
      (await page.locator("#categories a").count()) === 20,
      "Missing categories",
    );
    check(
      (await page.locator('#flash-deals [role="progressbar"]').count()) === 6,
      "Missing deals",
    );
    console.log(`PASS ${width}px: layout, categories, deals`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await page.getByRole("button", { name: "Show promotion 2" }).click();
  check(
    await page
      .getByRole("heading", { name: "Your space. Your style." })
      .isVisible(),
    "Carousel failed",
  );
  const timer = page.locator('#flash-deals [aria-label^="Deal ends"]');
  const before = await timer.getAttribute("aria-label");
  await page.waitForTimeout(1200);
  check(
    before !== (await timer.getAttribute("aria-label")),
    "Countdown failed",
  );
  await page
    .getByRole("textbox", { name: "Search products" })
    .fill("headphones");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForURL("**/search?q=headphones");
  await page.getByText("1 result", { exact: true }).waitFor();
  check(
    await page.getByText("1 result", { exact: true }).isVisible(),
    "Search failed",
  );
  await page
    .locator('[aria-label="Search result products"]')
    .getByRole("link", { name: /Studio Wireless Headphones/ })
    .click();
  await page.waitForURL("**/product/1");
  await page
    .getByRole("heading", { name: /Studio Wireless Headphones/ })
    .waitFor();
  check(
    await page
      .getByRole("heading", { name: /Studio Wireless Headphones/ })
      .isVisible(),
    "Product failed",
  );
  await page.getByRole("link", { name: "Shopping cart", exact: true }).click();
  await page.waitForURL("**/cart");
  await page
    .getByRole("heading", { name: "Your next favorite is waiting." })
    .waitFor();
  check(
    await page
      .getByRole("heading", { name: "Your next favorite is waiting." })
      .isVisible(),
    "Cart failed",
  );
  await page.goto(base);
  await page
    .locator("#categories")
    .getByRole("link", { name: "Electronics", exact: true })
    .click();
  await page.waitForURL("**/category/Electronics");
  await page
    .getByRole("heading", { name: "Electronics", exact: true })
    .waitFor();
  check(
    await page
      .getByRole("heading", { name: "Electronics", exact: true })
      .isVisible(),
    "Category failed",
  );
  await page.goto(base);
  await page.getByRole("button", { name: "Discover more" }).click();
  check(
    await page.locator("h3").filter({ hasText: "Indoor Plant" }).isVisible(),
    "Load more failed",
  );
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto(base);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator("header nav")
    .getByRole("link", { name: "Seller Center" })
    .click();
  await page.waitForURL("**/seller");
  await page
    .getByRole("heading", { name: "Seller Center", exact: true })
    .waitFor();
  check(
    await page
      .getByRole("heading", { name: "Seller Center", exact: true })
      .isVisible(),
    "Mobile navigation failed",
  );
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/collection/flash-deals",
      "/collection/top-products",
      "/collection/mall",
    ]) {
      await page.goto(base + route);
      await page.locator("h1").waitFor();
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow at ${width}: ${route}`,
      );
    }
    console.log(`PASS collection pages at ${width}px; no screenshots captured`);
  }
  await page.goto(base + "/collection/flash-deals");
  await page.getByRole("button", { name: "Electronics", exact: true }).click();
  await page
    .locator("#sale-products")
    .getByText(/3 deals/)
    .waitFor();
  check(
    await page
      .locator("#sale-products")
      .innerText()
      .then((text) => text.includes("3 deals")),
    "Sale category filter failed",
  );
  await page.getByRole("button", { name: "12:00 Coming up" }).click();
  await page.getByRole("button", { name: "Remind me" }).first().click();
  await page.getByRole("button", { name: "Saved", exact: true }).waitFor();
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  check(
    (await page.getByRole("button", { name: "Remind me" }).count()) === 3,
    "Reminder toggle failed",
  );
  await page.goto(base + "/collection/top-products");
  await page
    .getByRole("button", { name: "Wireless Headphones", exact: true })
    .click();
  await page.waitForURL("**/collection/top-products?q=headphones");
  await page.waitForFunction(
    () => document.querySelectorAll('a[href^="/product/"]').length === 1,
  );
  check(
    (await page.locator('a[href^="/product/"]').count()) === 1,
    "Top topic filter failed",
  );
  await page.getByRole("button", { name: "All top products" }).click();
  await page.getByRole("combobox", { name: "Rank by" }).selectOption("price");
  await page.waitForFunction(
    () =>
      document.querySelector('a[href^="/product/"]')?.getAttribute("href") ===
      "/product/6",
  );
  check(
    (await page
      .locator('a[href^="/product/"]')
      .first()
      .getAttribute("href")) === "/product/6",
    "Ranking sort failed",
  );
  await page.goto(base + "/collection/mall");
  await page
    .getByRole("button", { name: /SONORA Sound made personal/ })
    .click();
  await page.waitForURL("**/collection/mall?brand=sonora");
  await page.waitForFunction(
    () =>
      document.querySelectorAll('#mall-products a[href^="/product/"]')
        .length === 4,
  );
  check(
    (await page.locator('#mall-products a[href^="/product/"]').count()) === 4,
    "Brand filter failed",
  );
  await page
    .locator("#mall-products")
    .getByRole("button", { name: "Home & Living", exact: true })
    .click();
  await page.getByRole("heading", { name: "No finds just yet" }).waitFor();
  await page.getByRole("button", { name: "See all brands" }).click();
  await page.waitForFunction(
    () =>
      document.querySelectorAll('#mall-products a[href^="/product/"]')
        .length === 18,
  );
  check(
    (await page.locator('#mall-products a[href^="/product/"]').count()) === 18,
    "Clear brand filters failed",
  );
  check(!errors.length, errors.join("; "));
  console.log(
    "PASS sale categories/sessions/reminders, top topic/ranking, Mall brand/category filters and reset",
  );
  console.log(
    "PASS carousel, countdown, search, product, cart, category, load more, mobile navigation; zero runtime errors",
  );
} finally {
  await browser.close();
}
