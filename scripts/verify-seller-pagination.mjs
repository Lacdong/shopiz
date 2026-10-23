import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

try {
  console.log("=================================================");
  console.log("VERIFYING: SELLER CENTER PAGINATION ACROSS PAGES");
  console.log("=================================================");

  // 1. All Orders Page Pagination
  console.log("\n[1/3] Testing All Orders Page Pagination...");
  await page.goto(`${base}/seller?tab=orders_all&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.locator("table[class*='ordersTable']").waitFor();

  const ordersPagination = page.locator("div[aria-label='Phân trang']");
  await ordersPagination.waitFor();
  console.log("PASS Pagination component mounted on All Orders page");

  const initialInfoText = await ordersPagination.locator("div[class*='info']").innerText();
  console.log(`Initial Orders info text: '${initialInfoText.trim()}'`);
  assert.match(
    initialInfoText,
    /Hiển thị 1 - 10 trên \d+ mục/,
    "Expected initial range '1 - 10 trên X mục'",
  );

  // Check 10 rows on page 1
  let rows = await page.locator("tr[class*='orderDataRow']").count();
  assert.equal(rows, 10, "Default page size 10 must display 10 order rows");

  // Click Next page button
  const nextBtn = ordersPagination.locator("button[aria-label='Trang sau']");
  assert.ok(await nextBtn.isEnabled(), "Next page button should be enabled on page 1");
  await nextBtn.click();
  await page.waitForTimeout(300);

  const page2InfoText = await ordersPagination.locator("div[class*='info']").innerText();
  console.log(`Page 2 info text: '${page2InfoText.trim()}'`);
  assert.match(page2InfoText, /Hiển thị 11 - 20 trên \d+ mục/, "Page 2 range must be '11 - 20'");

  // Active page button should be 2
  const activePageBtn = ordersPagination.locator("button[aria-current='page']");
  assert.equal(await activePageBtn.innerText(), "2", "Active page button must show '2'");
  console.log("PASS Page 2 navigation verified");

  // Click Page 1 button
  const prevBtn = ordersPagination.locator("button[aria-label='Trang trước']");
  assert.ok(await prevBtn.isEnabled(), "Previous button enabled on page 2");
  await prevBtn.click();
  await page.waitForTimeout(300);

  const backPage1InfoText = await ordersPagination.locator("div[class*='info']").innerText();
  assert.match(backPage1InfoText, /Hiển thị 1 - 10 trên \d+ mục/);
  console.log("PASS Previous page button returned to page 1");

  // Change page size to 20
  const pageSizeSelect = ordersPagination.locator("select[class*='pageSizeSelect']");
  await pageSizeSelect.selectOption("20");
  await page.waitForTimeout(300);

  const p20InfoText = await ordersPagination.locator("div[class*='info']").innerText();
  console.log(`20/page info text: '${p20InfoText.trim()}'`);
  assert.match(p20InfoText, /Hiển thị 1 - 20 trên \d+ mục/);

  rows = await page.locator("tr[class*='orderDataRow']").count();
  assert.equal(rows, 20, "20 items per page must render 20 order rows");
  console.log("PASS Page size selection (20 items/page) verified");

  // Filter application resets page to 1
  // Move to page 2 first with 20 items/page
  await nextBtn.click();
  await page.waitForTimeout(300);
  assert.equal(await ordersPagination.locator("button[aria-current='page']").innerText(), "2");

  // Search something
  const searchInput = page.locator("input[class*='searchInput']");
  await searchInput.fill("261019");
  await page.getByRole("button", { name: "Áp dụng", exact: true }).click();
  await page.waitForTimeout(300);

  // Should have reset to page 1
  const searchInfoText = await ordersPagination.locator("div[class*='info']").innerText();
  assert.ok(searchInfoText.includes("Hiển thị 1 -"), "Search submission must reset page to 1");
  console.log("PASS Search submission reset page back to 1");

  // Reset filter
  await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await page.waitForTimeout(300);

  // 2. Products Page Pagination
  console.log("\n[2/3] Testing Products Page Pagination...");
  await page.goto(`${base}/seller?tab=products_all&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.locator("table[class*='productsTable']").waitFor();

  const productsPagination = page.locator("div[aria-label='Phân trang']");
  await productsPagination.waitFor();
  const prodInfoText = await productsPagination.locator("div[class*='info']").innerText();
  console.log(`Products info text: '${prodInfoText.trim()}'`);
  assert.match(prodInfoText, /Hiển thị 1 - \d+ trên \d+ mục/);
  console.log("PASS Pagination component mounted on Products page");

  // 3. Returns & Refunds Page Pagination
  console.log("\n[3/3] Testing Returns Page Pagination...");
  await page.goto(`${base}/seller?tab=returns&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.locator("table[class*='returnsTable']").waitFor();

  const returnsPagination = page.locator("div[aria-label='Phân trang']");
  await returnsPagination.waitFor();
  const returnsInfoText = await returnsPagination.locator("div[class*='info']").innerText();
  console.log(`Returns info text: '${returnsInfoText.trim()}'`);
  assert.match(returnsInfoText, /Hiển thị 1 - \d+ trên \d+ mục/);
  console.log("PASS Pagination component mounted on Returns page");

  if (errors.length > 0) {
    throw new Error(`Browser uncaught errors: ${errors.join("; ")}`);
  }

  console.log("\n🎉 ALL SELLER CENTER PAGINATION TESTS PASSED (100%)!");
} catch (err) {
  console.error("FAIL:", err);
  process.exit(1);
} finally {
  await browser.close();
}
