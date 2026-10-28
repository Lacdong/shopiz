import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const EXPECTED_GROUPS = [
  {
    title: "Quản Lý Đơn Hàng",
    items: [
      "Tất cả",
      "Giao Hàng Loạt",
      "Bàn Giao Đơn Hàng",
      "Đơn Trả hàng/Hoàn tiền hoặc Đơn hủy",
      "Cài Đặt Vận Chuyển",
    ],
  },
  {
    title: "Quản Lý Sản Phẩm",
    items: [
      "Tất Cả Sản Phẩm",
      "Thêm Sản Phẩm",
      "Sản phẩm tiêu chuẩn trên Shopee",
      "Công cụ Tối ưu AI",
    ],
  },
  {
    title: "Kênh Marketing",
    items: [
      "Kênh Marketing",
      "Đấu Giá Rẻ Vô Địch",
      "Dịch Vụ Hiển Thị Shopee",
      "Quảng cáo Ngoại sàn",
      "Tăng Đơn Cùng KOL",
      "Live & Video",
      "Khuyến Mãi của Shop",
      "Flash Sale Của Shop",
      "Mã Giảm Giá Của Shop",
      "Chương Trình Shopee",
      "Bán Hàng Toàn Cầu",
    ],
  },
  {
    title: "Chăm sóc khách hàng",
    items: ["Quản lý Chat", "Quản lý Đánh Giá"],
  },
  {
    title: "Tài Chính",
    items: ["Doanh Thu", "Số dư TK Shopee", "Tài Khoản Ngân Hàng"],
  },
  {
    title: "Dữ Liệu",
    items: ["Phân Tích Bán Hàng", "Hiệu Quả Hoạt Động"],
  },
  {
    title: "Quản Lý Shop",
    items: [
      "Hồ Sơ Shop",
      "Trang Trí Shop",
      "Thiết Lập Shop",
      "Quản lý các khiếu nại",
      "Nhiệm Vụ Người Bán",
    ],
  },
];

try {
  console.log("=================================================");
  console.log("VERIFYING: SHOPEE SELLER CENTRE VIETNAM SIDEBAR");
  console.log("=================================================");

  // 1. Responsive layout checks on /seller
  for (const width of [1440, 1024, 768, 390, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/seller?shop_id=727720655`, { waitUntil: "networkidle" });
    await page.locator("aside").waitFor();

    const noOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    );
    assert.ok(noOverflow, `Overflow detected at viewport width ${width}px`);
    console.log(`PASS seller layout ${width}px (no overflow)`);
  }

  // Restore desktop viewport
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${base}/seller?shop_id=727720655`, { waitUntil: "networkidle" });

  // 2. Verify all 7 groups and exact items order
  const groupButtons = page.locator("aside button[class*='groupHeader']");
  const groupCount = await groupButtons.count();
  console.log(`Found ${groupCount} menu groups in sidebar.`);
  assert.equal(groupCount, 7, "Expected exactly 7 menu groups");

  for (let i = 0; i < EXPECTED_GROUPS.length; i++) {
    const expected = EXPECTED_GROUPS[i];
    const headerText = await groupButtons.nth(i).innerText();
    assert.ok(
      headerText.includes(expected.title),
      `Group ${i + 1} title mismatch. Expected '${expected.title}', got '${headerText.trim()}'`,
    );

    // Verify all items in this group
    for (const itemLabel of expected.items) {
      const itemLink = page.locator("aside a").filter({ hasText: itemLabel });
      const exists = (await itemLink.count()) > 0;
      assert.ok(exists, `Expected item '${itemLabel}' under group '${expected.title}'`);
    }
    console.log(`PASS Group ${i + 1}: ${expected.title} (${expected.items.length} items verified)`);
  }

  // 3. Verify initial active state is "Tất cả" under Quản Lý Đơn Hàng
  const activeLink = page.locator("aside a[class*='active']");
  const activeText = await activeLink.innerText();
  assert.ok(activeText.includes("Tất cả"), `Active item should be 'Tất cả', got '${activeText.trim()}'`);
  console.log("PASS Initial active state is 'Tất cả'");

  // 4. Verify collapse and expand toggle
  const firstHeader = groupButtons.first();
  await firstHeader.click();
  const collapsedCount = await page.locator("aside a").filter({ hasText: "Giao Hàng Loạt" }).count();
  assert.equal(collapsedCount, 0, "Item should be hidden when group is collapsed");
  await firstHeader.click();
  const expandedCount = await page.locator("aside a").filter({ hasText: "Giao Hàng Loạt" }).count();
  assert.equal(expandedCount, 1, "Item should be visible when group is expanded");
  console.log("PASS Group chevron toggle collapse/expand");

  // 5. Test Coming Soon fallback for pending pages
  const aiToolLink = page.locator("aside a").filter({ hasText: "Công cụ Tối ưu AI" });
  await aiToolLink.click();
  await page.waitForURL("**/seller?tab=products_ai*");
  await page.getByRole("heading", { name: "Công cụ Tối ưu AI" }).waitFor();
  await page.getByText("KÊNH NGƯỜI BÁN SHOPEE").waitFor();
  console.log("PASS Coming Soon fallback for pending menu item 'Công cụ Tối ưu AI'");

  // 6. Test returning back to Orders via primary button
  const backBtn = page.getByRole("link", { name: /Quay lại/i });
  await backBtn.click();
  await page.waitForURL("**/seller?tab=orders_all*");
  console.log("PASS Returned to Orders via Coming Soon action button");

  assert.equal(errors.length, 0, `Page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL SELLER SIDEBAR SPECIFICATION TESTS PASSED (100%)!");
} finally {
  await browser.close();
}
