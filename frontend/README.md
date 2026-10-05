# Bureaucracy frontend

Copy `.env.example` to `.env.local` when the frontend, backend, or Keycloak
servers use different URLs. The app uses Keycloak's Authorization Code flow
with PKCE and redirects unauthenticated visitors to the `bureaucracy` realm.
API requests carry the access token in the `Authorization` header; tokens are
never placed in application URLs.

The Keycloak client must allow the frontend origin and redirect paths. The
committed `keycloak/realm-export.json` already includes the local development
and preview URLs.

Both the Vite development server and production preview server use the shared
certificate under `../certs`. Generate it with `../certs/generate.sh` (or
`..\certs\generate.ps1` on Windows) and trust `bureaucracy-ca.crt` before opening
the application. Development uses <https://localhost:5173>; production preview
uses <https://drevi-pc:4173> by default.
