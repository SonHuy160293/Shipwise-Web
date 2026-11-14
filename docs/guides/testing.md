# Testing

npm run test watches; npm run test:run executes once. Vitest uses jsdom and Testing Library cleanup. Query by roles and labels; use userEvent. Unit coverage checks HTTP JSON/empty/error/cancellation behavior, safe error messages, sidebar toggle and form validation. Tests colocate with source.

Run npx playwright install chromium then npm run test:e2e. Playwright starts Vite on port 4173 and verifies routes, root redirect, account menu, sidebar, 404, mobile drawer/focus restoration, form and overflow at 375/768/1440. It writes full-page screenshots under test-results and traces on failure. Run npx playwright show-report to inspect the report. No arbitrary sleeps are used.

Before release, inspect actual screenshots for hierarchy, spacing, focus and overflow, and perform assistive-technology testing. Screenshots here are inspection artifacts; pixel baseline regression comparisons should be added when real feature designs stabilize. CI runs all fast gates, build and Chromium smoke tests without external APIs/secrets.
