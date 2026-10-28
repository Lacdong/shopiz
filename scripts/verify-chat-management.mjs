import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("dialog", (dialog) => dialog.accept());

try {
  console.log("1. Navigating to Seller Center Chat Management (?tab=chat)...");
  await page.goto(`${base}/seller?tab=chat&shop_id=727720655`, { waitUntil: "networkidle" });

  // 2. Verify sidebar active item
  console.log("2. Verifying active sidebar and breadcrumb...");
  const activeSidebarItem = page.locator("a[href*='tab=chat']").first();
  await activeSidebarItem.waitFor({ state: "visible" });
  await page.locator("strong").filter({ hasText: "Quản lý Chat" }).waitFor();

  // 3. Verify Chat Performance Card
  console.log("3. Verifying Chat Performance Summary Card...");
  await page.getByRole("heading", { name: "Quản lý Chat (Hiệu quả Chat)" }).waitFor();
  await page.getByText("Lượt chat", { exact: true }).waitFor();
  await page.getByText("Chat Response Rate", { exact: true }).waitFor();
  await page.getByText("Thời gian phản hồi", { exact: true }).waitFor();

  // Test "Xem thêm" link and modal
  const seeMoreBtn = page.getByRole("button", { name: /Xem thêm chi tiết/ });
  await seeMoreBtn.click();
  await page.getByRole("heading", { name: "Chi tiết Hiệu quả Vận hành Chat" }).waitFor();
  await page.getByLabel("Đóng", { exact: true }).click();

  // 4. Verify Trợ lý Chat (Chat Assistant) section
  console.log("4. Verifying Chat Assistant cards...");
  await page.getByRole("heading", { name: "Trợ lý Chat", exact: true }).waitFor();
  await page.getByRole("heading", { name: "Tin nhắn tự động" }).waitFor();
  await page.getByRole("heading", { name: "Tin nhắn nhanh" }).waitFor();
  await page.getByRole("heading", { name: "Hỏi - Đáp" }).waitFor();

  // Test FAQ modal
  const faqBtn = page.getByRole("button", { name: "Bắt đầu" }).nth(1);
  await faqBtn.click();
  await page.getByRole("heading", { name: "Thiết lập Câu hỏi thường gặp" }).waitFor();
  await page.getByRole("button", { name: "Đã hiểu", exact: true }).click();

  // 5. Test Navigation to "Tin nhắn tự động"
  console.log("5. Navigating to 'Tin nhắn tự động' (?tab=chat_auto_reply)...");
  const autoReplyBtn = page.getByRole("button", { name: "Bắt đầu" }).first();
  await autoReplyBtn.click();

  // Verify breadcrumb
  await page.locator("strong").filter({ hasText: "Tin nhắn tự động" }).waitFor({ state: "visible" });

  // Verify warning banner and dismissal
  await page.getByRole("alert").getByText("1. Trả lời tự động mặc định sẽ chỉ được kích hoạt").waitFor();
  const closeBannerBtn = page.getByRole("button", { name: "Đóng thông báo" });
  await closeBannerBtn.click();
  assert.equal(await page.getByRole("alert").count(), 0, "Warning banner dismissed");

  // Verify Standard message card and inline edit
  console.log("6. Testing standard auto-reply toggle and editor...");
  await page.getByRole("heading", { name: "Tin nhắn tự động tiêu chuẩn" }).waitFor();
  const standardSwitchLabel = page.locator("label[title='Bật/Tắt tin nhắn tự động tiêu chuẩn']");
  await standardSwitchLabel.click();

  // Edit message
  const editStandardBtn = page.getByRole("button", { name: "Chỉnh sửa tin nhắn tiêu chuẩn" });
  await editStandardBtn.click();
  const textarea = page.getByLabel("Nội dung tin nhắn tiêu chuẩn");
  await textarea.fill("Cảm ơn bạn đã nhắn tin cho shop SmartOmni. Chúng tôi sẽ phản hồi ngay!");
  await page.getByRole("button", { name: "Lưu", exact: true }).click();
  await page.getByText("Cảm ơn bạn đã nhắn tin cho shop SmartOmni. Chúng tôi sẽ phản hồi ngay!").waitFor();
  await standardSwitchLabel.click(); // toggle back to false (clean state)

  // 6. Test Navigation to "Tin nhắn nhanh"
  console.log("7. Navigating to 'Tin nhắn nhanh' (?tab=chat_quick_reply)...");
  await page.getByRole("main").getByRole("link", { name: "Quản lý Chat" }).click();
  await page.locator("strong").filter({ hasText: "Quản lý Chat" }).waitFor({ state: "visible" });

  const quickReplyBtn = page.locator("div").filter({ hasText: /^Tin nhắn nhanh/ }).getByRole("button", { name: "Chỉnh sửa" });
  await quickReplyBtn.click();

  // Verify breadcrumb
  await page.locator("strong").filter({ hasText: "Tin nhắn nhanh" }).waitFor({ state: "visible" });

  // Card 1: Visibility setting
  console.log("8. Verifying quick message visibility switch...");
  await page.getByRole("heading", { name: "Hiển thị dấu tin nhắn nhanh tự động" }).waitFor();
  const visSwitchLabel = page.locator("label[title='Bật/Tắt gợi ý tin nhắn nhanh']");
  await visSwitchLabel.click(); // toggle
  await visSwitchLabel.click(); // toggle back to true (clean state)

  // Card 2: Pre-seeded messages in "Nhóm Tin nhắn chung"
  console.log("9. Verifying 13 pre-seeded messages...");
  await page.getByRole("heading", { name: /Tin nhắn nhanh cá nhân/ }).waitFor();
  await page.getByText("Nhóm Tin nhắn chung", { exact: true }).waitFor();

  // Check sample exact Vietnamese messages from the 13 required
  await page.getByText("Sản phẩm có sẵn", { exact: true }).waitFor();
  await page.getByText("Cám ơn bạn!", { exact: true }).waitFor();
  await page.getByText("Sản phẩm này có thể áp dụng voucher giảm giá", { exact: true }).waitFor();
  await page.getByText("Hãy cung cấp mã vận đơn để Shop kiểm tra cho bạn nhé", { exact: true }).waitFor();

  // Test expand / collapse
  const collapseGroupBtn = page.getByRole("button", { name: "Thu gọn nhóm" }).first();
  await collapseGroupBtn.click();
  assert.equal(await page.getByText("Sản phẩm có sẵn", { exact: true }).isVisible(), false, "Collapsed messages list");
  const expandGroupBtn = page.getByRole("button", { name: "Mở rộng nhóm" }).first();
  await expandGroupBtn.click();
  await page.getByText("Sản phẩm có sẵn", { exact: true }).waitFor();

  // Test creating new quick message group
  console.log("10. Testing create quick message group modal...");
  const newGroupName = `Tư vấn vận chuyển ${Date.now().toString().slice(-4)}`;
  await page.getByRole("button", { name: "Tạo Tin nhắn nhanh" }).click();
  await page.getByRole("heading", { name: "Tạo Nhóm Tin Nhắn Nhanh" }).waitFor();
  await page.getByLabel("Tên nhóm tin nhắn *").fill(newGroupName);
  await page.getByLabel("Tin nhắn đầu tiên trong nhóm").fill("Đơn hàng sẽ được gửi cho đơn vị vận chuyển sớm nhất");
  await page.getByRole("button", { name: "Lưu nhóm" }).click();

  // Verify newly created group
  await page.getByText(newGroupName, { exact: true }).waitFor();
  await page.getByText(/Tin nhắn nhanh cá nhân \(\d+\/25\)/).waitFor();

  // Clean up: delete test group so it does not pollute seller dashboard
  const deleteBtn = page.getByRole("button", { name: `Xóa nhóm ${newGroupName}` });
  await deleteBtn.click();
  await page.getByText(newGroupName).waitFor({ state: "detached" });
  await page.getByText("Tin nhắn nhanh cá nhân (1/25)").waitFor();

  // 11. Test Right-Side Floating Seller Webchat Widget
  console.log("11. Testing Right-Side Floating Seller Webchat Widget...");
  const chatTrigger = page.getByRole("button", { name: "Mở cửa sổ Chat Người Bán" });
  await chatTrigger.waitFor({ state: "visible" });
  await chatTrigger.click();

  // Verify chat window is open
  const chatWindow = page.getByRole("region", { name: "Shopee Chat Kênh Người Bán" });
  await chatWindow.waitFor({ state: "visible" });
  await page.getByRole("heading", { name: "Shopee Chat" }).waitFor();

  // Verify conversation threads
  const buyerThread = page.locator("li[role='option']").first();
  await buyerThread.waitFor({ state: "visible" });

  // Verify quick reply shortcuts bar
  await page.getByTitle("Nhấp để chèn mẫu tin nhắn nhanh").waitFor();
  const quickPill = page.locator("button").filter({ hasText: "Sản phẩm có sẵn" }).first();
  if (await quickPill.isVisible()) {
    await quickPill.click();
  }

  // Type and send a message
  const chatInput = page.getByLabel("Nhập nội dung tin nhắn");
  const testMsg = `Chào bạn ${Date.now().toString().slice(-4)}, shop có thể hỗ trợ gì cho bạn?`;
  await chatInput.fill(testMsg);
  await page.getByRole("button", { name: "Gửi tin nhắn" }).click();

  // Verify outgoing message bubble
  await page.getByText(testMsg).waitFor();

  // Close chat window
  await page.getByRole("button", { name: "Đóng cửa sổ Chat" }).click();
  await chatTrigger.waitFor({ state: "visible" });

  assert.equal(errors.length, 0, `Browser errors detected: ${errors.join("; ")}`);
  console.log("\n🎉 ALL SELLER CHAT MANAGEMENT INTEGRATION TESTS PASSED (100%)!");
} catch (err) {
  console.error("Test execution failed:", err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
