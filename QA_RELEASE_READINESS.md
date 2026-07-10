# QA And Release Readiness

Date: 2026-07-10

This tracker turns the current product state into a concrete QA and sales-readiness backlog. It should be updated as each workflow is verified, fixed, or intentionally deferred.

## Current Readiness Summary

- Status: Not ready for broad paid promotion yet.
- Reason: Core job-search workflows exist, but automated coverage is missing, several live workflows need authenticated browser QA, and production/source alignment still needs confirmation before prospects evaluate the product.
- Highest-confidence fix completed in this pass: Dashboard first-run flow now directs users to add a company before contact or appointment workflows.
- Static verification: TypeScript app check passes; ESLint source check passes.

## Evidence Collected

- Authenticated live Chrome QA of `https://cpfcoaching.us/dashboard`.
- Live screenshots saved in `audits/`.
- Source review of dashboard, company, contact, appointment, feedback, admin, AI settings, and backend endpoints.
- Existing docs reviewed: `README.md`, `QUICKSTART.md`, `SETUP.md`, `ARCHITECTURE.md`, `SECURITY.md`, `DOCUMENTATION_INDEX.md`.

## Revenue-Critical QA Matrix

| Area | Why It Matters For Sale | Current Evidence | Status | Next Action |
| --- | --- | --- | --- | --- |
| First-run dashboard | Trial users decide quickly whether the product is usable | Live dashboard inspected; empty workflow issue confirmed and fixed locally | Needs re-test after deploy | Deploy and verify zero-data state |
| Company tracking | Core CRM foundation for the product | Source reviewed; local empty state exists | Needs functional QA | Add/edit/delete company in browser |
| Contact tracking | Required for outreach and appointments | Live Add Contact modal inspected | Needs functional QA | Verify contact creation after adding company |
| Appointment booking | Converts networking activity into scheduled action | Live Book Appointment modal inspected | Needs functional QA | Verify booking after company/contact exist |
| Calendar | Shows user commitments and follow-ups | Source route exists | Not verified | Browser QA calendar states and CRUD |
| Outreach tracker / feedback loop | Supports iteration and customer-reported issues | Feedback/admin source and backend endpoints exist | Needs backend QA | Submit bug/feature and verify admin triage |
| AI Assistant | Differentiating feature and sales hook | Source route exists | Not verified | Verify provider setup, errors, and output UX |
| Security Resume | High-value resume optimization workflow | Source route exists and active dev file open | Not verified | QA import/edit/export/error states |
| Job Scraper / Job Search | Lead-generation value proposition | Server JobSpy integration exists | Not verified | Verify install requirements and live search path |
| Billing / subscription | Required for revenue capture | Live nav has Subscription route; local repo does not show matching route | Gap | Align repo, deployed app, and payment docs |
| Admin console | Required to monitor launch issues | Source route and backend endpoints exist | Needs security QA | Add access control before public sale |
| Settings / API keys | Required for AI features and trust | Secure backend docs exist | Needs functional QA | Verify key save/test/delete flows |

## Required Fixes Before Paid Promotion

1. Add authenticated access control for admin and sensitive operational screens.
   - Current local route exposes `/admin` in the app shell.
   - Backend admin endpoints should not be publicly callable without authorization.

2. Align local source, deployed app, and docs.
   - Live production navigation includes routes not present in local `src/App.tsx`, including billing/subscription-oriented items.
   - Promotion should not start until the source of truth is clear.

3. Add smoke tests for critical user journeys.
   - Minimum journeys: first-run onboarding, company CRUD, contact CRUD, appointment CRUD, AI settings validation, feedback submission, admin triage.

4. Add launch-ready empty states.
   - Every zero-data workflow should explain the next action and prevent dead-end forms.

5. Verify billing and trial behavior.
   - Confirm trial copy, gating, paid conversion path, cancellation, receipts, and subscription status handling.

6. Add production monitoring notes.
   - Document where errors, feedback, usage events, and payment events are reviewed.

7. Keep the frontend static gate green.
   - TypeScript and ESLint now pass through the local compiler/linter APIs.
   - Continue running these gates before each promotion-focused release.

## Documentation Updates Needed

- Add a short "Getting Started As A Trial User" section to `README.md`.
- Add a "Launch QA Checklist" to `DOCUMENTATION_INDEX.md` or link this file from it.
- Document each paid-tier capability and which routes are free trial vs paid.
- Document admin access expectations and production environment variables.
- Add screenshots for the updated first-run dashboard after deployment.

## Verification Commands

Run these when the local toolchain is available:

```bash
npm run lint
npm run build
```

Equivalent checks run in this session:

- TypeScript compiler API against `tsconfig.app.json`: passed.
- ESLint API against `src/**/*.{ts,tsx}`: passed.

Run backend checks when Node and Python dependencies are installed:

```bash
cd server
npm install
npm run dev
python3 jobspy_search.py --help
```

## Current Verification Limits

- The shell in this session does not expose `node` or `npm`, so standard build/lint commands could not be run from the terminal.
- Computer Use can control the logged-in Chrome session, so authenticated browser QA can continue route by route.
- Form submission was intentionally not completed in the live production app during this pass.
