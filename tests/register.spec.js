import { test, expect } from "@playwright/test";

test.describe("Register - Happy path", () => {
  test("should register a new user successfully", async ({ page }) => {
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    const password = "Monster!89";

    await page.goto("/auth/register");

    await page.locator('[data-test="first-name"]').fill("Ruben");
    await page.locator('[data-test="last-name"]').fill("Hayes");
    await page.locator('[data-test="dob"]').fill("1995-12-30");
    await page.locator('[data-test="country"]').selectOption("ZA");
    await page.locator('[data-test="postal_code"]').fill("7560");
    await page.locator('[data-test="house_number"]').fill("45");

    await expect(page.locator('[data-test="city"]')).not.toHaveValue("");
    await expect(page.locator('[data-test="state"]')).not.toHaveValue("");

    await page.locator('[data-test="phone"]').fill("0820661234");
    await page.locator('[data-test="email"]').fill(uniqueEmail);
    await page.locator('[data-test="password"]').fill(password);

    const submitButton = page.locator('[data-test="register-submit"]');

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/register") &&
          resp.request().method() === "POST",
      ),
      submitButton.click(),
    ]);

    expect(response.status()).toBe(201);
    await expect(page).toHaveURL(/.*\/auth\/login/);

    await expect(page.locator('[data-test="email"]')).toBeVisible();
    await expect(page.locator('[data-test="password"]')).toBeVisible();
    await expect(page.locator('[data-test="login-submit"]')).toBeVisible();
  });

  test("should be able to log in with a newly registered user", async ({
    page,
  }) => {
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    const password = "Monster!89";

    await page.goto("/auth/register");
    await page.locator('[data-test="first-name"]').fill("Ruben");
    await page.locator('[data-test="last-name"]').fill("Hayes");
    await page.locator('[data-test="dob"]').fill("1995-12-30");
    await page.locator('[data-test="country"]').selectOption("ZA");
    await page.locator('[data-test="postal_code"]').fill("7560");
    await page.locator('[data-test="house_number"]').fill("45");
    await expect(page.locator('[data-test="city"]')).not.toHaveValue("");
    await expect(page.locator('[data-test="state"]')).not.toHaveValue("");
    await page.locator('[data-test="phone"]').fill("0820661234");
    await page.locator('[data-test="email"]').fill(uniqueEmail);
    await page.locator('[data-test="password"]').fill(password);

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/register") &&
          resp.request().method() === "POST",
      ),
      page.locator('[data-test="register-submit"]').click(),
    ]);

    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.locator('[data-test="email"]').fill(uniqueEmail);
    await page.locator('[data-test="password"]').fill(password);

    const [loginResponse] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/login") &&
          resp.request().method() === "POST",
      ),
      page.locator('[data-test="login-submit"]').click(),
    ]);

    expect(loginResponse.status()).toBe(200);
    await expect(page).toHaveURL(/.*\/account/);
    await expect(page.locator('[data-test="nav-menu"]')).toBeVisible();
    await expect(page.locator('[data-test="nav-menu"]')).toContainText("Ruben");
  });
});
