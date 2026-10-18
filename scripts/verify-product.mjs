import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
function check(value, message) {
  if (!value) throw new Error(message);
}
try {
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ["1", "4"]) {
      await page.goto(`${base}/product/${id}`);
      await page.locator("h1").waitFor();
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Product ${id} overflow at ${width}`,
      );
      await page
        .getByRole("heading", { name: "PRODUCT SPECIFICATIONS", exact: true })
        .waitFor();
      await page
        .getByRole("heading", { name: "PRODUCT RATINGS", exact: true })
        .waitFor();
    }
    console.log(`PASS product layouts ${width}px; no screenshots`);
  }
  await page.goto(base + "/product/1");
  await page
    .getByRole("button", { name: "Show detail crop", exact: true })
    .click();
  check(
    (await page
      .getByRole("button", { name: "Show detail crop", exact: true })
      .getAttribute("aria-pressed")) === "true",
    "Gallery selection failed",
  );
  await page.getByRole("button", { name: "Enlarge product image" }).click();
  await page.getByRole("dialog", { name: "Enlarged product image" }).waitFor();
  await page.getByRole("button", { name: "Next enlarged image" }).click();
  await page.getByText("Close-up · 3 / 3", { exact: true }).waitFor();
  await page.keyboard.press("Escape");
  check(
    !(await page
      .getByRole("dialog", { name: "Enlarged product image" })
      .isVisible()),
    "Escape did not close gallery",
  );
  await page.getByRole("button", { name: "Save to favorites" }).click();
  check(
    (await page
      .getByRole("button", { name: "Saved to favorites" })
      .getAttribute("aria-pressed")) === "true",
    "Favorite toggle failed",
  );
  await page
    .getByRole("group", { name: "Color", exact: true })
    .getByRole("button", { name: "Cloud" })
    .click();
  const quantity = page.getByRole("spinbutton", {
    name: "Quantity",
    exact: true,
  });
  await quantity.fill("100");
  await quantity.blur();
  check((await quantity.inputValue()) === "36", "Stock limit failed");
  check(
    await page.getByRole("button", { name: "Increase quantity" }).isDisabled(),
    "Max stock button still enabled",
  );
  await quantity.fill("-2");
  await quantity.blur();
  check((await quantity.inputValue()) === "1", "Minimum quantity failed");
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await page
    .getByRole("combobox", { name: "Shipping method" })
    .selectOption("express");
  await page
    .getByRole("combobox", { name: "Delivery destination" })
    .selectOption("Hanoi");
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  const preview = page.getByRole("dialog", {
    name: "Review your selection",
    exact: true,
  });
  await preview.waitFor();
  await preview.getByText("Cloud · Quantity: 2", { exact: true }).waitFor();
  await preview.getByText("$102.70", { exact: true }).waitFor();
  await preview.getByText("Hanoi", { exact: true }).waitFor();
  await preview.getByRole("button", { name: "Continue browsing" }).click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Add to Cart · Preview", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Chat Now", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Chat with the shop", exact: true })
    .waitFor();
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "Review pages" })
    .getByRole("button", { name: "2", exact: true })
    .click();
  await page.getByRole("heading", { name: "Taylor P.", exact: true }).waitFor();
  await page
    .getByRole("group", { name: "Filter reviews" })
    .getByRole("button", { name: "3 stars (0)", exact: true })
    .click();
  await page
    .getByText("No sample reviews match this filter. Try another rating.", {
      exact: true,
    })
    .waitFor();
  await page
    .getByRole("group", { name: "Filter reviews" })
    .getByRole("button", { name: "With photos (3)", exact: true })
    .click();
  check(
    (await page.locator("#product-reviews article").count()) === 3,
    "Photo review filter failed",
  );
  await page
    .getByRole("button", { name: "Helpful", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Helpful (1)", exact: true })
    .waitFor();
  await page.goto(base + "/product/4");
  await page
    .getByRole("group", { name: "Size", exact: true })
    .getByRole("button", { name: "EU 42", exact: true })
    .click();
  check(
    (await page.getByRole("spinbutton", { name: "Quantity" }).inputValue()) ===
      "1",
    "Product state not reset",
  );
  await page.getByRole("button", { name: "Buy Now", exact: true }).click();
  await page
    .getByRole("dialog")
    .filter({
      has: page.getByText("Classic · EU 42 · Quantity: 1", { exact: true }),
    })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.goto(base + "/product/missing");
  await page
    .getByRole("heading", { name: "Product not found", exact: true })
    .waitFor();
  check(!errors.length, errors.join("; "));
  console.log(
    "PASS gallery, zoom/Escape, favorites, variants/sizes, quantity bounds, shipping/total preview, cart/chat notices, reviews/filter/pagination/helpful, product state reset and missing-product fallback; no runtime errors",
  );
} finally {
  await browser.close();
}
