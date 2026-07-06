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

  if (data.country && data.postalCode && data.houseNumber) {
    // Fill postal code, then house number - the lookup only fires once
    // both are present. Wait for the actual API response rather than
    // polling the DOM for city/state to change.
    await page.locator('[data-test="postal_code"]').fill(data.postalCode);

    await Promise.all([
      page.waitForResponse(
        (resp) =>
          resp.url().includes("/postcode-lookup") && resp.status() === 200,
        { timeout: 20000 }
      ),
      page.locator('[data-test="house_number"]').fill(data.houseNumber),
    ]);
  } else {
    // Missing one of the three inputs needed to trigger a lookup at all -
    // just fill whatever we have, no lookup will fire.
    await page.locator('[data-test="postal_code"]').fill(data.postalCode);
    await page.locator('[data-test="house_number"]').fill(data.houseNumber);
  }

  await page.locator('[data-test="phone"]').fill(data.phone);
  await page.locator('[data-test="email"]').fill(data.email);
  await page.locator('[data-test="password"]').fill(data.password);

  return data;
}

module.exports = { fillRegistrationForm };