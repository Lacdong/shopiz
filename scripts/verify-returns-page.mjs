import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const EXPECTED_PRIORITIES = ["Tất cả", "Hết hạn trong 1 ngày", "Hết hạn trong 2 ngày"];

const EXPECTED_ACTIONS = [
  "Thương lượng với Người mua",
  "Cần cung cấp bằng chứng",
  "Giữ lại kiện hàng",
  "Kiểm tra hàng hoàn",
  "Phản hồi quyết định hoàn tiền của Shopee",
];

const EXPECTED_COLUMNS = [
  "Sản phẩm",
  "Số tiền hoàn cho Người mua",
  "Số tiền bồi thường cho Người bán",
  "Lý do",
  "Lý do điều chỉnh bởi Shopee",
  "Phương án cho Người mua",
  "Trạng thái",
  "Vận chuyển",
  "Thao tác",
];

try {
  console.log("=================================================");
  console.log("VERIFYING: RETURNS & REFUNDS DISPUTE MANAGEMENT");
  console.log("=================================================");

  // 1. Navigate to /seller?tab=returns&shop_id=727720655
  await page.goto(`${base}/seller?tab=returns&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.getByText("HÀNH ĐỘNG QUAN TRỌNG").waitFor();
  console.log("PASS Returns page layout mounted");

  // 2. Verify Priority Filters
  const priorityRow = page.locator("div[class*='priorityRow']");
  await priorityRow.getByText("Ưu tiên").waitFor();
  for (const prio of EXPECTED_PRIORITIES) {
    await priorityRow.getByRole("button", { name: prio, exact: true }).waitFor();
  }
  console.log("PASS All 3 Priority filter pills verified");

  // 3. Verify Important-Action Filters
  const actionRow = page.locator("div[class*='actionFiltersRow']");
  for (const act of EXPECTED_ACTIONS) {
    await actionRow.getByRole("button", { name: act, exact: true }).waitFor();
  }
  console.log("PASS All 5 Important-Action filter pills verified");

  // 4. Verify Search & Filter Toolbar
  await page.getByText("Tìm yêu cầu").waitFor();
  await page.getByText("Toàn bộ thao tác").waitFor();
  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).waitFor();
  await page.getByRole("button", { name: "Đặt lại", exact: true }).waitFor();
  console.log("PASS Search & Filter controls rendered");

  // 5. Verify dynamic result count
  const countElement = page.locator("span[class*='resultCountBold']");
  await countElement.waitFor();
  const countText = await countElement.innerText();
  console.log(`Live Returns Count: '${countText}'`);
  assert.match(countText, /\d+\s+Yêu cầu/, "Result count must match format '{N} Yêu cầu'");

  // 6. Verify table column headers in exact order
  const headers = page.locator("table[class*='returnsTable'] th");
  const colCount = await headers.count();
  assert.equal(colCount, 9, `Expected 9 table column headers, got ${colCount}`);

  for (let i = 0; i < EXPECTED_COLUMNS.length; i++) {
    const text = await headers.nth(i).innerText();
    assert.ok(
      text.includes(EXPECTED_COLUMNS[i]),
      `Header ${i + 1} mismatch: expected '${EXPECTED_COLUMNS[i]}', got '${text.trim()}'`,
    );
  }
  console.log("PASS All 9 table column headers verified in exact order");

  // 7. Verify live return records from backend simulator
  const requestHeaders = page.locator("tr[class*='requestHeaderRow']");
  const count = await requestHeaders.count();
  console.log(`Loaded ${count} dispute/refund records from backend simulator.`);
  assert.ok(count > 0, "Expected at least 1 return request loaded from simulator");

  // Verify first record metadata (buyer name, order SN, copy button)
  const firstHeader = requestHeaders.first();
  await firstHeader.locator("button[class*='btnCopy']").waitFor();
  const orderSnText = await firstHeader.locator("span[class*='orderSnVal']").innerText();
  assert.ok(orderSnText.length >= 5, "Order SN present in record header");
  console.log(`PASS First request header verified for order: ${orderSnText}`);

  // Verify first record refund amount formatted in VND
  const firstRefund = await page.locator("span[class*='refundAmount']").first().innerText();
  assert.ok(firstRefund.includes("₫"), "Refund amount formatted in VND (₫)");
  console.log(`PASS Live refund amount verified: ${firstRefund}`);

  // 8. Test Search by Order SN / Return SN
  const searchInput = page.locator("input[class*='searchInput']");
  await searchInput.fill(orderSnText);
  await page.locator("button[class*='btnSearch']").click();

  const searchCount = await page.locator("tr[class*='requestHeaderRow']").count();
  assert.equal(searchCount, 1, `Search by exact order SN should yield 1 record, got ${searchCount}`);
  console.log("PASS Search by order SN successfully filtered return requests");

  // Reset filter
  await page.locator("button[class*='btnReset']").click();
  const resetCount = await page.locator("tr[class*='requestHeaderRow']").count();
  assert.equal(resetCount, count, "Reset filter restores original returns count");
  console.log("PASS Reset filter restores full returns list");

  // 9. Test CSV Export download
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloadPromise;
  assert.ok(download.suggestedFilename().endsWith(".csv"), "Export should trigger CSV download");
  console.log(`PASS CSV Export successful: ${download.suggestedFilename()}`);

  assert.equal(errors.length, 0, `Page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL RETURNS & DISPUTES SPECIFICATION TESTS PASSED (100%)!");
} finally {
  await browser.close();
}
