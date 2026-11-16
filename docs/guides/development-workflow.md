# Development workflow

The full process, shared with the backend, is in ../Shipwise/docs/workflow.md. This page is the frontend view of it.

1. Start from an approved spec in ../Shipwise/docs/specs and the task it assigns to you, or from the small change lane when the change touches no API contract, permission rule or approved screen behavior.
2. For a new page or complex flow, Gemini writes a design proposal first (docs/design/proposals/README.md); no production code until the spec is approved.
3. Read AGENTS.md, relevant architecture and DESIGN.md, the spec's acceptance criteria and the committed API contract.
4. Work on feat/NNNN-slug (or fix/slug). Create the smallest feature slice, colocating its page, API hooks, schema and behavior tests, inside the paths your task owns.
5. Reuse shared components and semantic tokens; add shared abstractions only after demonstrated reuse.
6. Run npm run format, npm run check and npm run test:e2e for UI work. Inspect responsive screenshots and keyboard behavior.
7. Review git diff for generated noise, secrets, boundary violations and unrelated changes. Update docs when conventions change.
8. Open a pull request with the template filled in. Claude Code reviews it; a human merges.

Stop and ask instead of guessing when the spec, the contract and the design disagree; the conditions are listed in AGENTS.md. Do not ask an agent to guess backend endpoints. Installed design skills are advisory; Shipwise's approved design always wins.
