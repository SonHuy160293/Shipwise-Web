# Shipwise Web

Shipwise is an AI-first software delivery management platform. This repository currently provides the frontend foundation only: a responsive shell, placeholder navigation, providers, typed HTTP infrastructure, validation patterns and quality gates. No live business data, authentication or backend workflows are implemented.

## Quick start (PowerShell)

Requires Node.js 24 LTS and npm 11 or newer. Use the lockfile for reproducible installs.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. Public VITE_API_BASE_URL defaults to /api; it may point to a local .NET API or YARP gateway. Browser variables are public and must never contain secrets. No API is called by the placeholder pages.

## Commands

| Command                               | Purpose                                               |
| ------------------------------------- | ----------------------------------------------------- |
| npm run dev                           | Vite development server                               |
| npm run build                         | Strict compilation and production bundle              |
| npm run preview                       | Serve dist locally, not a production server           |
| npm run typecheck                     | TypeScript project checks                             |
| npm run lint / npm run lint:fix       | ESLint / automatic fixes                              |
| npm run format / npm run format:check | Prettier write / verify                               |
| npm run test / npm run test:run       | Vitest watch / once                                   |
| npm run test:e2e                      | Playwright Chromium smoke and responsive tests        |
| npm run design:lint                   | Google DESIGN.md structural/token lint                |
| npm run check                         | All fast gates plus build; E2E separate               |
| npm run api:generate                  | Generate contracts from OPENAPI_SPEC; fails if absent |

Before E2E: run npx playwright install chromium. CI also installs Linux system dependencies. Screenshots and HTML reports are generated under ignored test-results and playwright-report folders.

## Stack and architecture

React 19, strict TypeScript 5.9, Vite 8, React Router 8, Tailwind 4, shadcn/Radix, Geist, Lucide, TanStack Query 5, React Hook Form and Zod. Vitest/Testing Library and Playwright verify behavior. No global client store is needed.

app composes providers, nested routes and layouts. components owns reusable UI/layout; features will own business capabilities. lib contains HTTP, errors and future auth integration boundaries. config validates public environment settings. Generated contracts live separately under lib/api/generated.

## Documentation

- [Architecture](docs/architecture/overview.md), [routing](docs/architecture/routing.md), [state](docs/architecture/state-management.md), [API integration](docs/architecture/api-integration.md)
- [Getting started](docs/guides/getting-started.md), [workflow](docs/guides/development-workflow.md), [adding a feature](docs/guides/adding-a-feature.md), [testing](docs/guides/testing.md), [AI tooling](docs/guides/ai-tooling.md)
- [Design](DESIGN.md), [components](docs/design/component-guidelines.md), [agent contract](AGENTS.md), [decision record](docs/architecture/decisions/001-foundation.md)

## Deployment and limitations

Serve dist with an HTTPS static host that rewrites unknown paths to index.html for SPA deep links. Configure /api forwarding separately; do not rewrite API errors to HTML. No API contract or identity provider exists yet. The profile and logout entries are explicit placeholders. The form demo is development-only at /dev/form-example. No telemetry provider is connected. Design lint does not certify accessibility; perform manual assistive-technology testing before shipping business features. Figma is optional and unused.

See [remaining limitations and audit details](docs/guides/known-limitations.md) and the [completed shell critique](docs/design/shell-critique.md).
