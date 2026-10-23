import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];

page.on("pageerror", (error) => {
  console.error("PAGE ERROR:", error.message);
  errors.push(error.message);
});

function check(value, message) {
  if (!value) throw new Error(message);
}

try {
  console.log("1. Testing navigation to backend product /product/72...");
  await page.goto(`${base}/product/72`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  const title = await page.locator("h1").textContent();
  console.log("Product title rendered:", title);
  check(title.includes("Linen Summer Trousers"), "Product title mismatch");

  console.log("Checking specifications section...");
  await page.getByRole("heading", { name: "PRODUCT SPECIFICATIONS", exact: true }).waitFor();

  console.log("Checking ratings section...");
  await page.getByRole("heading", { name: "PRODUCT RATINGS", exact: true }).waitFor();

  console.log("Checking variation buttons...");
  const beigeBtn = page.getByRole("button", { name: "Beige" });
  await beigeBtn.waitFor();
  await beigeBtn.click();
  check((await beigeBtn.getAttribute("aria-pressed")) === "true", "Beige not selected");

  const khakiBtn = page.getByRole("button", { name: "Khaki" });
  await khakiBtn.click();
  check((await khakiBtn.getAttribute("aria-pressed")) === "true", "Khaki not selected");

  console.log("Testing Add to Cart for backend product 72...");
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Product added to cart." }).waitFor();

  console.log("2. Testing navigation to backend product /product/69...");
  await page.goto(`${base}/product/69`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  const title69 = await page.locator("h1").textContent();
  console.log("Product 69 title rendered:", title69);
  check(title69.includes("Smartwatch"), "Product 69 title mismatch");

  console.log("3. Testing navigation to mock product /product/1...");
  await page.goto(`${base}/product/1`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  const title1 = await page.locator("h1").textContent();
  console.log("Product 1 title rendered:", title1);
  check(title1.includes("Headphones"), "Product 1 title mismatch");

  console.log("4. Testing click navigation from Home page to product detail...");
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  // Find the first product card and click it
  const firstCard = page.locator("a[href^='/product/']").first();
  await firstCard.waitFor();
  const targetHref = await firstCard.getAttribute("href");
  console.log("Clicking product card pointing to:", targetHref);
  await firstCard.click();
  await page.locator("h1").waitFor();
  console.log("Navigated to product detail successfully:", page.url());

  check(errors.length === 0, `Encountered ${errors.length} page errors: ${errors.join(", ")}`);
  console.log("ALL PRODUCT DETAIL VERIFICATIONS PASSED SUCCESSFULLY!");
} catch (err) {
  console.error("TEST FAILED:", err);
  process.exit(1);
} finally {
  await browser.close();
}
