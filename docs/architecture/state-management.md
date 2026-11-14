# State ownership

Local useState owns transient interactions. Context is for shared dependencies, not a default data store. Zustand is not installed because no shared client-state requirement exists.

TanStack Query is configured once per mounted provider. Query keys should be readonly tuples scoped to tenant and feature: ['organizations', tenantId, 'list', filters]. Include every input that affects the response to prevent cache mixing across tenants. Use enabled when prerequisites are missing. Clear user/tenant-specific cache on future session changes.

Queries use queryFn({signal}) and pass signal to http.get. Default staleTime is 30 seconds, not a promise of freshness. Retry at most twice for non-HTTP/network errors and 5xx; do not retry 4xx or cancellation. Keep query functions read-only; override retry for unusual non-idempotent reads. Mutations never retry automatically. On success invalidate relevant tenant-scoped keys; await invalidation when UI depends on fresh data. Do not duplicate cached results in local state or Zustand.

Render LoadingIndicator during initial pending, contextual ErrorState/errorMessage for errors, and honest empty UI for zero results. Keep existing data visible during background refresh and distinguish background errors. URL search params own bookmarkable filters and pagination.
