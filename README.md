# QA Portfolio — Playwright Automation Framework

A Playwright + JavaScript test automation framework built to practice and demonstrate frontend UI automation, API-aware testing patterns, and CI/CD integration. Tests target the public demo application [Practice Software Testing](https://practicesoftwaretesting.com/), a site built specifically for automation practice.

## Purpose

This repo is part of a self-directed upskilling project focused on three areas:
1. **Automation framework design** (Playwright, page/test structure, reusable helpers)
2. **Frontend automation** (locator strategy, handling async UI behavior, form validation testing)
3. **CI/CD** (GitHub Actions pipeline running the suite on every push)

## Tech Stack

- [Playwright](https://playwright.dev/) (JavaScript)
- GitHub Actions (CI)
- Target app: [practicesoftwaretesting.com](https://practicesoftwaretesting.com/) — a demo e-commerce site with published user stories, acceptance criteria, and a matching REST API (Swagger docs available), purpose-built for test automation practice.

## Project Structure

```
tests/
  register.spec.js         # Register + Login test suite
  helpers/
    registerHelper.js      # Reusable form-filling helper with data overrides
```

## Running Tests Locally

```bash
npm install
npx playwright test
```

Run with a visible browser:
```bash
npx playwright test --headed
```

View the last HTML report:
```bash
npx playwright show-report
```

## Test Coverage — Register Ticket

Based on the target app's published user story: *"As a visitor, I want to register an account so that I can log in and use personalized features."*

- ✅ Happy path — successful registration and login with a newly created user
- ✅ Mandatory field validation — data-driven tests covering every required field
- 🔜 Age boundary validation (BVA)
- 🔜 Email format & duplicate validation (EP)
- 🔜 Max length validation (name, address, phone)
- 🔜 Password rule validation (strength, confirm-password match)
- 🔜 Malicious/unexpected input handling (SQL injection, emoji, whitespace) — woven into the above where applicable

Test cases are derived directly from the target app's own acceptance criteria and testing guidance, using Boundary Value Analysis (BVA), Equivalence Partitioning (EP), and data-driven test patterns rather than one-off hardcoded tests.

## Known Limitations

**Cloudflare bot protection intermittently blocks CI runs.** The target site uses Cloudflare's bot-verification challenge (Cloudflare Turnstile). GitHub Actions' shared runner IP ranges are commonly flagged by this challenge, which can cause the Happy Path tests (which depend on reaching the live login page) to fail in CI even though they pass reliably when run locally.

This is an environment/infrastructure constraint of testing against a public third-party site from shared cloud IPs — not a defect in the test logic. Mitigations attempted:
- Using the real Chrome browser channel instead of bundled Chromium
- Increased per-test timeout (60s)

Neither fully resolves it, since the block appears to be IP-reputation based rather than timing based. The reliable long-term fix is to run the target application locally via Docker Compose (self-hosted, see the app's own repo) inside the CI job itself, so tests run against `localhost` rather than crossing the public internet — planned as a future improvement.

## Roadmap

- Complete remaining Register ticket test checkpoints (age, email, max length, password)

- Complete remaing tickets 
  - Login, Forgot Password, Customer Profile, Customer Favourites,
  - Customer Invoices, Customer Messages, Locked Account, Multi-Factor Authentication,
  - Contact Form, Product Listing, Category Page, Product Detail Page, Shopping Cart,
  - Checkout + Payment, Geolocation Discount, Combined Product Discount

- Extract framework into a proper Page Object Model as test coverage grows
- Add API test coverage using the app's Swagger-documented endpoints
- Explore Docker Compose self-hosting to remove CI's dependency on the public site
- Expand coverage to additional user stories (Login, Cart, Checkout)