# Routing

createBrowserRouter uses AppLayout and nested Outlet routes. / redirects with replace to /organizations. /organizations, /projects, /sprint-planning, /settings and /profile are honest placeholders. * renders 404. Page modules are lazy-loaded; the small router and shell are eager. /dev/form-example is registered only when import.meta.env.DEV is true and its module is removed from production builds.

To add a route, export a page from its feature, add a lazy import and route entry in app/router/router.tsx, then add navigation metadata only if needed. A future authenticated layout can wrap protected children once a real auth provider/contract exists. Never use that as backend authorization.

Use useSearchParams for pagination/filter/sort/search. Parse values with Zod or explicit defaults; update URL on user intent and avoid a mirrored store. Example: const [params, setParams] = useSearchParams(); setParams({page:'2'}). Preserve unrelated parameters when required and reset page when filters change. Static hosting requires fallback to index.html for deep links.
