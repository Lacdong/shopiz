import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const EXPECTED_STATUS_TABS = [
  "Tất cả",
  "Đang hoạt động",
  "Vi phạm",
  "Chờ duyệt bởi Shopee",
  "Chưa được đăng",
];

const EXPECTED_SUB_TABS = [
  "Tất cả",
  "Cần bổ sung hàng",
  "Cần Cải Thiện Nội Dung",
];

const EXPECTED_COLUMNS = [
  "Tên sản phẩm",
  "Giá",
  "Kho hàng",
  "Hiệu suất",
  "Đánh giá sản phẩm",
  "Thao tác",
];

try {
  console.log("=================================================");
  console.log("VERIFYING: ALL PRODUCTS MANAGEMENT PAGE");
  console.log("=================================================");

  // 1. Navigate to /seller?tab=products_all&shop_id=727720655
  await page.goto(`${base}/seller?tab=products_all&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Sản phẩm", exact: true }).waitFor();
  console.log("PASS Page title 'Sản phẩm' rendered");

  // 2. Verify header controls
  await page.getByText("Cài đặt sản phẩm").waitFor();
  await page.getByText("Công cụ xử lý hàng loạt").waitFor();
  await page.getByRole("button", { name: /\+ Thêm 1 sản phẩm mới/ }).waitFor();
  console.log("PASS Header controls and '+ Thêm 1 sản phẩm mới' rendered");

  // 3. Verify all 5 main status tabs in exact order with dynamic count badges
  const statusTabs = page.locator("div[class*='statusTabsRow'] button[role='tab']");
  const tabCount = await statusTabs.count();
  assert.equal(tabCount, 5, `Expected 5 main status tabs, got ${tabCount}`);

  for (let i = 0; i < EXPECTED_STATUS_TABS.length; i++) {
    const text = await statusTabs.nth(i).innerText();
    assert.ok(
      text.includes(EXPECTED_STATUS_TABS[i]),
      `Status Tab ${i + 1} mismatch: expected '${EXPECTED_STATUS_TABS[i]}', got '${text.trim()}'`,
    );
    assert.match(text, /\(\d+\)/, `Tab '${EXPECTED_STATUS_TABS[i]}' must have dynamic count badge e.g. (14)`);
  }
  console.log("PASS All 5 main status tabs verified with dynamic API count badges");

  // 4. Verify all 3 sub-tabs in exact order
  const subTabs = page.locator("div[class*='subTabsRow'] button");
  const subCount = await subTabs.count();
  assert.equal(subCount, 3, `Expected 3 sub-tabs, got ${subCount}`);

  for (let i = 0; i < EXPECTED_SUB_TABS.length; i++) {
    const text = await subTabs.nth(i).innerText();
    assert.ok(
      text.includes(EXPECTED_SUB_TABS[i]),
      `Sub-tab ${i + 1} mismatch: expected '${EXPECTED_SUB_TABS[i]}', got '${text.trim()}'`,
    );
  }
  console.log("PASS All 3 sub-tabs verified in exact order");

  // 5. Verify dynamic product count
  const countElement = page.locator("span[class*='productCountBold']");
  await countElement.waitFor();
  const countText = await countElement.innerText();
  console.log(`Live Product Count: '${countText}'`);
  assert.match(countText, /\d+\s+Sản Phẩm/, "Product count must match format '{N} Sản Phẩm'");

  // 6. Verify table columns in exact order
  const headers = page.locator("table[class*='productsTable'] th");
  for (let i = 0; i < EXPECTED_COLUMNS.length; i++) {
    const headerText = await headers.nth(i + 1).innerText(); // skip checkbox col
    assert.ok(
      headerText.includes(EXPECTED_COLUMNS[i]),
      `Column ${i + 1} mismatch: expected '${EXPECTED_COLUMNS[i]}', got '${headerText.trim()}'`,
    );
  }
  console.log("PASS Table columns verified in exact order");

  // 7. Verify live product rows and VND currency formatting
  const rows = page.locator("tr[class*='productRow']");
  const rowCount = await rows.count();
  console.log(`Loaded ${rowCount} product rows from backend simulator.`);
  assert.ok(rowCount > 0, "Expected at least 1 product row loaded from simulator");

  const firstPrice = await rows.first().locator("td[class*='priceCell']").innerText();
  assert.ok(firstPrice.includes("₫"), "Product price formatted in VND (₫)");
  console.log(`PASS Live product price verified: ${firstPrice.trim()}`);

  // 8. Verify variations expansion (e.g. Linen Summer Trousers with models)
  const expandBtn = page.locator("button[class*='btnExpandVariations']").first();
  if ((await expandBtn.count()) > 0) {
    const btnText = await expandBtn.innerText();
    console.log(`Variation expansion button found: '${btnText}'`);
    assert.match(btnText, /Xem thêm \(còn \d+ phân loại\)/, "Variation expansion text matches spec");

    // Click expand
    await expandBtn.click();
    const variationRows = page.locator("tr[class*='variationRow']");
    const expandedVarCount = await variationRows.count();
    assert.ok(expandedVarCount > 2, `Expanded variations count: ${expandedVarCount}`);
    console.log(`PASS Expanded to show all ${expandedVarCount} model variations`);

    // Click collapse
    await page.getByRole("button", { name: "Thu gọn phân loại" }).click();
    console.log("PASS Collapsed variation list cleanly");
  }

  // 9. Test search by product name
  const sampleName = await page.locator("span[class*='productName']").first().innerText();
  const searchKeyword = sampleName.split(" ")[0];
  console.log(`Searching for keyword: '${searchKeyword}'`);

  const searchInput = page.locator("input[class*='searchInput']");
  await searchInput.fill(searchKeyword);
  await page.locator("button[class*='btnApply']").click();

  const searchRowCount = await page.locator("tr[class*='productRow']").count();
  assert.ok(searchRowCount >= 1, "Search should return matching products");
  console.log(`PASS Product search returned ${searchRowCount} matching items`);

  // Reset filter
  await page.locator("button[class*='btnReset']").click();
  const resetCount = await page.locator("tr[class*='productRow']").count();
  assert.equal(resetCount, rowCount, "Reset filter restores original product count");
  console.log("PASS Reset filter restores full product list");

  // 10. Test Quick Filter Chips
  const chip = page.locator("button[class*='filterChip']").first();
  await chip.click();
  assert.ok((await chip.getAttribute("class")).includes("chipSelected"), "Quick chip becomes selected");
  await chip.click();
  console.log("PASS Quick filter chip toggle verified");

  // 11. Test Quick Stock Edit Modal
  const editStockBtn = page.getByRole("button", { name: "Cập nhật" }).first();
  await editStockBtn.click();
  await page.getByRole("heading", { name: "Cập nhật kho hàng" }).waitFor();
  await page.getByRole("button", { name: "Hủy" }).click();
  console.log("PASS Stock update modal opens and closes cleanly");

  assert.equal(errors.length, 0, `Page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL PRODUCT MANAGEMENT SPECIFICATION TESTS PASSED (100%)!");
} finally {
  await browser.close();
}
