# Getting started for a .NET developer

Install Node 24 LTS and npm. Run npm ci, copy .env.example to .env.local, then npm run dev. Vite serves and hot-reloads source; it is not the API server. npm run build produces static files under dist, similar to publishing client assets rather than running ASP.NET.

Read architecture/overview.md and DESIGN.md before editing. main.tsx mounts React; app/app.tsx composes providers; router selects a page and AppLayout supplies the shell. JSX describes desired UI, not imperative DOM mutations. A state update schedules a render; keep state minimal and derive other values in render.

Use npm run check before committing and npm run test:e2e for UI changes. See adding-a-feature.md for the first vertical slice.

On Windows, stop Vite/preview and test watch processes before running npm ci. Native CSS modules can stay locked by a running Node process and cause EPERM; stop only the relevant project process, then retry the install.
