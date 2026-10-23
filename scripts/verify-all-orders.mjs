import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const EXPECTED_TABS = [
  "Tất cả",
  "Chờ xác nhận",
  "Chờ lấy hàng",
  "Đang giao",
  "Đã giao",
  "Trả hàng/Hoàn tiền/Hủy",
];

const EXPECTED_COLUMNS = [
  "Sản phẩm",
  "Tổng số tiền Người mua thanh toán",
  "Trạng thái",
  "Đếm ngược",
  "Đơn vị vận chuyển",
  "Thao tác",
];

try {
  console.log("=================================================");
  console.log("VERIFYING: 'TẤT CẢ' ALL ORDERS MANAGEMENT PAGE");
  console.log("=================================================");

  // 1. Navigate to /seller?tab=orders_all&shop_id=727720655
  await page.goto(`${base}/seller?tab=orders_all&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Tất cả", exact: true }).waitFor();
  console.log("PASS Page title 'Tất cả' rendered");

  // 2. Verify top action buttons
  await page.getByRole("button", { name: "Xuất", exact: true }).waitFor();
  await page.getByRole("button", { name: "Lịch sử Xuất Báo cáo" }).waitFor();
  console.log("PASS Action buttons 'Xuất' and 'Lịch sử Xuất Báo cáo' rendered");

  // 3. Verify all 6 status tabs in exact order
  const tabs = page.locator("div[role='tablist'] button[role='tab']");
  const tabCount = await tabs.count();
  assert.equal(tabCount, 6, `Expected 6 status tabs, got ${tabCount}`);

  for (let i = 0; i < EXPECTED_TABS.length; i++) {
    const text = await tabs.nth(i).innerText();
    assert.ok(
      text.includes(EXPECTED_TABS[i]),
      `Tab ${i + 1} mismatch: expected '${EXPECTED_TABS[i]}', got '${text.trim()}'`,
    );
  }
  console.log("PASS All 6 status tabs verified in exact order");

  // 4. Verify initial active tab is 'Tất cả'
  const activeTab = page.locator("button[role='tab'][class*='tabActive']");
  assert.ok((await activeTab.innerText()).includes("Tất cả"), "Initial active tab must be 'Tất cả'");
  console.log("PASS Initial selected tab is 'Tất cả'");

  // 5. Verify dynamic order count
  const countElement = page.locator("span[class*='countNumber']");
  await countElement.waitFor();
  const countText = await countElement.innerText();
  console.log(`Live Order Count: '${countText}'`);
  assert.match(countText, /\d+\s+Đơn hàng/, "Order count must be dynamic format '{N} Đơn hàng'");

  // 6. Verify table column headers in exact order
  const tableHeaders = page.locator("table[class*='ordersTable'] th");
  const colCount = await tableHeaders.count();
  assert.equal(colCount, 6, `Expected 6 table headers, got ${colCount}`);

  for (let i = 0; i < EXPECTED_COLUMNS.length; i++) {
    const headerText = await tableHeaders.nth(i).innerText();
    assert.ok(
      headerText.includes(EXPECTED_COLUMNS[i]),
      `Header ${i + 1} mismatch: expected '${EXPECTED_COLUMNS[i]}', got '${headerText.trim()}'`,
    );
  }
  console.log("PASS All 6 table columns verified in exact order");

  // 7. Verify live orders from backend simulator are populated
  const orderRows = page.locator("tr[class*='orderDataRow']");
  const rowCount = await orderRows.count();
  console.log(`Loaded ${rowCount} order records from backend simulator.`);
  assert.ok(rowCount > 0, "Expected at least 1 order loaded from live database");

  // Verify first order has currency formatted in VND
  const firstPayment = await orderRows.first().locator("td[class*='paymentCol']").innerText();
  assert.ok(firstPayment.includes("₫"), "Order payment total formatted in VND (₫)");
  console.log(`PASS Live order payment verified: ${firstPayment.split("\n")[0]}`);

  // 8. Test Search & Filter by order SN
  const firstOrderSnText = await page.locator("span[class*='orderSn']").first().innerText();
  const sampleSn = firstOrderSnText.replace("Mã đơn hàng:", "").trim();
  console.log(`Testing search for order SN: ${sampleSn}`);

  const searchInput = page.locator("input[class*='searchInput']");
  await searchInput.fill(sampleSn);
  await page.locator("button[class*='btnApply']").click();

  const searchCount = await page.locator("tr[class*='orderDataRow']").count();
  assert.equal(searchCount, 1, `Search by exact SN should return 1 order, got ${searchCount}`);
  console.log("PASS Search by order SN successfully filtered results");

  // Reset filter
  await page.locator("button[class*='btnReset']").click();
  const resetCount = await page.locator("tr[class*='orderDataRow']").count();
  assert.equal(resetCount, rowCount, "Reset filter restores original order count");
  console.log("PASS Reset filter restores full order list");

  // 9. Test Empty State message when filter matches nothing
  await searchInput.fill("NON_EXISTENT_ORDER_99999");
  await page.locator("button[class*='btnApply']").click();

  const emptyMsg = page.locator("p[class*='emptyMessage']");
  await emptyMsg.waitFor();
  const emptyText = await emptyMsg.innerText();
  assert.equal(
    emptyText,
    "Vui lòng Xuất báo cáo để xem các đơn hàng trước 24/10/2024.",
    "Empty state message matches specification",
  );
  console.log("PASS Empty state displayed with exact reference message");

  // Reset filter back
  await page.locator("button[class*='btnReset']").click();

  // 10. Test CSV Export download
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Xuất", exact: true }).click();
  const download = await downloadPromise;
  assert.ok(download.suggestedFilename().endsWith(".csv"), "Export should trigger CSV download");
  console.log(`PASS CSV Export successful: ${download.suggestedFilename()}`);

  // 11. Test Export History Dialog
  await page.getByRole("button", { name: "Lịch sử Xuất Báo cáo" }).click();
  await page.getByRole("heading", { name: "Lịch sử Xuất Báo cáo" }).waitFor();
  await page.locator("button[class*='modalClose']").click();
  console.log("PASS Export history modal opens and closes cleanly");

  assert.equal(errors.length, 0, `Page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL 'TẤT CẢ' ORDERS SPECIFICATION TESTS PASSED (100%)!");
} finally {
  await browser.close();
}
