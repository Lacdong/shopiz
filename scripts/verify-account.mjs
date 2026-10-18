import assert from "node:assert/strict";
import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const dialog = () => page.getByRole("dialog");
try {
  await page.goto(base + "/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("shopiz-demo-user", "user-001");
  });
  await page.goto(base + "/account/profile");
  await page.reload();
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/account/profile", "/account/addresses"]) {
      await page.goto(base + path);
      await page.locator("h1").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${path} at ${width}`,
      );
    }
    await page
      .getByRole("button", { name: "Add New Address", exact: true })
      .click();
    const box = await dialog().evaluate((el) => ({
      left: el.getBoundingClientRect().left,
      right: el.getBoundingClientRect().right,
      width: el.clientWidth,
      scroll: el.scrollWidth,
    }));
    assert.ok(
      box.left >= 0 && box.right <= width && box.scroll <= box.width,
      `Address modal overflow ${width}`,
    );
    await page.keyboard.press("Escape");
    console.log(
      `PASS profile, address book and address dialog at ${width}px; no screenshots`,
    );
  }
  await page.goto(base + "/account/profile");
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  assert.equal(
    await page
      .getByRole("textbox", { name: "Name", exact: true })
      .getAttribute("aria-invalid"),
    "true",
  );
  await page
    .getByRole("textbox", { name: "Name", exact: true })
    .fill("Taylor Shopper");
  await page.getByRole("radio", { name: "Other", exact: true }).check();
  await page.getByRole("combobox", { name: "Birth day" }).selectOption("31");
  await page.getByRole("combobox", { name: "Birth month" }).selectOption("2");
  await page.getByRole("combobox", { name: "Birth year" }).selectOption("2000");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "valid date of birth" })
    .waitFor();
  await page.getByRole("combobox", { name: "Birth day" }).selectOption("29");
  await page.getByRole("button", { name: "Change email", exact: true }).click();
  await dialog()
    .getByRole("textbox", { name: "Email address" })
    .fill("invalid");
  await dialog().getByRole("button", { name: "Update", exact: true }).click();
  await dialog().getByRole("alert").waitFor();
  await dialog()
    .getByRole("textbox", { name: "Email address" })
    .fill("taylor@example.com");
  await dialog().getByRole("button", { name: "Update", exact: true }).click();
  await page
    .getByRole("button", { name: "Change phone number", exact: true })
    .click();
  await dialog().getByRole("textbox", { name: "Phone number" }).fill("123");
  await dialog().getByRole("button", { name: "Update", exact: true }).click();
  await dialog().getByRole("alert").waitFor();
  await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
  await page
    .getByLabel("Upload profile image")
    .setInputFiles({
      name: "bad.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not image"),
    });
  await page.getByRole("alert").filter({ hasText: "JPEG or PNG" }).waitFor();
  await page
    .getByLabel("Upload profile image")
    .setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9S8AAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await page.getByRole("img", { name: "Profile preview" }).waitFor();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Your profile has been saved" })
    .waitFor();
  await page.reload();
  assert.equal(
    await page.getByRole("textbox", { name: "Name", exact: true }).inputValue(),
    "Taylor Shopper",
  );
  assert.equal(
    await page.getByRole("combobox", { name: "Birth day" }).inputValue(),
    "29",
  );
  assert.equal(
    await page.getByRole("radio", { name: "Other", exact: true }).isChecked(),
    true,
  );
  await page
    .getByRole("img", { name: "Profile avatar", exact: true })
    .waitFor();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page
    .getByRole("button", { name: "Taylor Shopper", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Account menu" })
    .getByRole("link", { name: "My Account", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "My Profile", exact: true })
    .waitFor();
  await page
    .getByRole("navigation", { name: "Account sections" })
    .getByRole("link", { name: "Addresses", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add New Address", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Save Address", exact: true })
    .click();
  assert.equal(await dialog().locator("[aria-invalid=true]").count(), 6);
  for (const [label, value] of [
    ["Full name", "Test Recipient"],
    ["Phone number", "0909999999"],
    ["City", "Da Nang"],
    ["District", "Hai Chau"],
    ["Ward", "Hai Chau 1"],
    ["Street address", "10 Test Street"],
  ])
    await dialog()
      .getByRole("textbox", { name: label, exact: true })
      .fill(value);
  await dialog().getByRole("radio", { name: "Office", exact: true }).check();
  await dialog()
    .getByRole("checkbox", { name: "Set as default address", exact: true })
    .check();
  await dialog()
    .getByRole("button", { name: "Save Address", exact: true })
    .click();
  const saved = page.getByRole("article", {
    name: "Office address for Test Recipient",
    exact: true,
  });
  await saved.waitFor();
  assert.equal(
    await saved
      .getByRole("button", { name: "Set as Default", exact: true })
      .isDisabled(),
    true,
  );
  await page.reload();
  await saved.waitFor();
  await saved.getByRole("button", { name: "Edit", exact: true }).click();
  await dialog()
    .getByRole("textbox", { name: "Street address", exact: true })
    .fill("20 Edited Street");
  await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
  assert.ok((await saved.textContent()).includes("10 Test Street"));
  await saved.getByRole("button", { name: "Edit", exact: true }).click();
  await dialog()
    .getByRole("textbox", { name: "Street address", exact: true })
    .fill("20 Edited Street");
  await dialog()
    .getByRole("button", { name: "Save Address", exact: true })
    .click();
  await saved.getByText("20 Edited Street", { exact: false }).waitFor();
  await page
    .getByRole("article", {
      name: "Home address for Demo Shopper",
      exact: true,
    })
    .getByRole("button", { name: "Set as Default", exact: true })
    .click();
  await saved.getByRole("button", { name: "Delete", exact: true }).click();
  await dialog().getByRole("button", { name: "Cancel", exact: true }).click();
  await saved.waitFor();
  await saved.getByRole("button", { name: "Delete", exact: true }).click();
  await dialog()
    .getByRole("button", { name: "Delete Address", exact: true })
    .click();
  await saved.waitFor({ state: "detached" });
  await page.evaluate(() =>
    localStorage.setItem("shopiz-demo-user", "user-002"),
  );
  await page.goto(base + "/account/profile");
  await page.reload();
  assert.equal(
    await page.getByRole("textbox", { name: "Name", exact: true }).inputValue(),
    "Alex Nguyen",
  );
  assert.equal(
    await page.getByRole("img", { name: "Profile preview" }).count(),
    0,
  );
  await page.evaluate(() => {
    localStorage.setItem("shopiz-demo-user", "user-001");
    localStorage.setItem("shopiz-account-v1:user-001", "corrupt");
  });
  await page.reload();
  assert.equal(
    await page.getByRole("textbox", { name: "Name", exact: true }).inputValue(),
    "Demo Shopper",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS name/date/contact validation, avatar upload, profile/header persistence, address create/edit/cancel/default/delete, account isolation and corrupt storage; no screenshots or runtime errors",
  );
} finally {
  await browser.close();
}
