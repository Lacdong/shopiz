import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const backend = process.env.SHOPEE_SIMULATOR_URL || "http://127.0.0.1:8080";
const shopId = 727720655;
const api = async (path, options = {}) => {
  const response = await fetch(`${backend}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return response.json();
};
try {
  const catalog = await api(`/api/v2/simulator/products?shop_id=${shopId}&page_size=1`);
  const item = catalog.response.products?.[0];
  assert.ok(item?.item_id, "Expected a seeded backend product");
  const itemId = item.item_id;
  const before = await api(`/api/v2/simulator/product/extra_info?shop_id=${shopId}&item_id_list=${itemId}`);
  const beforeViews = before.response.item_list[0].views;
  const existingLike = await api(`/api/v2/simulator/product/like?item_id=${itemId}&buyer_user_id=1001`);
  if (existingLike.response.liked) {
    await api("/api/v2/simulator/product/like", { method: "POST", body: { item_id: itemId, buyer_user_id: 1001 } });
  }

  const batchLengths = [];
  page.on("request", (request) => {
    if (request.url().includes("/simulator/product/extra_info")) {
      const ids = new URL(request.url()).searchParams.get("item_id_list") || "";
      batchLengths.push(ids.split(",").filter(Boolean).length);
    }
  });
  await page.goto(`${base}/seller?tab=products_all&shop_id=${shopId}`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Sản phẩm", exact: true }).waitFor();
  assert.ok(batchLengths.every((length) => length <= 50), "Seller metric requests must be batched to at most 50 IDs");
  const performanceCell = page.locator('td[class*="perfCell"]').first();
  await performanceCell.waitFor();
  assert.match(await performanceCell.innerText(), /Doanh số/, "Seller catalog should render API-backed sales, views, and likes");
  assert.doesNotMatch(await performanceCell.innerText(), /—/, "Available seller metrics should not use the unavailable fallback");
  assert.doesNotMatch(await page.locator('td[class*="ratingCell"]').first().innerText(), /—/, "Available rating metrics should render from the API");

  await page.goto(`${base}/product/${itemId}`);
  await page.locator("h1").waitFor();
  await page.waitForTimeout(350);
  const afterView = await api(`/api/v2/simulator/product/extra_info?shop_id=${shopId}&item_id_list=${itemId}`);
  assert.equal(afterView.response.item_list[0].views, beforeViews + 1, "A backend product detail visit increments views once");

  await page.getByRole("button", { name: "Save to favorites" }).click();
  await page.waitForURL(`${base}/login`);
  await page.getByLabel("Phone number / Email / Username", { exact: true }).fill("demo@shopiz.com");
  await page.getByLabel("Password", { exact: true }).fill("Shopiz@123");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await page.waitForURL(`${base}/product/${itemId}`);
  await page.getByRole("button", { name: "Save to favorites" }).click();
  await page.getByRole("button", { name: /Saved to favorites/ }).waitFor();
  const like = await api(`/api/v2/simulator/product/like?item_id=${itemId}&buyer_user_id=1001`);
  assert.equal(like.response.liked, true, "Signed-in favorite is persisted for the buyer");
  const cleanupLike = await api("/api/v2/simulator/product/like", { method: "POST", body: { item_id: itemId, buyer_user_id: 1001 } });
  assert.equal(cleanupLike.response.liked, false, "Test restores the buyer favorite state");
  console.log("PASS Seller metrics batch at 50, product views, login return, and persisted likes");
} finally {
  await browser.close();
}
