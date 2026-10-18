import { chromium } from "playwright";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
const base = process.env.SHOPIZ_URL || "http://127.0.0.1:5173";
const errors = [];
const authRequests = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (r.method() !== "GET") authRequests.push(r.url());
});
function check(value, message) {
  if (!value) throw new Error(message);
}
try {
  for (const width of [1440, 1280, 1024, 768, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/login", "/register", "/signup", "/forgot-password"]) {
      await page.goto(base + path);
      await page.locator("h1").waitFor();
      check(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${width} ${path}`,
      );
      check(
        (await page.getByRole("search").count()) === 0,
        "Auth page used the marketplace header",
      );
    }
    console.log(`PASS auth layouts at ${width}px; no screenshots`);
  }
  await page.goto(base + "/login");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();
  await page.getByText("Enter your phone number, email or username.").waitFor();
  await page.getByText("Enter your password.", { exact: true }).waitFor();
  await page
    .getByLabel("Phone number / Email / Username", { exact: true })
    .fill("invalid@");
  await page.getByLabel("Password", { exact: true }).fill("DemoPass123");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  check(
    (await page
      .getByLabel("Password", { exact: true })
      .getAttribute("type")) === "text",
    "Password visibility failed",
  );
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();
  await page
    .getByText("Enter a valid email address.", { exact: true })
    .waitFor();
  await page.getByRole("button", { name: "Google", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Google login is not connected" })
    .waitFor();
  await page.getByRole("button", { name: "Log in with QR code" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "QR code login is not connected" })
    .waitFor();
  await page
    .getByLabel("Phone number / Email / Username", { exact: true })
    .fill("demo@shopiz.com");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();
  await page
    .getByRole("alert")
    .filter({ hasText: "Incorrect phone number" })
    .waitFor();
  await page.getByLabel("Password", { exact: true }).fill("Shopiz@123");
  await page.getByRole("button", { name: "LOG IN", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "You’re logged in with a demo account" })
    .waitFor();
  await page.getByRole("link", { name: "Continue shopping" }).click();
  await page.waitForURL(base + "/");
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .locator("header nav")
    .getByText("Demo Shopper", { exact: true })
    .waitFor();
  check(
    (await page
      .getByRole("button", { name: "Log Out", exact: true })
      .count()) === 0,
    "Logout must be hidden until the account popup opens",
  );
  await page.getByRole("button", { name: "Demo Shopper", exact: true }).click();
  await page.getByRole("navigation", { name: "Account menu" }).waitFor();
  await page
    .getByRole("link", { name: "My Account", exact: true })
    .waitFor();
  await page.getByRole("link", { name: "My Purchases", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  check(
    (await page
      .getByRole("button", { name: "Demo Shopper", exact: true })
      .getAttribute("aria-expanded")) === "false",
    "Escape should close account popup",
  );
  await page.getByRole("button", { name: "Demo Shopper", exact: true }).click();
  await page.getByRole("button", { name: "Log Out", exact: true }).click();
  check(
    await page.evaluate(
      () => localStorage.getItem("shopiz-demo-user") === null,
    ),
    "Logout did not clear persistent demo session",
  );
  for (const identity of ["demo", "0901234567"]) {
    await page.goto(base + "/login");
    await page
      .getByLabel("Phone number / Email / Username", { exact: true })
      .fill(identity);
    await page.getByLabel("Password", { exact: true }).fill("Shopiz@123");
    await page.getByRole("checkbox", { name: "Keep me logged in" }).uncheck();
    await page.getByRole("button", { name: "LOG IN", exact: true }).click();
    await page
      .getByRole("status")
      .filter({ hasText: "You’re logged in with a demo account" })
      .waitFor();
    check(
      await page.evaluate(
        () =>
          sessionStorage.getItem("shopiz-demo-user") === "user-001" &&
          localStorage.getItem("shopiz-demo-user") === null,
      ),
      "Session-only preference failed",
    );
    await page.getByRole("link", { name: "Continue shopping" }).click();
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page
      .getByRole("button", { name: "Demo Shopper", exact: true })
      .click();
    await page.getByRole("button", { name: "Log Out", exact: true }).click();
  }
  await page.goto(base + "/register");
  await page.getByRole("button", { name: "NEXT", exact: true }).click();
  await page
    .getByText("Enter a valid phone number (9–15 digits).", { exact: true })
    .waitFor();
  await page.getByLabel("Phone number", { exact: true }).fill("0901234567");
  await page.getByRole("button", { name: "NEXT", exact: true }).click();
  await page.getByLabel("Your name", { exact: true }).waitFor();
  await page.getByRole("button", { name: "CREATE DEMO ACCOUNT" }).click();
  await page.getByText("Use at least 8 characters.", { exact: true }).waitFor();
  await page
    .getByText("Please agree to the Terms of Service and Privacy Policy.", {
      exact: true,
    })
    .waitFor();
  await page.getByLabel("Your name", { exact: true }).fill("Demo Shopper");
  await page.getByLabel("Password", { exact: true }).fill("DemoPass123");
  await page.getByLabel("Confirm password", { exact: true }).fill("different");
  await page.getByRole("button", { name: "CREATE DEMO ACCOUNT" }).click();
  await page.getByText("Passwords must match.", { exact: true }).waitFor();
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("DemoPass123");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "CREATE DEMO ACCOUNT" }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "No account was created" })
    .waitFor();
  await page.getByRole("link", { name: "Continue to Log In" }).click();
  await page.waitForURL("**/login");
  check(
    (await page
      .getByLabel("Phone number / Email / Username", { exact: true })
      .inputValue()) === "0901234567",
    "Registration to login handoff failed",
  );
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.getByRole("button", { name: "CONTINUE", exact: true }).click();
  await page
    .getByText("Enter a valid email address.", { exact: true })
    .waitFor();
  await page
    .getByLabel("Email address", { exact: true })
    .fill("demo@example.com");
  await page.getByRole("button", { name: "CONTINUE", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "No email was sent" })
    .waitFor();
  check(!errors.length, errors.join("; "));
  check(!authRequests.length, "Auth data was sent over the network");
  check(
    await page.evaluate(
      () =>
        !["DemoPass123", "Shopiz@123"].some((password) =>
          JSON.stringify({ ...localStorage, ...sessionStorage }).includes(
            password,
          ),
        ),
    ),
    "Password persisted",
  );
  console.log(
    "PASS validation, password visibility, social/QR notices, login preview, two-step registration, mismatch/consent checks, login handoff, password recovery; no auth requests or runtime errors",
  );
} finally {
  await browser.close();
}
