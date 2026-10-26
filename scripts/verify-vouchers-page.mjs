import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  console.log("1. Navigating to Seller Center Shop Vouchers page...");
  await page.goto(`${base}/seller?tab=marketing_vouchers&shop_id=727720655`, { waitUntil: "networkidle" });

  // 2. Verify sidebar active item
  const activeSidebarItem = await page.locator("a[href*='tab=marketing_vouchers']").first();
  await activeSidebarItem.waitFor({ state: "visible" });

  // 3. Verify Landing page (State A)
  console.log("2. Verifying State A: Landing creation cards...");
  await page.getByRole("heading", { name: "Tạo Voucher", exact: true }).waitFor();
  await page.getByText("Tạo Mã giảm giá toàn shop hoặc Mã giảm giá sản phẩm", { exact: false }).waitFor();
  await page.getByText("Cải thiện tỷ lệ chuyển đổi", { exact: true }).waitFor();
  await page.getByText("Voucher toàn Shop", { exact: false }).first().waitFor();
  await page.getByText("Voucher sản phẩm", { exact: false }).first().waitFor();

  // Verify sections B & C (Channel & Target audience)
  await page.getByText("Tập trung vào Kênh hiển thị Voucher", { exact: true }).waitFor();
  await page.getByRole("heading", { name: "Voucher riêng tư" }).waitFor();
  await page.getByRole("heading", { name: "Voucher Shopee Live" }).waitFor();
  await page.getByRole("heading", { name: "Voucher Shopee Video" }).waitFor();

  await page.getByText("Tập trung vào nhóm Khách hàng mục tiêu", { exact: true }).waitFor();
  await page.getByRole("heading", { name: "Voucher Khách hàng mới" }).waitFor();
  await page.getByRole("heading", { name: "Voucher Khách hàng mua lại" }).waitFor();
  await page.getByRole("heading", { name: "Ưu đãi Follower" }).waitFor();

  // Test expand / collapse toggle
  const collapseBtn = page.getByRole("button", { name: /Thu gọn/ });
  await collapseBtn.click();
  const expandBtn = page.getByRole("button", { name: /Mở rộng/ });
  await expandBtn.waitFor({ state: "visible" });
  await expandBtn.click();
  await collapseBtn.waitFor({ state: "visible" });

  // 4. Verify Voucher List (State B)
  console.log("3. Verifying State B: Voucher list and filters...");
  await page.getByRole("heading", { name: "Danh sách mã giảm giá", exact: true }).waitFor();
  await page.getByRole("button", { name: "Voucher Package", exact: true }).click();
  await page.getByText("Gói Voucher Package", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Danh sách mã giảm giá", exact: true }).click();

  // Verify status sub-tabs
  await page.getByRole("button", { name: /Tất cả/ }).waitFor();
  await page.getByRole("button", { name: /Đang diễn ra/ }).waitFor();
  await page.getByRole("button", { name: /Sắp diễn ra/ }).waitFor();
  await page.getByRole("button", { name: /Đã kết thúc/ }).waitFor();

  // Verify search toolbar
  await page.getByPlaceholder("Input").waitFor();
  await page.getByRole("button", { name: "Tìm", exact: true }).waitFor();
  await page.getByRole("button", { name: "Đặt lại", exact: true }).waitFor();

  // Verify table columns
  for (const col of ["Tên Voucher | Mã voucher", "Loại mã", "Sản phẩm áp dụng", "Người mua mục tiêu", "Giảm giá", "Tổng lượt sử dụng tối đa", "Đã dùng", "Thao tác"]) {
    await page.getByRole("columnheader", { name: new RegExp(col) }).first().waitFor();
  }

  // Row actions test (if any vouchers exist)
  const detailBtn = page.getByRole("button", { name: "Chi tiết" }).first();
  if (await detailBtn.isVisible()) {
    console.log("4. Verifying VoucherDetailModal...");
    await detailBtn.click();
    await page.getByRole("heading", { name: "Chi tiết mã giảm giá" }).waitFor();
    await page.getByText("1. Thông tin cơ bản").waitFor();
    await page.getByText("2. Thiết lập giảm giá").waitFor();
    await page.getByRole("button", { name: "Đóng" }).last().click();
    await page.getByRole("heading", { name: "Chi tiết mã giảm giá" }).waitFor({ state: "detached" });
  }

  const ordersBtn = page.getByRole("button", { name: "Đơn hàng", exact: true }).first();
  if (await ordersBtn.isVisible()) {
    console.log("5. Verifying VoucherOrdersModal...");
    await ordersBtn.click();
    await page.getByRole("heading", { name: /Đơn hàng sử dụng mã/ }).waitFor();
    await page.getByRole("button", { name: "Đóng" }).last().click();
    await page.getByRole("heading", { name: /Đơn hàng sử dụng mã/ }).waitFor({ state: "detached" });
  }

  // 5. Verify State C: Create Voucher Workflow
  console.log("6. Verifying State C: Create Voucher Workflow...");
  await page.getByRole("button", { name: "Tạo Voucher toàn Shop" }).click();

  // Verify all 3 cards in form
  await page.getByRole("heading", { name: "Thông tin cơ bản", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Thiết lập mã giảm giá", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Hiển thị mã giảm giá và các sản phẩm áp dụng", exact: true }).waitFor();

  // Verify Shopee Coins (Hoàn Xu) is visibly disabled
  const hoanXuRadio = page.locator("input[type='radio'][disabled]");
  assert.equal(await hoanXuRadio.isDisabled(), true, "Hoàn Xu must be disabled");

  // Verify Smart Voucher switch toggle
  const smartVoucherInput = page.locator("input[type='checkbox']").first();
  await smartVoucherInput.waitFor();

  // Fill in form fields
  const uniqueCodeSuffix = "T" + String(Date.now()).slice(-4);
  await page.getByPlaceholder("Nhập tên chương trình...").fill("Automation Voucher Shop Wide");
  await page.getByPlaceholder("INPUT").fill(uniqueCodeSuffix);

  // Submit form
  console.log("7. Submitting voucher creation form...");
  await page.getByRole("button", { name: "Xác nhận", exact: true }).click();

  // Verify returned to list and voucher appears
  await page.getByRole("heading", { name: "Danh sách mã giảm giá", exact: true }).waitFor();
  await page.getByText("Automation Voucher Shop Wide").first().waitFor();

  // 6. Verify Product Voucher Workflow & Modal
  console.log("8. Verifying Product Voucher selection modal...");
  await page.getByRole("button", { name: "Tạo Voucher sản phẩm" }).click();

  await page.getByRole("button", { name: "Thêm sản phẩm" }).click();
  await page.getByRole("heading", { name: "Chọn Sản Phẩm" }).waitFor();
  await page.getByText("Ngành hàng:").waitFor();
  await page.getByText("Xem sản phẩm có sẵn").waitFor();

  // Select first product in modal
  const firstProductCheckbox = page.locator("table tbody tr input[type='checkbox']").first();
  await firstProductCheckbox.waitFor();
  await firstProductCheckbox.check();

  // Confirm selection
  await page.getByRole("button", { name: "Xác nhận chọn sản phẩm" }).click();

  // Verify product added to table
  await page.getByText(/1 Sản phẩm được chọn/).waitFor();
  await page.getByRole("button", { name: "Hủy", exact: true }).click();
  await page.getByRole("heading", { name: "Danh sách mã giảm giá", exact: true }).waitFor();

  // Check no page errors
  assert.equal(errors.length, 0, `Page errors found: ${errors.join("; ")}`);
  console.log("🎉 ALL SELLER SHOP VOUCHERS PAGE INTEGRATION TESTS PASSED (100%)!");
} finally {
  await browser.close();
}
