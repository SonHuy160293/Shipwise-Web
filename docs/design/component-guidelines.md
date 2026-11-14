# Component guidelines

DESIGN.md is authoritative. Use semantic Tailwind classes rather than inline colors. components/ui contains shadcn source, customized minimally for Shipwise targets and tokens. Layout compositions belong in components/layout, domain-agnostic loading/error UI in shared. Feature-specific UI stays in its feature.

PageContainer sets width/gutters; PageHeader sets hierarchy. White cards use thin borders. Icons complement labels and hide from assistive tech unless they supply the only accessible name. Buttons need action labels, visible focus and suitable touch targets. Radix supplies menu/dialog focus handling; retain its title/description and keyboard behavior. Use linked form errors. Avoid disabled fake business buttons; explain planned capability with text.

Change DESIGN.md and globals.css together, run npm run design:lint and inspect screenshots. Design lint checks the spec, not all CSS usage. Use table text at 14px and tabular-nums for future data tables.
