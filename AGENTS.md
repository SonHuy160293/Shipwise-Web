# Shipwise development contract

## Before implementation

Read this file, DESIGN.md for UI tasks, relevant docs/architecture pages, the feature requirements and available API contracts. No backend contract is supplied yet. User instructions and approved Shipwise design take precedence over installed skill defaults.

## Roles and ownership

Specs live in the backend repository at ../Shipwise/docs/specs and decisions at ../Shipwise/docs/adr; the API contract will be ../Shipwise/contracts/openapi/shipwise.v1.json. The process (lanes, gates, who decides, changing a spec) is in ../Shipwise/docs/workflow.md. Every task comes from a spec's task table, which names its owner, repository, paths and verification commands; work only on paths your task owns. The one exception is the small change lane: a change that touches no API contract, permission rule or approved screen behavior, and stays inside one role's paths, needs no spec, only a focused test, the pull request template and a review.

- Claude Code (planner, BA, solution architect, tech lead): writes specs, ADRs and task tables, and reviews every pull request. Does not write product code.
- Codex (fullstack developer): the whole backend, plus this repository's data layer: src/lib/api/\*\*, src/features/\*/api, feature schemas and query/mutation hooks, and route registration in src/app/router.
- Gemini (frontend developer and designer): presentation: src/features/\*/components and pages, src/components/\*\*, layouts. Proposes DESIGN.md and src/styles/globals.css token changes; a human approves them before they merge.
- Order within a feature: challenge brief and draft spec, then Gemini's design proposal for new pages and complex flows (docs/design/proposals, see its README), then the approved spec, then Codex's backend + contract + data-layer pull request, then Gemini's UI pull request built on the merged hooks, each reviewed by Claude with the review-pr skill. Never edit another role's paths in the same pull request; ask the planner to reassign instead.
- Work on feat/NNNN-slug (or fix/slug), never on main. Check the branch and working tree before editing; never discard work you did not make, never force-push, and never merge or deploy: a human does.

## Stop and ask

Stop the affected task and write a decision request (context, options, recommendation, impact, safe default) instead of guessing when: a requirement is missing or contradicts another; the spec, the API contract and the design proposal disagree; a screen needs a field or endpoint the contract lacks; you find a cross-organization access or data-loss risk; the task needs paths it does not own; or the scope or dependencies grow beyond the spec. The safe default is not to implement the contested behavior. Never change approved screen behavior or work around a contract gap silently.

## Boundaries

app composes router/providers/layouts, never business logic. Features own business capabilities; shared components/lib/config must not import features. Use feature public index exports across features. Reuse shared components. No circular dependencies, unrelated refactoring, generic repositories, DI containers or speculative abstractions. Use @/ imports for internal code (colocated tests may use relative imports). Keep changes small and explicit.

## React and TypeScript

Strict TypeScript; no unexplained any or unsafe casts. Generated contracts describe compile-time shapes, not runtime trust. Follow Hooks rules; prefer declarative UI, local state and explicit props. Avoid effects for derived values, premature memoization and global stores without concrete need. TanStack Query owns server state; URL search parameters own bookmarkable state.

## Design

Read DESIGN.md. Reuse shadcn and semantic tokens. Preserve white surfaces, navy #17324D and limited Light Blue #DDF4FF. Never introduce gradients or Light Blue card fills. Maintain visible focus, labels, keyboard access, reduced motion and responsive behavior at 375/768/1440px. Do not present fictional data or nonfunctional business actions.

## Integration and security

Never invent endpoints, authentication or DTOs. Generate OpenAPI contracts; never edit generated files. Use the shared fetch client with cancellation and feature-local TanStack Query hooks. Do not duplicate server data in Zustand. No secrets in browser code/environment variables. No credentials in localStorage. Route restrictions do not authorize backend access. Validate untrusted data at appropriate runtime boundaries.

## Quality gates

Run npm run check (typecheck, ESLint, formatting, unit tests, design lint, build). Run npm run test:e2e for UI changes and inspect screenshots. Add meaningful behavior tests, not implementation mirrors. Report actual commands/results and any limitations; do not claim unexecuted tests passed. npm ci must remain reproducible. Update architecture/convention docs when decisions change; avoid duplication.

## Skills

Project skills are agent guidance, never runtime dependencies: impeccable (design critique and detector) and ui-ux-pro-max (UX, React, shadcn and Tailwind rule lookup). They live under .agents/skills, which Codex and Gemini load directly; Claude Code uses the entry points under .claude/skills. Shipwise DESIGN.md overrides their aesthetic suggestions. Hooks are approved by a human in each agent's own hook settings; never approve, add or change hooks yourself, and never overwrite global agent config. See docs/guides/ai-tooling.md.

## Definition of done

A change is done only when: npm run check passes (and npm run test:e2e for UI changes); behavior changes have tests; generated contracts are regenerated from the backend spec when it changed, never hand-edited; impeccable detect is clean or each finding is triaged for UI changes; a different agent than the author has reviewed the diff; and the pull request template is filled in with the acceptance criteria covered, screenshots for UI changes, and the actual commands run and their results (PASSED, FAILED or NOT_RUN), including anything skipped.
