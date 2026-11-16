# Design proposals

A design proposal shows how a feature's screens work before any production code is written. Gemini writes it from the draft spec; Claude Code folds it into the spec's "UI and states" section and checks it against the API contract; a human approves the spec. The process is in ../Shipwise/docs/workflow.md.

One folder per spec, named like the spec: `docs/design/proposals/NNNN-slug/`.

## When one is needed

| Change                                                   | Proposal                                                  |
| -------------------------------------------------------- | --------------------------------------------------------- |
| Text or small style change                               | None                                                      |
| Basic form or list that follows an existing page pattern | User flow and the list of screen states                   |
| New page or dashboard                                    | The above plus layout for 375, 768 and 1440px             |
| Complex multi-step flow or board                         | The above plus a standalone HTML prototype with mock data |

## Contents

`proposal.md`:

- **Flow:** the steps a user takes, as a Mermaid flowchart or a numbered list, including where they come from and where they land.
- **Screens:** for each screen, its route, the components reused from src/components, and the layout at 375, 768 and 1440px.
- **States:** for each screen, every state that applies: loading, empty, success, validation error, request failure with retry, submitting or disabled, and permission-denied. Say what the user sees and can do in each.
- **Data needed:** every field each screen shows or sends, and every action it triggers. Mark anything the draft API contract does not provide; never invent a field.
- **Accessibility:** keyboard order, focus after each action, labels and announcements.
- **Open questions and simplifications:** what you would cut or change in the requirements, and why.

`prototype.html`, only when the table asks for it: one self-contained file with inline styles and scripts, no network requests and no dependencies. It uses mock data and says so on the page. It follows DESIGN.md tokens and is never imported by production code.

## Rules

- Read the draft spec, DESIGN.md and the existing components first. Reuse before proposing anything new.
- A proposal changes no file under src. Token or DESIGN.md changes are listed as requests for human approval, not applied.
- Run npm run format before committing so the files pass the format check.
- After the spec is approved, the spec is the source of truth. Change the design through a spec change, not by editing the proposal.
