import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

try {
  console.log("=================================================");
  console.log("VERIFYING: SELLER MULTI-SHOP SELECTOR & SWITCHER");
  console.log("=================================================");

  // 1. Responsive layout checks on /seller/select-shop
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/seller/select-shop`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Select Your Shop" }).waitFor();

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    assert.ok(noOverflow, `Overflow on /seller/select-shop at ${width}px`);
    console.log(`PASS shop selector layout ${width}px`);
  }

  // Restore desktop viewport for functional tests
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/seller/select-shop`, { waitUntil: "networkidle" });

  // 2. Verify all shops are rendered in the grid
  const shopCards = page.locator("div[class*='card']");
  const count = await shopCards.count();
  console.log(`Found ${count} shops available to manage.`);
  assert.ok(count >= 3, "Expected at least 3 shops available");

  // Verify flagship store is present
  await page.getByText("SmartOmni Official Flagship").waitFor();
  await page.getByText("Hanoi Streetwear Co.").waitFor();

  // 3. Test selecting a backend shop (e.g. SmartOmni Flagship 727720655)
  const smartOmniCard = page
    .locator("div[class*='card']")
    .filter({ hasText: "SmartOmni Official Flagship" });
  await smartOmniCard.getByRole("button").click();

  // Should navigate to /seller with shop_id=727720655
  await page.waitForURL("**/seller?shop_id=727720655");
  await page.locator("header").getByText("SmartOmni", { exact: false }).waitFor();
  console.log("Successfully navigated to Seller Center for SmartOmni Flagship!");

  // Verify header reflects selected shop
  assert.ok(
    (await page.locator("header").getByText("SmartOmni", { exact: false }).count()) >= 1,
    "Header reflects selected shop",
  );

  // 4. Test "Switch Shop" button in header
  await page.getByRole("link", { name: "Switch Shop" }).click();
  await page.waitForURL("**/seller/select-shop");
  console.log("Header 'Switch Shop' button successfully navigated back to selector!");

  // 5. Test selecting Hanoi Streetwear Co. (839910244)
  const hanoiCard = page
    .locator("div[class*='card']")
    .filter({ hasText: "Hanoi Streetwear Co." });
  await hanoiCard.getByRole("button").click();
  await page.waitForURL("**/seller?shop_id=839910244");
  await page.locator("header").getByText("Hanoi Streetwear", { exact: false }).waitFor();
  console.log("Successfully switched shop to Hanoi Streetwear Co.!");

  assert.equal(errors.length, 0, `Page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL MULTI-SHOP SELECTOR TESTS PASSED WITH 0 ERRORS!");
} finally {
  await browser.close();
}
