# ADR 001: Conventional feature-based SPA

Status: accepted.

React/Vite with nested client routes meets the separate .NET backend model without SSR or a meta-framework. app composes infrastructure; features own business behavior; shared infrastructure stays domain-agnostic. Native fetch avoids an extra HTTP dependency; generated OpenAPI types will follow real contracts. Query owns server state; local React state and URL params cover current client needs. No Zustand is warranted.

Tailwind 4 and shadcn/Radix implement the approved Shipwise tokens with local Geist fonts. TypeScript 5.9 is deliberately pinned because openapi-typescript 7 requires TypeScript 5, despite the Vite scaffold selecting TypeScript 7. Do not bypass peer checks when upgrading. npm lockfile and Node 24 keep installs reproducible.

Consequences: static hosting needs SPA rewrites; authentication and runtime contract validation must be agreed with backend teams. No business workflows or fabricated integration DTOs ship in this foundation.
