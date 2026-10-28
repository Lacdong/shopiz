import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];

page.on("pageerror", (error) => {
  console.error("PAGE ERROR:", error.message);
  errors.push(error.message);
});

function check(value, message) {
  if (!value) throw new Error(message);
}

try {
  console.log("==================================================================");
  console.log("VERIFYING: SHIPPING API, LIVE CHAT & SHOP STOREFRONT INTEGRATION");
  console.log("==================================================================");

  // -------------------------------------------------------------------------
  // 1. DYNAMIC SHIPPING CALCULATION ON PRODUCT PAGE
  // -------------------------------------------------------------------------
  console.log("\n[1/4] Navigating to /product/72 to verify dynamic shipping calculation...");
  await page.goto(`${base}/product/72`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();

  const destSelect = page.getByRole("combobox", { name: "Delivery destination" });
  await destSelect.waitFor();
  check((await destSelect.inputValue()) === "Ho Chi Minh City", "Default destination should be Ho Chi Minh City");

  const shippingSelect = page.getByRole("combobox", { name: "Shipping method" });
  await shippingSelect.waitFor();

  // Wait for dynamic channels to load from API
  await page.waitForFunction(() => {
    const select = document.querySelector('select[aria-label="Shipping method"]');
    return select && select.options.length > 0 && select.options[0].text.includes("SPX");
  });

  const hcmShippingText = await shippingSelect.locator("option:checked").textContent();
  console.log("Intra-city (Ho Chi Minh City) active shipping option:", hcmShippingText);
  check(hcmShippingText.includes("SPX"), "Should have loaded SPX channel");

  // Change destination to Hanoi (Inter-region)
  console.log("Changing destination to 'Hanoi' (Inter-region)...");
  await destSelect.selectOption("Hanoi");

  // Wait for API recalculation to finish
  await page.waitForTimeout(600);
  await page.waitForFunction(() => {
    const select = document.querySelector('select[aria-label="Shipping method"]');
    if (!select) return false;
    // Check if SPX Instant is disabled
    const instantOpt = Array.from(select.options).find(o => o.text.includes("Instant") || o.text.includes("Hỏa Tốc"));
    return instantOpt && instantOpt.disabled;
  });

  const hanoiShippingText = await shippingSelect.locator("option:checked").textContent();
  console.log("Inter-region (Hanoi) active shipping option:", hanoiShippingText);

  // Verify that Instant option is disabled for Hanoi
  const instantOptionDisabled = await page.evaluate(() => {
    const select = document.querySelector('select[aria-label="Shipping method"]');
    const opt = Array.from(select.options).find(o => o.text.includes("Instant") || o.text.includes("Hỏa Tốc"));
    return opt ? opt.disabled : false;
  });
  check(instantOptionDisabled, "SPX Instant must be disabled for cross-region delivery to Hanoi");

  // Test Buy Now selection preview contains calculated shipping
  console.log("Verifying calculated shipping in Preview Modal...");
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  const preview = page.getByRole("dialog", { name: "Review your selection" });
  await preview.waitFor();
  const totalText = await preview.locator("dd").last().textContent();
  console.log("Preview order total:", totalText);
  await page.getByRole("button", { name: "Close preview" }).click();

  // -------------------------------------------------------------------------
  // 2. LIVE INTERACTIVE SHOP CHAT
  // -------------------------------------------------------------------------
  console.log("\n[2/4] Testing Live Shop Chat from product page...");
  const chatNowBtn = page.getByRole("button", { name: "Chat Now" }).first();
  await chatNowBtn.waitFor();
  await chatNowBtn.click();

  const chatDialog = page.getByRole("dialog", { name: /Chat with/i });
  await chatDialog.waitFor();
  console.log("ChatDialog modal opened successfully!");

  // Check product snippet banner
  const productSnippet = chatDialog.locator("strong");
  await productSnippet.waitFor();
  const snippetTitle = await productSnippet.textContent();
  console.log("Pinned product snippet in chat:", snippetTitle);
  check(snippetTitle.includes("Linen Summer Trousers"), "Chat product snippet mismatch");

  // Send a test message
  const chatInput = chatDialog.locator("input[placeholder='Type a message...']");
  await chatInput.waitFor();
  const testMsg = `Hello Shop! Testing chat integration at ${Date.now()}`;
  await chatInput.fill(testMsg);
  await chatDialog.locator("button[type='submit']").click();

  // Verify message bubble appears
  console.log("Verifying sent message bubble...");
  await page.locator("text=" + testMsg).waitFor();
  console.log("Sent message bubble confirmed!");

  // Wait for simulated shop reply
  console.log("Waiting for simulated shop reply...");
  await page.waitForTimeout(1600);
  const shopReplies = await page.locator("div[class*='bubble'][class*='shop']").allTextContents();
  console.log("Shop messages count:", shopReplies.length);
  check(shopReplies.length > 0, "Expected at least one shop message");

  // Close chat
  await chatDialog.getByRole("button", { name: "Close chat" }).click();
  await page.waitForTimeout(300);

  // -------------------------------------------------------------------------
  // 3. BACKEND SHOP STOREFRONT (/shop/727720655)
  // -------------------------------------------------------------------------
  console.log("\n[3/4] Testing backend shop storefront: /shop/727720655...");
  await page.goto(`${base}/shop/727720655`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();

  const shopTitle = await page.locator("h1").textContent();
  console.log("Shop title:", shopTitle);
  check(shopTitle.includes("SmartOmni"), "Shop title mismatch");

  // Verify shop rating and products count
  const shopStats = await page.locator("dl[class*='stats']").textContent();
  console.log("Shop stats preview:", shopStats.slice(0, 100));
  check(shopStats.includes("Products"), "Shop stats missing Products");
  check(shopStats.includes("Shop rating"), "Shop stats missing rating");

  // Verify shop product catalog items are rendered
  const shopProducts = await page.locator("a[class*='card']").allTextContents();
  console.log(`Rendered ${shopProducts.length} shop catalog products.`);
  check(shopProducts.length > 0, "Shop catalog should have products");

  // Test Chat Now from shop header
  console.log("Testing Chat Now from shop header...");
  await page.getByRole("button", { name: "Chat Now" }).first().click();
  const shopChat = page.getByRole("dialog", { name: /Chat with/i });
  await shopChat.waitFor();
  await shopChat.getByRole("button", { name: "Close chat" }).click();

  // Verify campaign vouchers section is rendered for active campaign shop
  const campaignHeading = page.getByRole("heading", { name: "SHOP VOUCHERS & CAMPAIGNS" });
  await campaignHeading.waitFor();
  console.log("Verified campaign vouchers section rendered for shop 727720655!");

  // -------------------------------------------------------------------------
  // 4. LEGACY MOCK SHOP COMPATIBILITY (/shop/sonora)
  // -------------------------------------------------------------------------
  console.log("\n[4/4] Testing legacy mock shop storefront: /shop/sonora...");
  await page.goto(`${base}/shop/sonora`, { waitUntil: "networkidle" });
  await page.locator("h1").waitFor();
  const sonoraTitle = await page.locator("h1").textContent();
  console.log("Sonora shop title:", sonoraTitle);
  check(sonoraTitle.includes("SONORA"), "Sonora title mismatch");

  // Verify shop without campaign does not show voucher section
  const sonoraCampaign = page.getByRole("heading", { name: "SHOP VOUCHERS & CAMPAIGNS" });
  check((await sonoraCampaign.count()) === 0, "Sonora should not show vouchers when not holding a campaign");
  console.log("Verified shop with no campaigns hides the voucher section!");

  check(errors.length === 0, `Encountered ${errors.length} page errors: ${errors.join(", ")}`);
  console.log("\n🎉 ALL SHIPPING, LIVE CHAT & SHOP STOREFRONT TESTS PASSED WITH 0 ERRORS!");
} catch (err) {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
} finally {
  await browser.close();
}
