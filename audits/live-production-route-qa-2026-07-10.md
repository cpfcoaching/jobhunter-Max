# Live Production Route QA - 2026-07-10

Target: `https://cpfcoaching.us`

Tester: Authenticated Chrome session controlled through Computer Use.

## Scope

Read-only production inspection. No production forms were submitted and no live user data was created, modified, or deleted.

## Findings

### 1. Production build is not aligned with local source

Production sidebar includes routes that are not registered in local `src/App.tsx`:

- `/interview-prep`
- `/readiness`
- `/outreach`
- `/job-scraper`
- `/skills-hunter`
- `/kei-discovery`
- `/roadmap`
- `/billing`

Local source currently registers dashboard, companies, calendar, job search, skill profiles, AI assistant, feedback, admin, security resume, and settings.

Impact: release readiness cannot be signed off from the local repo alone. The deployed artifact appears to come from a different source state, branch, or generated build than the checked-in code.

### 2. Client-side navigation can show stale main content until hard reload

Observed route changes:

- From `/dashboard`, clicking `Companies` changed the URL to `/companies`, but the main content initially remained `Dashboard`.
- Hard reload on `/companies` rendered the correct `Target Companies` page.
- From `/calendar`, clicking `Subscription` changed the URL to `/billing`, but the main content area initially rendered no billing content.
- Hard reload on `/billing` rendered the correct `Billing & Subscription` page.

Impact: users can land on the wrong or blank content after normal sidebar navigation. This is a high-priority usability issue for trial conversion and paid onboarding.

### 3. Production dashboard still has the first-run dead-end

Live `/dashboard` showed:

- `Companies Tracked`: `0`
- `Appointments Booked`: `0`
- `Follow-ups Due Today`: `0`
- Primary actions: `Add Contact`, `Book Appointment`

The local source now has a first-run company onboarding fix, but production still exposes contact and appointment actions before any company exists.

Impact: first-time users may open workflows they cannot complete. This was fixed locally but needs deployment and post-deploy verification.

### 4. Billing page exists in production but not local source

After hard reload, `/billing` rendered:

- `Billing & Subscription`
- Current plan: `FREE`
- Trial/sidebar copy: `FREE TRIAL 30 days of Dashboard & Contact Manager access.`
- CTA: `Upgrade to Premium - $9.99/mo`
- AI usage pricing copy

Impact: monetization copy exists in production, but the route and implementation are missing from local source. Billing behavior, checkout wiring, cancellation, receipts, and entitlement enforcement still need source review and functional QA before promotion.

## Recommended Next Actions

1. Identify the exact deployed commit/build source for `cpfcoaching.us`.
2. Align local `main`, production navigation, and docs before further sales QA.
3. Deploy the local dashboard/admin hardening fixes or merge them into the deployment source.
4. Re-test sidebar navigation without hard reloads across every production route.
5. Complete billing checkout/entitlement QA only after confirming the billing implementation source.
