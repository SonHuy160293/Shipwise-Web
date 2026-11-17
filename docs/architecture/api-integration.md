# API integration

`VITE_API_BASE_URL` is a public API prefix, defaulting to `/api`. An absolute
deployment URL must include that prefix, for example `https://host/api`. Feature
requests use paths relative to the prefix, such as `/v1/auth/register`. Restart
Vite after editing env files; production values are embedded at build time.

In development, Vite forwards `/api` unchanged to the Gateway on
`http://127.0.0.1:19090`; the Gateway forwards registration to the Identity API
on port 19091. Start both backend hosts using the backend README instructions.
The browser calls its own Vite origin, so this route needs no browser CORS
override. The dev proxy is not included in the production build; deployment
must route `/api` to its Gateway or configure the public API URL.

## Generate real contracts

```powershell
$env:OPENAPI_SPEC = '..\Shipwise\contracts\openapi\shipwise.v1.json'
npm run api:generate
```

The backend repository (sibling folder Shipwise) owns
`contracts/openapi/shipwise.v1.json`, first published by spec 0001 task 1.
HTTP(S) spec URLs also work. Set `OPENAPI_SPEC` in the shell: the generator does
not load `.env` files. It fails without a spec or on generation errors. Commit
generated `schema.d.ts` separately from handwritten hooks and do not edit or
format it manually. Pin backend spec versions in CI once contract publishing
exists. `openapi-typescript` generates compile-time types only, not runtime
validators.

The native-fetch HTTP client supports get/post/put/patch/delete with body,
headers and `AbortSignal`. Non-2xx responses become `ApiResponseError`, a
subclass of the existing `ApiError` under `src/lib/api` that preserves current
retry and safe-message behavior. A runtime-validated failure envelope exposes
`code` and field `errors`; a nonnegative safe-integer `Retry-After` delta is
available as `retryAfterSeconds`. Missing, malformed and non-JSON error bodies
fall back to the status alone. Server message/trace text is discarded; field
message strings are metadata and must never be rendered directly.

The client handles 204/205/blank responses, checks JSON content type and rejects
malformed JSON. Successful typed JSON relies on the caller's contract; use a
Zod schema when runtime validation is required. Return types include
`undefined` for empty responses. Network/abort errors retain their identity;
`errorMessage` provides safe user copy. Never show raw exception messages.

Use feature-local query/mutation hooks, generated `paths` types, real documented
paths and tenant-scoped query keys. Pass query cancellation through. Check
actual non-empty payloads where required. Do not automatically retry writes.

## Registration handoff (spec 0001 task 2)

The public `@/features/auth` entry exports:

- `registrationSchema`, `registrationFieldMessages`, `RegistrationInput` and
  field/error types. Validation matches the spec and backend, including Unicode
  whitespace trimming for email/name, exactly one `@` and a dot after it, no
  whitespace in email, no control characters in names, and an untrimmed
  12–128-character password. Case is preserved; the backend normalizes identity.
- `registerUser(input, { signal })`, which posts the three validated fields and
  runtime-validates the success envelope and UUID before returning `{ userId }`.
  It preserves cancellation and wraps other failures in `RegistrationError`.
- `useRegisterMutation()`, a feature-local TanStack mutation with retries off
  and `gcTime: 0`. `mutateAsync(input)` returns the user id; it creates no session
  and invalidates no unrelated queries.
- `mapRegistrationError(error)`, returning a discriminated `RegistrationFailure`:
  `validation` (400, known field names mapped to local messages), `email-taken`
  (409, email error), `rate-limited` (429, optional seconds and wait message),
  `unavailable` (404), or `failure` (network, 413, 5xx, unknown/malformed results).
  Status and agreed code must match. No raw server text is shown.

Task 3 consumes the hook and schema, renders the approved states, and sets field
errors from `details.fieldErrors` or the safe mapper. Block duplicate submits
while pending. On success, keep the submitted email for the confirmation,
clear the form's password, and call mutation `reset()` to release mutation
variables (which otherwise include the password while observed). Inactive
mutations are removed immediately; do not persist or log mutation state.

`/register` is lazy-loaded outside `AppLayout`, with a minimal `PublicLayout`
containing a skip link, wordmark and focusable main landmark. The page and public
layout are task 2 stubs; task 3 owns their finished presentation. No form or
business action is exposed by the stub.

## Future security agreement

Registration uses the public Identity endpoint from the agreed contract, with no
authorization header or session storage. Sign-in, session lifecycle and transport
remain out of scope. No automatic credentials override is applied. Agree exact
CORS origins, cookie credentials/SameSite/Secure/HttpOnly, CSRF defense for
cookie-authenticated writes and safe token transport before adding sessions.
Prefer server-managed secure sessions where appropriate; never put tokens in
localStorage or browser environment variables. Route guards improve UX; the
backend always authorizes every request.
