import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto(`${base}/seller?tab=reviews&shop_id=727720655`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Đánh Giá Shop", exact: true }).waitFor();
  for (const label of ["Tổng lượt đánh giá", "Tỷ lệ đánh giá đơn hàng", "Tỷ lệ đánh giá tốt", "Danh sách đánh giá shop", "Trạng thái", "Số sao đánh giá"]) {
    await page.getByText(label, { exact: false }).first().waitFor();
  }
  for (const label of ["Tất cả", "Cần phản hồi", "Đã trả lời"]) {
    await page.getByRole("button", { name: new RegExp(label) }).waitFor();
  }
  await page.getByPlaceholder(/Tên Sản Phẩm, Mã Đơn Hàng/).fill("review-page-no-match");
  await page.getByRole("button", { name: "Tìm kiếm", exact: true }).click();
  await page.getByText("Chưa có đánh giá phù hợp với bộ lọc này.").waitFor();
  await page.getByRole("button", { name: "Đặt lại", exact: true }).click();
  await page.getByRole("checkbox", { name: /5 Sao/ }).waitFor();
  assert.equal(errors.length, 0, errors.join("; "));
  console.log("PASS Review dashboard, dynamic filters, empty state, and reset flow");
} finally {
  await browser.close();
}
