import { test, expect } from "@playwright/test";
const { fillRegistrationForm } = require("./helpers/registerHelper");
const { getDob } = require("./helpers/dateHelper");

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

  test("should be able to log in with a newly registered user", async ({ page }) => {
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
    await expect(page.locator('[data-test="nav-menu"]')).toBeVisible({ timeout: 10000 });
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
    { field: "email", override: { email: "" }, errorText: "Email is required" },
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

test.describe("Register - Age boundaries", () => {
  const ageBoundaryCases = [
    {
      label: "turns 18 exactly today - rejected",
      override: { dob: getDob(18, 0) },
      shouldSucceed: false,
      errorText: "Customer must be 18 years old.",
    },
    {
      label: "turned 18 one day ago - accepted (real minimum boundary)",
      override: { dob: getDob(18, 1) },
      shouldSucceed: true,
    },
    {
      label: "age 92 - accepted",
      override: { dob: getDob(92, 1) },
      shouldSucceed: true,
    },
    {
      label: "turns 93 exactly today - rejected (real maximum boundary)",
      override: { dob: getDob(93, 0) },
      shouldSucceed: false,
      errorText: "Customer must be younger than 75 years old.",
    },
  ];

  for (const {
    label,
    override,
    shouldSucceed,
    errorText,
  } of ageBoundaryCases) {
    test(`registration - ${label}`, async ({ page }) => {
      await page.goto("/auth/register");
      await fillRegistrationForm(page, override);

      if (shouldSucceed) {
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
      } else {
        await page.locator('[data-test="register-submit"]').click();
        await expect(page.getByText(errorText)).toBeVisible();
        await expect(page).toHaveURL(/.*\/auth\/register/);
      }
    });
  }

  test("KNOWN ISSUE: AC states max age 75, but ages 75-92 are incorrectly accepted", async ({
    page,
  }) => {
    // AC: "Age must be between 18 and 75 inclusive."
    // Error message itself even states "must be younger than 75 years old."
    // Actual enforced maximum is 93, not 75 - confirmed via direct registration
    // attempts at ages 75, 76, 81, 86, 91, and 92 (all incorrectly accepted).
    await page.goto("/auth/register");
    await fillRegistrationForm(page, { dob: getDob(80, 0) });

    const [response] = await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/users/register") &&
          resp.request().method() === "POST",
      ),
      page.locator('[data-test="register-submit"]').click(),
    ]);

    expect(response.status()).toBe(201); // Should be 422 per AC, but app returns 201
  });
});
