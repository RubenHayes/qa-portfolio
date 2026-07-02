async function fillRegistrationForm(page, overrides = {}) {
  const { expect } = require("@playwright/test");

  const defaults = {
    firstName: "Ruben",
    lastName: "Hayes",
    dob: "1995-12-30",
    country: "ZA",
    postalCode: "7560",
    houseNumber: "45",
    phone: "0820661234",
    email: `test.user.${Date.now()}@example.com`,
    password: "Monster!89",
  };

  const data = { ...defaults, ...overrides };

  await page.locator('[data-test="first-name"]').fill(data.firstName);
  await page.locator('[data-test="last-name"]').fill(data.lastName);
  await page.locator('[data-test="dob"]').fill(data.dob);

  if (data.country) {
    await page.locator('[data-test="country"]').selectOption(data.country);
  }

  await page.locator('[data-test="postal_code"]').fill(data.postalCode);
  await page.locator('[data-test="house_number"]').fill(data.houseNumber);

  if (data.country && data.postalCode && data.houseNumber) {
    await expect(page.locator('[data-test="city"]')).not.toHaveValue("");
    await expect(page.locator('[data-test="state"]')).not.toHaveValue("");
  }

  await page.locator('[data-test="phone"]').fill(data.phone);
  await page.locator('[data-test="email"]').fill(data.email);
  await page.locator('[data-test="password"]').fill(data.password);

  return data;
}

module.exports = { fillRegistrationForm };
