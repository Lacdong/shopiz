import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  console.log("1. Clearing storage to start as guest/unauthenticated user...");
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "networkidle" });

  console.log("2. Clicking 'Seller Center' in utility nav as unauthenticated guest...");
  const sellerLink = page.getByRole("link", { name: "Seller Center" }).first();
  await sellerLink.waitFor({ state: "visible" });
  await sellerLink.click();

  console.log("3. Verifying redirected to /login with returnTo=/seller...");
  await page.waitForURL((url) => url.pathname.includes("/login"), { waitUntil: "commit" });
  assert(page.url().includes("/login"), "Must redirect to /login");

  console.log("4. Logging in as Buyer ('demo' / 'Shopiz@123')...");
  await page.getByLabel("Phone number / Email / Username", { exact: true }).fill("demo");
  await page.getByLabel("Password", { exact: true }).fill("Shopiz@123");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();

  console.log("5. Verifying Buyer is redirected to homepage ('/') to browse products...");
  await page.waitForURL((url) => !url.pathname.includes("/seller") && (url.pathname === "/" || url.pathname === ""), { waitUntil: "commit" });
  assert(page.url().endsWith("/") || !page.url().includes("/seller"), "Buyer must be redirected to homepage, not /seller");

  console.log("6. Clicking 'Seller Center' as logged-in Buyer...");
  const sellerLinkAsBuyer = page.getByRole("link", { name: "Seller Center" }).first();
  await sellerLinkAsBuyer.click();

  console.log("7. Verifying Buyer is redirected to /login with seller_required notice...");
  await page.waitForURL((url) => url.pathname.includes("/login"), { waitUntil: "commit" });
  await page.getByText("Vui lòng đăng nhập với tài khoản Người bán để truy cập Kênh Người Bán").waitFor();

  console.log("8. Logging in as Seller ('seller' / 'Shopiz@123')...");
  await page.getByLabel("Phone number / Email / Username", { exact: true }).fill("seller");
  await page.getByLabel("Password", { exact: true }).fill("Shopiz@123");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();

  console.log("9. Verifying Seller is redirected directly to /seller (Seller Center)...");
  await page.waitForURL((url) => url.pathname.includes("/seller"), { waitUntil: "commit" });
  assert(page.url().includes("/seller"), "Seller must be redirected to /seller");
  await page.getByText("SmartOmni Official Flagship").first().waitFor();

  console.log("10. Returning to homepage and clicking 'Seller Center' as authenticated Seller...");
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const sellerLinkAsSeller = page.getByRole("link", { name: "Seller Center" }).first();
  await sellerLinkAsSeller.click();
  await page.waitForURL((url) => url.pathname.includes("/seller"), { waitUntil: "commit" });
  assert(page.url().includes("/seller"), "Authenticated seller must navigate directly to /seller");

  assert.equal(errors.length, 0, `Page errors found: ${errors.join("; ")}`);
  console.log("🎉 ALL SELLER AUTH & REDIRECT FLOW CHECKS PASSED (100%)!");
} finally {
  await browser.close();
}
