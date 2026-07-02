import { test, expect } from "@playwright/test";
const { fillRegistrationForm } = require("./helpers/registerHelper");

test.describe("Register - Happy path", () => {
  test("should register a new user successfully", async ({ page }) => {
    await page.goto("/auth/register");

    await fillRegistrationForm(page);

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/register") &&
          resp.request().method() === "POST",
      ),
      page.locator('[data-test="register-submit"]').click(),
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
    await page.goto("/auth/register");

    const { email, password, firstName } = await fillRegistrationForm(page);

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/register") &&
          resp.request().method() === "POST",
      ),
      page.locator('[data-test="register-submit"]').click(),
    ]);

    await expect(page).toHaveURL(/.*\/auth\/login/);

    await page.locator('[data-test="email"]').fill(email);
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
    await expect(page.locator('[data-test="nav-menu"]')).toContainText(
      firstName,
    );
  });
});

test.describe("Register - Mandatory fields", () => {
  const mandatoryFieldCases = [
    {
      field: "firstName",
      override: { firstName: "" },
      errorText: "First name is required",
    },
    {
      field: "lastName",
      override: { lastName: "" },
      errorText: "Last name is required",
    },
    {
      field: "country",
      override: { country: "" },
      errorText: "Country is required",
    },
    {
      field: "postalCode",
      override: { postalCode: "" },
      errorText: "Postcode is required",
    },
    {
      field: "houseNumber",
      override: { houseNumber: "" },
      errorText: "House number is required",
    },
    {
      field: "phone",
      override: { phone: "" },
      errorText: "Phone is required.",
    },
    { field: "email",
      override: { email: "" },
      errorText: "Email is required" 
    },
    {
      field: "password",
      override: { password: "" },
      errorText: "Password is required",
    },
  ];

  for (const { field, override, errorText } of mandatoryFieldCases) {
    test(`should show validation error when ${field} is missing`, async ({
      page,
    }) => {
      await page.goto("/auth/register");
      await fillRegistrationForm(page, override);
      await page.locator('[data-test="register-submit"]').click();
      await expect(page.getByText(errorText)).toBeVisible();
      await expect(page).toHaveURL(/.*\/auth\/register/);
    });
  }
});
