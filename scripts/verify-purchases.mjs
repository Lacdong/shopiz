import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const status = () => page.getByRole("navigation", { name: "Order status" });
async function countOrders(expected) {
  await page.waitForFunction(
    (count) =>
      document.querySelectorAll('article[aria-label^="Order "]').length ===
      count,
    expected,
  );
  assert.equal(await page.getByRole("article").count(), expected);
}
try {
  await page.goto(base + "/cart");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("shopiz-demo-user", "user-001");
    localStorage.setItem(
      "shopiz-cart-v1",
      JSON.stringify([
        {
          productId: "1",
          variant: "Cloud",
          size: "",
          quantity: 2,
          selected: true,
        },
        {
          productId: "4",
          variant: "Classic",
          size: "EU 42",
          quantity: 1,
          selected: true,
        },
        {
          productId: "6",
          variant: "Original",
          size: "",
          quantity: 1,
          selected: false,
        },
      ]),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: "Checkout (3)", exact: true }).click();
  await page.waitForURL("**/checkout");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  const popup = page.getByRole("dialog", {
    name: "Order placed successfully",
    exact: true,
  });
  await popup.waitFor();
  await page.setViewportSize({ width: 375, height: 850 });
  const size = await popup.evaluate((el) => ({
    left: el.getBoundingClientRect().left,
    right: el.getBoundingClientRect().right,
    scroll: el.scrollWidth,
    width: el.clientWidth,
  }));
  assert.ok(
    size.left >= 0 && size.right <= 375 && size.scroll <= size.width,
    "Success popup fits phone",
  );
  await popup
    .getByRole("link", { name: "View My Purchases", exact: true })
    .click();
  await page.waitForURL("**/account/purchases");
  const orders = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("shopiz-demo-orders-v1")),
  );
  assert.equal(orders.length, 1);
  const id = orders[0].id;
  await page
    .getByRole("article", { name: `Order ${id}`, exact: true })
    .waitFor();
  await countOrders(4);
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Purchase page overflow at ${width}`,
    );
    await page
      .getByRole("article", { name: `Order ${id}`, exact: true })
      .getByRole("button", { name: "Order Details", exact: true })
      .click();
    const details = page.getByRole("dialog", {
      name: "Order Details",
      exact: true,
    });
    await details.getByText("$138.80", { exact: true }).last().waitFor();
    const b = await details.evaluate((el) => ({
      left: el.getBoundingClientRect().left,
      right: el.getBoundingClientRect().right,
      scroll: el.scrollWidth,
      width: el.clientWidth,
    }));
    assert.ok(
      b.left >= 0 && b.right <= width && b.scroll <= b.width,
      `Details dialog overflow ${width}`,
    );
    await page.keyboard.press("Escape");
    console.log(
      `PASS purchases and order details at ${width}px; no screenshots`,
    );
  }
  await status().getByRole("button", { name: "To Ship", exact: true }).click();
  await countOrders(1);
  await page.reload();
  await countOrders(1);
  await status()
    .getByRole("button", { name: "Completed", exact: true })
    .click();
  await countOrders(2);
  await status()
    .getByRole("button", { name: "Cancelled", exact: true })
    .click();
  await countOrders(1);
  await status().getByRole("button", { name: "To Pay", exact: true }).click();
  await page
    .getByRole("heading", { name: "No orders found", exact: true })
    .waitFor();
  await page
    .getByRole("button", { name: "View All Orders", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search orders", exact: true })
    .fill(id);
  await countOrders(1);
  await page.reload();
  await page
    .getByRole("article", { name: `Order ${id}`, exact: true })
    .waitFor();
  await page
    .getByRole("textbox", { name: "Search orders", exact: true })
    .fill("SONORA");
  await countOrders(1);
  await page
    .getByRole("textbox", { name: "Search orders", exact: true })
    .fill("Ceramic");
  await countOrders(1);
  await page
    .getByRole("textbox", { name: "Search orders", exact: true })
    .fill("no-such-order");
  await page
    .getByRole("heading", { name: "No orders found", exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  const actual = page.getByRole("article", {
    name: `Order ${id}`,
    exact: true,
  });
  const completed = page.getByRole("article", {
    name: "Order SAMPLE-1004",
    exact: true,
  });
  assert.equal(
    await actual
      .getByRole("button", { name: "Pending", exact: true })
      .isDisabled(),
    true,
  );
  assert.equal(
    await actual
      .getByRole("button", { name: "Buy Again", exact: true })
      .count(),
    0,
  );
  await completed
    .getByRole("button", { name: "Buy Again", exact: true })
    .click();
  await page.getByRole("status").filter({ hasText: "Added 1 item" }).waitFor();
  const cart = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("shopiz-cart-v1")),
  );
  assert.equal(cart.length, 2);
  assert.equal(cart.find((item) => item.productId === "4").size, "EU 42");
  assert.equal(cart.find((item) => item.productId === "4").quantity, 1);
  await completed.getByRole("button", { name: "Review", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Submit Review", exact: true })
    .click();
  await page.getByRole("dialog").getByRole("alert").waitFor();
  await page.getByRole("radio", { name: "5 stars", exact: true }).check();
  await page
    .getByRole("textbox", { name: "Your review (optional)", exact: true })
    .fill("Great purchase.");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Submit Review", exact: true })
    .click();
  await completed
    .getByRole("button", { name: "Edit Review", exact: true })
    .waitFor();
  await page.reload();
  await completed
    .getByRole("button", { name: "Edit Review", exact: true })
    .waitFor();
  await actual
    .getByRole("button", { name: "Contact Seller", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "View Shop", exact: true })
    .click();
  await page.waitForURL("**/shop/sonora");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Demo Shopper", exact: true }).click();
  await page
    .getByRole("navigation", { name: "Account menu", exact: true })
    .getByRole("link", { name: "My Purchases", exact: true })
    .click();
  await page.waitForURL("**/account/purchases");
  await page
    .getByRole("article", { name: `Order ${id}`, exact: true })
    .waitFor();
  const cancelled = page.getByRole("article", {
    name: "Order SAMPLE-1003",
    exact: true,
  });
  await cancelled
    .getByRole("button", { name: "View Cancellation Details", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Cancellation Details", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await actual
    .getByRole("button", { name: "Cancel Order", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep Order", exact: true }).click();
  await actual.getByRole("button", { name: "Pending", exact: true }).waitFor();
  await actual
    .getByRole("button", { name: "Cancel Order", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm Cancellation", exact: true })
    .click();
  await page.getByRole("dialog").getByRole("alert").waitFor();
  await page
    .getByRole("combobox", { name: "Reason for cancellation", exact: true })
    .selectOption({ label: "Changed my mind" });
  await page
    .getByRole("button", { name: "Confirm Cancellation", exact: true })
    .click();
  await actual
    .getByRole("button", { name: "View Cancellation Details", exact: true })
    .waitFor();
  assert.equal(
    await actual
      .getByRole("button", { name: "Cancel Order", exact: true })
      .count(),
    0,
  );
  await page.reload();
  await actual
    .getByRole("button", { name: "View Cancellation Details", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByText("Changed my mind", { exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.evaluate(() =>
    localStorage.setItem("shopiz-demo-orders-v1", "corrupted"),
  );
  await page.reload();
  await countOrders(3);
  await page.evaluate(
    (order) =>
      localStorage.setItem(
        "shopiz-demo-orders-v1",
        JSON.stringify(
          ["to-pay", "to-receive", "returns"].map((status) => ({
            ...order,
            id: `PENDING-${status}`,
            status,
          })),
        ),
      ),
    orders[0],
  );
  await page.reload();
  for (const state of ["to-pay", "to-receive", "returns"]) {
    const pending = page.getByRole("article", {
      name: `Order PENDING-${state}`,
      exact: true,
    });
    assert.equal(
      await pending
        .getByRole("button", { name: "Pending", exact: true })
        .isDisabled(),
      true,
    );
    await pending
      .getByRole("button", { name: "Cancel Order", exact: true })
      .waitFor();
    assert.equal(
      await pending
        .getByRole("button", { name: "Review", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await pending
        .getByRole("button", { name: "Buy Again", exact: true })
        .count(),
      0,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS checkout popup, status actions, review validation/persistence, cancellation confirmation/reason/details/persistence, pending statuses, search, buy again, seller links and storage recovery; no runtime errors",
  );
} finally {
  await browser.close();
}
