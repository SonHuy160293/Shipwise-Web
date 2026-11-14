# Architecture

The dependency direction is app → features/shared, features → shared, shared → technical infrastructure. Shared code never imports features. ESLint forbids imports of feature internals through @/features/name/subpath; code review must also catch relative cross-boundary imports and cycles.

app owns composition (QueryProvider, rendering boundary, router, shell). components/ui contains shadcn primitives; components/layout composes shared navigation/page framing; components/shared contains loading and recoverable error UI. features owns future vertical capabilities. lib is technical code, config validates environment input.

Unlike a .NET server, a React app is a tree of declarative render functions, not a request pipeline with controller/service/repository layers. Props move data downward and events move intent upward. Hooks compose behavior; providers supply genuinely shared dependencies. Do not introduce DI containers or repositories for fetch wrappers. Rendering should stay pure; effects synchronize with external systems, not calculate derived state.

React local state owns shell toggles. TanStack Query owns future asynchronous server data. Global RenderBoundary catches rendering errors; query/mutation failures are handled near their action with friendly messages. Lazy routes display a loading status. 404 is explicit. There is no backend or auth integration yet.
