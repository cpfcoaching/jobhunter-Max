# Dashboard Optimization Review

Date: 2026-07-10
URL reviewed: https://cpfcoaching.us/dashboard

## Evidence

- Live route header check: `/dashboard` returns HTTP 200 from Vercel.
- Live HTML shell includes dashboard metadata and preloaded assets.
- Live Chrome session inspected through Computer Use while authenticated.
- Live screenshots captured:
  - `audits/live-dashboard.png`
  - `audits/live-dashboard-after-add-contact-click.png`
  - `audits/live-dashboard-book-appointment.png`
- Local screenshot inspected: `screenshots/dashboard.png`.
- Local implementation inspected:
  - `src/pages/Dashboard.tsx`
  - `src/components/Layout.tsx`
  - `src/components/contacts/AddContactForm.tsx`
  - `src/components/appointments/AddAppointmentForm.tsx`

## Highest-Impact Opportunities

1. Convert clickable stat cards from `div` elements into semantic `button` or `Link` components.
   - Current cards use `onClick` on non-interactive `div`s, which weakens keyboard access, screen reader behavior, and focus visibility.

2. Add useful dashboard content below the stat cards.
   - The screen has a large empty area. Good candidates: upcoming appointments, overdue follow-ups, recently added companies, and next recommended action.

3. Add empty states and dependency-aware CTAs.
   - Confirmed live: with zero companies, `Add Contact` opens a full form with an empty required Company select.
   - Confirmed live: with zero companies, `Book Appointment` opens a full form with empty Company and disabled Contact fields.
   - Guide the user toward adding a company/contact first instead of opening forms that cannot be completed.

4. Improve mobile layout.
   - The layout uses a fixed `w-64` sidebar and `h-screen` shell. Add a responsive top nav/drawer and reduce `p-8` on small screens.

5. Improve modal accessibility.
   - Add `role="dialog"`, `aria-modal`, labelled titles, Escape-to-close, focus trap, and explicit accessible names for icon-only close buttons.

6. Tighten live asset caching.
   - Hashed assets are served with `cache-control: public, max-age=0, must-revalidate`. Since filenames are content-hashed, prefer long-lived immutable caching for static assets.

7. Investigate live RSC error digest in HTML.
   - The fetched HTML contained a serialized error digest for route params. Verify whether this surfaces at runtime or causes hydration/client errors.

## Evidence Limits

The final pass used the authenticated Chrome session through Computer Use. It covered the dashboard, Add Contact modal, and Book Appointment modal. It did not include a full mobile-device pass, form submission, subscription-gated route review, or browser console/performance trace.
