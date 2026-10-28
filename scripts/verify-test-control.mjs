import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) => dialog.accept());

try {
  console.log("=== 1. Testing Route /test-control Direct Access ===");
  await page.goto(`${base}/test-control`, { waitUntil: "networkidle" });

  // Verify Header & Banner
  const title = page.locator("h1", { hasText: "Trung tâm Kiểm thử & Điều khiển Nền tảng" });
  await title.waitFor({ state: "visible", timeout: 8000 });
  console.log("✓ Test Control banner title found");

  const brand = page.locator("span", { hasText: "Shopiz Platform Console" });
  await brand.waitFor({ state: "visible" });
  console.log("✓ Brand header found");

  // Verify 4 KPI cards
  await page.locator("span", { hasText: "Khiếu nại Chờ Shopee Phán quyết" }).waitFor();
  await page.locator("span", { hasText: "Lịch sử Webhook Outbound" }).waitFor();
  await page.locator("span", { hasText: "Mô phỏng Lỗi Đang Kích hoạt" }).waitFor();
  await page.locator("span", { hasText: "Gian hàng Đã Liên kết" }).waitFor();
  console.log("✓ 4 KPI summary cards verified");

  console.log("=== 2. Testing Route /admin Direct Access ===");
  await page.goto(`${base}/admin`, { waitUntil: "networkidle" });
  await title.waitFor({ state: "visible" });
  console.log("✓ /admin route successfully loads Test Control page");

  console.log("=== 3. Testing Tab 1: Xử lý Khiếu nại & Trả hàng (ArbitrationTab) ===");
  const disputesTab = page.locator("button", { hasText: "Xử lý Khiếu nại & Trả hàng" });
  await disputesTab.click();

  // Check filter tabs
  const filterDispute = page.locator("button", { hasText: /Shop khiếu nại/ });
  await filterDispute.waitFor({ state: "visible" });
  await filterDispute.click();
  console.log("✓ Dispute status filter clicked");

  // Reset filter to Tất cả vụ án
  const filterAll = page.locator("button", { hasText: /Tất cả vụ án/ });
  await filterAll.click();

  // Check if any return request item has a "Chi tiết" button
  const detailBtn = page.locator("button", { hasText: "Chi tiết" }).first();
  if (await detailBtn.isVisible()) {
    await detailBtn.click();
    console.log("✓ Opened Return Detail Modal");
    const modalTitle = page.locator("h3", { hasText: /Hồ sơ Khiếu nại & Bằng chứng/ });
    await modalTitle.waitFor({ state: "visible" });

    // Close modal
    const closeBtn = page.locator("button", { hasText: "Đóng cửa sổ" });
    await closeBtn.click();
    console.log("✓ Closed Return Detail Modal");
  }

  console.log("=== 4. Testing Tab 2: Webhook Trực quan & Giám sát (WebhookTab) ===");
  const webhookTab = page.locator("button", { hasText: "Webhook Trực quan & Giám sát" });
  await webhookTab.click();

  // Verify Webhook controls
  await page.locator("h3", { hasText: /Cấu Hình Địa Chỉ Nhận Webhook/ }).waitFor();
  console.log("✓ Webhook target endpoint section visible");

  // Trigger manual webhook event
  const triggerBtn = page.locator("button", { hasText: "Bắn Thông Báo Webhook Này" });
  await triggerBtn.waitFor({ state: "visible" });
  await triggerBtn.click();

  // Wait for success toast
  const toast = page.locator("div", { hasText: /thành công/ }).first();
  await toast.waitFor({ state: "visible", timeout: 8000 });
  console.log("✓ Manual webhook event triggered & verified with toast");

  console.log("=== 5. Testing Tab 3: Mô phỏng Lỗi & Latency (FaultInjectionTab) ===");
  const faultTab = page.locator("button", { hasText: "Mô phỏng Lỗi & Latency" });
  await faultTab.click();

  await page.locator("h2", { hasText: /Bảng Điều Khiển Giả Lập Lỗi/ }).waitFor();

  // Click "Khôi phục chuẩn" to test reset
  const resetBtn = page.locator("button", { hasText: "Khôi phục chuẩn" });
  await resetBtn.waitFor({ state: "visible" });
  await resetBtn.click();

  const resetToast = page.locator("div", { hasText: /trạng thái bình thường/ }).first();
  await resetToast.waitFor({ state: "visible", timeout: 8000 });
  console.log("✓ Fault injection reset executed & verified with toast");

  console.log("=== 6. Testing Tab 4: Vòng đời Đơn hàng & SLA (OrderLifecycleTab) ===");
  const ordersTab = page.locator("button", { hasText: "Vòng đời Đơn hàng & SLA" });
  await ordersTab.click();

  await page.locator("div", { hasText: "Điều khiển Vòng đời Đơn hàng" }).first().waitFor();
  console.log("✓ Order lifecycle stepper and controller visible");

  // Test Mark Paid action
  const markPaidBtn = page.locator("button", { hasText: "1. Đánh dấu đã thanh toán" });
  if (await markPaidBtn.isVisible()) {
    await markPaidBtn.click();
    const paidToast = page.locator("div", { hasText: /Đã đánh dấu thanh toán thành công/ }).first();
    await paidToast.waitFor({ state: "visible", timeout: 8000 });
    console.log("✓ Advance Order Paid action executed & verified with toast");
  }

  // Test Expire Overdue SLA button
  const expireBtn = page.locator("button", { hasText: "Quét huỷ đơn quá hạn SLA" });
  await expireBtn.click();
  const expireToast = page.locator("div", { hasText: /Quét đơn quá hạn hoàn tất/ }).first();
  await expireToast.waitFor({ state: "visible", timeout: 8000 });
  console.log("✓ Expire Overdue SLA scanned & verified with toast");

  console.log("=== 7. Testing Tab 5: OAuth 2.0 & Quản lý Gian hàng (OAuthTab) ===");
  const oauthTab = page.locator("button", { hasText: "OAuth 2.0 & Quản lý Gian hàng" });
  await oauthTab.click();

  await page.locator("div", { hasText: "Tạo Đường dẫn Uỷ quyền OAuth 2.0" }).first().waitFor();
  console.log("✓ OAuth 2.0 URL Generator visible");

  // Check generated URL contains partner_id
  const urlBox = page.locator("div", { hasText: "partner_id=1001141" }).first();
  await urlBox.waitFor({ state: "visible" });
  console.log("✓ Generated OAuth 2.0 URL verified");

  // Check multi-shop table
  await page.locator("span", { hasText: "SmartOmni Official Flagship" }).waitFor();
  await page.locator("span", { hasText: "Hanoi Streetwear Co." }).waitFor();
  await page.locator("span", { hasText: "Saigon Modern Living" }).waitFor();
  console.log("✓ Multi-shop connected accounts verified in table");

  // Test Refresh Token button
  const refreshTokens = page.locator("button", { hasText: "Làm mới Token" }).first();
  await refreshTokens.click();
  const refreshToast = page.locator("div", { hasText: /Đã làm mới Token thành công/ }).first();
  await refreshToast.waitFor({ state: "visible", timeout: 8000 });
  console.log("✓ OAuth Token refresh executed & verified with toast");

  // Check navigation links from header and seller header
  console.log("=== 8. Testing Navigation Links Integration ===");
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  const homeTestControlLink = page.locator("a[href*='test-control']").first();
  await homeTestControlLink.waitFor({ state: "visible" });
  console.log("✓ Test Control link found on Shopiz Marketplace Utility Nav");

  await page.goto(`${base}/seller?tab=orders_all&shop_id=727720655`, { waitUntil: "networkidle" });
  const sellerTestControlLink = page.locator("a[href*='test-control']").first();
  await sellerTestControlLink.waitFor({ state: "visible" });
  console.log("✓ Test Control link found on Seller Center Header");

  assert.equal(errors.length, 0, `Encountered unexpected page errors: ${errors.join("; ")}`);
  console.log("\n🎉 ALL TEST CONTROL & ADMIN CONSOLE TESTS PASSED SUCCESSFULLY! 🎉\n");
} finally {
  await browser.close();
}
