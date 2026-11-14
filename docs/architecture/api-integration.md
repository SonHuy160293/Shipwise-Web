# API integration

No endpoints or DTOs have been invented. VITE_API_BASE_URL is a public /api prefix or HTTP(S) URL; use it for direct local .NET or gateway deployments. Restart Vite after editing env files; production values are embedded at build time.

## Generate real contracts

```powershell
$env:OPENAPI_SPEC = '..\Shipwise\contracts\openapi\shipwise.v1.json'
npm run api:generate
```

The backend repository (sibling folder Shipwise) owns the spec at contracts/openapi/shipwise.v1.json; that file does not exist until the first backend API host ships. HTTP(S) spec URLs also work. The script fails without a spec or on generation errors. Commit generated schema.d.ts separately from handwritten hooks and do not edit it. Pin backend spec versions in CI once contract publishing exists. openapi-typescript generates compile-time types only, not runtime validators.

The native-fetch http client supports get/post/put/patch/delete with body, headers and AbortSignal. It normalizes non-2xx to ApiError without displaying untrusted response bodies, handles 204/205/blank responses, checks JSON content type and rejects malformed JSON. Successful typed JSON relies on the caller's contract; use a Zod schema when runtime validation is required. Return types include undefined for empty responses. Network/abort errors retain their identity; errorMessage provides safe user copy. Never show raw exception messages to users.

Use feature-local query/mutation hooks, generated paths types, real documented paths and tenant-scoped query keys. Pass query cancellation through. Check actual non-empty payloads where required. Do not automatically retry writes. Structured API error fields can be added only after the backend agrees its error contract.

## Future security agreement

Choose identity provider, session lifecycle and transport before implementing auth. No automatic credentials override is applied today. Agree exact CORS origins, cookie credentials/SameSite/Secure/HttpOnly, CSRF defense for cookie-authenticated writes and safe token transport. Prefer server-managed secure sessions where appropriate; never put tokens in localStorage or browser environment variables. Route guards improve UX; the backend always authorizes every request.
