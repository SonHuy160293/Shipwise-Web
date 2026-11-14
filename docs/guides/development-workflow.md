# Development workflow

1. Read AGENTS.md, relevant architecture and DESIGN.md, feature acceptance criteria and real API contracts.
2. Create the smallest feature slice, colocating its page, API hooks, schema and behavior tests.
3. Reuse shared components and semantic tokens; add shared abstractions only after demonstrated reuse.
4. Run npm run format, npm run check and npm run test:e2e for UI work. Inspect responsive screenshots and keyboard behavior.
5. Review git diff for generated noise, secrets, boundary violations and unrelated changes. Update docs when conventions change.

Agent prompts (Claude Code, Codex or Gemini) should include the user outcome, route, actual API contract, loading/error/empty requirements and acceptance tests. Require actual verification results. Do not ask an agent to guess backend endpoints. Installed design skills are advisory; Shipwise's approved design always wins.
