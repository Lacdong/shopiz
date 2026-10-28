import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
let holiday = false;
let uploadFails = true;
let saveFails = true;
let createRequests = 0;
let submittedPayload;
page.on("pageerror", (error) => errors.push(error.message));

const categories = [
  { category_id: 10, parent_category_id: 0, category_name: "Điện tử", has_children: true, attributes: [] },
  { category_id: 11, parent_category_id: 10, category_name: "Tai nghe", has_children: false, attributes: [
    { attribute_id: 101, name: "Thương hiệu", is_mandatory: true, input_type: "DROP_DOWN", values: [{ value_id: 1, original_value_name: "No Brand" }, { value_id: 2, original_value_name: "Brand One" }] },
    { attribute_id: 102, name: "Màu sắc", is_mandatory: false, input_type: "MULTI_SELECT", values: [{ value_id: 3, original_value_name: "Đen" }, { value_id: 4, original_value_name: "Trắng" }] }
  ] },
  { category_id: 12, parent_category_id: 10, category_name: "Loa", has_children: false, attributes: [
    { attribute_id: 201, name: "Loại loa", is_mandatory: true, input_type: "TEXT_FILED", values: [] }
  ] }
];

try {
  await page.route("**/api/v2/simulator/categories", (route) => route.fulfill({ json: { error: "", response: { categories } } }));
  await page.route("**/api/v2/simulator/product-creation/config?**", (route) => route.fulfill({
    json: { error: "", response: {
      shop_id: 727720655,
      is_vacation: holiday,
      shipping_options: [
        { option_id: "pickup_point", option_name: "Điểm nhận hàng", option_group: "Lấy hàng chủ động", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: 10000 },
        { option_id: "viettel_smartbox", option_name: "Tủ nhận hàng - Viettel Smartbox", option_group: "Lấy hàng chủ động", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: 10000 },
        { option_id: "same_day_express", option_name: "Hỏa Tốc", option_group: "2. Hỏa Tốc", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: null },
        { option_id: "same_day_delivery", option_name: "Trong Ngày", option_group: "3. Trong Ngày", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: null },
        { option_id: "fast_delivery", option_name: "Nhanh", option_group: "4. Nhanh", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: null },
        { option_id: "bulky_goods", option_name: "Hàng Cồng Kềnh", option_group: "5. Hàng Cồng Kềnh", partner_label: "ĐỐI TÁC SHOPEE", maximum_weight_gram: null }
      ],
      product_conditions: [{ value: "NEW", label: "Mới" }]
    } }
  }));
  await page.route("**/api/v2/simulator/media/upload", async (route) => {
    if (uploadFails) return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "error_server", message: "Upload unavailable" }) });
    return route.fulfill({ json: { error: "", response: { url: "https://media.test/image.jpg", file_id: "image-1" } } });
  });
  await page.route("**/api/v2/simulator/product/create", async (route) => {
    createRequests += 1;
    submittedPayload = route.request().postDataJSON();
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (saveFails) return route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "error_server", message: "Save unavailable" }) });
    return route.fulfill({ json: { error: "", response: { item_id: 991, item_status: submittedPayload.item_status } } });
  });

  await page.goto(`${base}/seller?tab=products_all&shop_id=727720655`);
  await page.getByRole("button", { name: /Thêm 1 sản phẩm mới/ }).click();
  await page.getByRole("heading", { name: "Thêm 1 sản phẩm mới" }).waitFor();
  assert.equal(await page.getByText(/tự động tìm Sản phẩm tiêu chuẩn/).count(), 0, "The page does not claim unsupported catalog matching");

  await page.getByPlaceholder(/Tên thương hiệu/).fill("Tai nghe thử nghiệm");
  const imageInput = page.locator("input[type=file]").first();
  const testImage = { name: "product.jpg", mimeType: "image/jpeg", buffer: Buffer.from("test image") };
  await imageInput.setInputFiles(testImage);
  await page.getByText("Upload unavailable").waitFor();
  uploadFails = false;
  await imageInput.setInputFiles(testImage);
  await page.locator("img[alt='product.jpg']").waitFor();
  await page.getByRole("button", { name: "Tiếp theo" }).click();
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).waitFor();
  assert.equal(await page.getByLabel("Tên sản phẩm", { exact: true }).count(), 1, "All section panels remain mounted in one scrollable editor");
  await page.getByTestId("section-viewport").evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await page.waitForFunction(() => document.querySelector('[role="tab"][aria-selected="true"]')?.textContent?.includes("Thông tin khác"));
  assert.equal(await page.getByRole("tab", { name: "Thông tin khác" }).getAttribute("aria-selected"), "true", "Scrolling the panel updates the active horizontal navigation tab");
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).click();

  await page.getByRole("checkbox", { name: "Hình ảnh tỷ lệ 3:4" }).check();
  await page.getByLabel("Cấp ngành hàng 1").selectOption("10");
  await page.getByLabel("Cấp ngành hàng 2").selectOption("11");
  await page.getByRole("tab", { name: "Thông tin chi tiết" }).click();
  await page.getByLabel("Thương hiệu").selectOption("2");
  await page.getByRole("tab", { name: "Vận chuyển" }).click();
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).click();
  assert.equal(await page.getByLabel("Tên sản phẩm", { exact: true }).inputValue(), "Tai nghe thử nghiệm", "Form values remain when switching sections");

  await page.getByLabel("Cấp ngành hàng 2").selectOption("12");
  await page.getByRole("tab", { name: "Thông tin chi tiết" }).click();
  assert.equal(await page.getByLabel("Loại loa").inputValue(), "", "Changing category replaces the category-specific attribute fields");
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).click();
  await page.getByLabel("Cấp ngành hàng 2").selectOption("11");
  await page.getByRole("tab", { name: "Thông tin chi tiết" }).click();
  await page.getByLabel("Thương hiệu").selectOption("2");
  await page.getByRole("tab", { name: "Mô tả" }).click();
  await page.getByLabel("Mô tả sản phẩm").fill("Mô tả sản phẩm kiểm thử.");
  await page.getByRole("tab", { name: "Thông tin bán hàng" }).click();
  await page.getByLabel("Giá", { exact: true }).fill("250000");
  await page.getByLabel("Kho hàng", { exact: true }).fill("7");
  await page.getByRole("button", { name: "Thêm nhóm phân loại" }).click();
  await page.getByLabel("Tên nhóm phân loại").fill("Màu sắc");
  await page.getByLabel("Giá trị nhóm phân loại").fill("Đen, Trắng");
  await page.getByLabel("Giá trị nhóm phân loại").fill("Đen, Trắng,");
  assert.equal(await page.getByLabel("Giá trị nhóm phân loại").inputValue(), "Đen, Trắng,", "Comma remains editable as a value separator");
  await page.getByLabel("Giá trị nhóm phân loại").fill("Đen, Trắng");
  for (const [name, values] of [["Số lượng", "10, 20"]]) {
    await page.getByRole("button", { name: "Thêm nhóm phân loại" }).click();
    const names = page.getByLabel("Tên nhóm phân loại");
    const valuesInputs = page.getByLabel("Giá trị nhóm phân loại");
    await names.nth(await names.count() - 1).fill(name);
    await valuesInputs.nth(await valuesInputs.count() - 1).fill(values);
  }
  assert.equal(await page.getByLabel("Tên nhóm phân loại").count(), 2, "At most two variation groups can be entered");
  await page.getByRole("tab", { name: "Vận chuyển" }).click();
  await page.getByLabel("Cân nặng sau khi đóng gói").fill("900");
  await page.getByRole("tab", { name: "Thông tin khác" }).click();
  await page.getByLabel("SKU sản phẩm").fill("SHOPIZ-TEST-1");
  await page.getByRole("tab", { name: "Vận chuyển" }).click();
  await page.getByText("Tôi sẽ gửi hàng trong 2 ngày (không bao gồm các ngày nghỉ lễ, Tết và những ngày đơn vị vận chuyển không làm việc)").waitFor();
  await page.getByLabel("Có", { exact: true }).check();
  await page.getByLabel("Số ngày chuẩn bị hàng").fill("7");
  await page.getByText("Tôi cần 7 ngày chuẩn bị hàng. Bạn có thể chọn từ 5 đến 15 ngày.").waitFor();
  await page.getByLabel("Không", { exact: true }).check();
  await page.getByRole("checkbox", { name: /Hỏa Tốc/ }).check();
  await page.getByRole("checkbox", { name: /Tôi đồng ý/ }).check();
  if (process.env.PRODUCT_EDITOR_SCREENSHOT) {
    await page.getByRole("tab", { name: "Vận chuyển" }).click();
    await page.screenshot({ path: process.env.PRODUCT_EDITOR_SCREENSHOT, fullPage: true });
  }

  await page.getByRole("checkbox", { name: /Hỏa Tốc/ }).uncheck();
  await page.getByRole("button", { name: "Đăng sản phẩm" }).click();
  await page.getByText("Chọn ít nhất một phương thức vận chuyển.").waitFor();
  await page.getByRole("checkbox", { name: /Điểm nhận hàng/ }).check();
  await page.getByRole("checkbox", { name: /Hỏa Tốc/ }).check();
  await page.getByRole("tab", { name: "Thông tin bán hàng" }).click();
  await page.getByRole("button", { name: "Đăng sản phẩm" }).click();
  const savingButton = page.getByRole("button", { name: "Đang lưu..." }).first();
  await savingButton.waitFor();
  assert.equal(await savingButton.isDisabled(), true, "Save buttons are disabled while one submission is pending");
  await page.getByText("Save unavailable").waitFor();
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).click();
  assert.equal(await page.getByLabel("Tên sản phẩm", { exact: true }).inputValue(), "Tai nghe thử nghiệm", "Save errors preserve form values");
  assert.equal(submittedPayload.item_status, "NORMAL", "Active-shop listing action submits NORMAL status");
  assert.equal(submittedPayload.category_id, 11, "Category ID is submitted instead of the display path");
  assert.deepEqual(submittedPayload.shipping_option_ids, ["pickup_point", "same_day_express"], "Selected shipping methods are submitted");
  assert.equal(submittedPayload.image_ratio, "3:4", "Image ratio is submitted");
  assert.equal(submittedPayload.models.length, 4, "Two variation groups generate their model combinations");
  assert.equal(submittedPayload.preorder_days_to_ship, null, "Non-preorder payload does not submit preparation days");
  assert.equal(submittedPayload.tier_variation.length, 2, "Two variation groups are sent to Layer B");

  saveFails = false;
  const beforeRetry = createRequests;
  await page.getByRole("button", { name: "Đăng sản phẩm" }).click();
  await page.getByRole("button", { name: /Thêm 1 sản phẩm mới/ }).waitFor();
  assert.equal(createRequests, beforeRetry + 1, "A retry submits one create request");

  holiday = true;
  await page.goto(`${base}/seller?tab=products_all&shop_id=727720655`);
  await page.getByRole("button", { name: /Thêm 1 sản phẩm mới/ }).click();
  assert.equal(await page.getByRole("button", { name: "Đăng sản phẩm" }).count(), 0, "Holiday mode hides the visible-listing action");
  assert.equal(await page.getByRole("button", { name: "Lưu & Ẩn" }).count(), 0, "Save actions appear only after the editor step");
  await page.getByPlaceholder(/Tên thương hiệu/).fill("Sản phẩm nghỉ lễ");
  await page.locator("input[type=file]").first().setInputFiles(testImage);
  await page.getByRole("button", { name: "Tiếp theo" }).click();
  await page.getByRole("tab", { name: "Thông tin cơ bản" }).waitFor();
  assert.equal(await page.getByRole("button", { name: "Đăng sản phẩm" }).count(), 0, "Holiday shop can only save unlisted");
  assert.equal(await page.getByRole("button", { name: "Lưu & Ẩn" }).count(), 1, "Holiday shop retains the hidden-save action");
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, "Mobile layout has no horizontal overflow");

  assert.deepEqual(errors, [], errors.join("\n"));
  console.log("PASS product creation flow: uploads, category attributes, tab state, variations, status actions, and error recovery");
} finally {
  await browser.close();
}
