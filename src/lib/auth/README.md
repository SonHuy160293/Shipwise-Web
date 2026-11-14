# Authentication boundary

No session exists yet. Select an identity provider and agree on gateway/API contracts before adding an auth provider here. Add route guards at the router boundary, but always enforce authorization on the backend. Decide CORS origins, cookie SameSite/Secure/HttpOnly, CSRF protection and token transport with the backend team. Never persist credentials in localStorage.
