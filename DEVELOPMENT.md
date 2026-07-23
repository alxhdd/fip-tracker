# Development & self-hosting

Technical notes for running, deploying, and contributing to
[FIP Tracker](https://fiptracker.com). For what the project *is* and why, see
[README.md](README.md).

## Stack

- **Server** — Node ≥ 22, Express, and Node's **built-in `node:sqlite`** (no native
  build step, no `better-sqlite3`). One SQLite file in `DATA_DIR`, migrated
  automatically on boot. Sessions are stateless signed HMAC cookies (30 days).
  Security headers (incl. a CSP), a generic error handler, and light per-IP rate
  limiting on the auth/join endpoints live in `server/security.js`.
- **Client** — React 18 + Vite + TypeScript. Custom SVG charts (no chart library),
  a tiny key/value i18n layer, CSS-variable theming. Built to `client/dist` and
  served by the Node server, so it's a single origin — no CORS, one thing to run.
- **Auth** — Google and Facebook OAuth, each optional; the login page shows only the
  providers you've configured. A dev login stand-in exists for local testing.

```
server/   Express API, auth, SQLite schema + migrations, security middleware
client/   React SPA (built to client/dist, served by the Node server)
```

## Run locally

Requires **Node ≥ 22**.

```bash
npm install
cp .env.example .env          # ALLOW_DEV_LOGIN=1 is set for local use
npm run build                 # build the client once
npm start                     # API + client on http://localhost:3000
```

Open http://localhost:3000 and click **Continue with Google** — with no OAuth
configured it creates a throwaway test account so you can try everything.

Live client dev with hot reload (two terminals):

```bash
npm run dev:server            # API on :3000
npm run dev:client            # Vite on :5173, proxies /api + /auth to :3000
```

## Deploy (Docker, behind Caddy)

The repo has a multi-stage `Dockerfile` and a `docker-compose.yml`. On the server:

```bash
git pull
docker compose up -d --build
```

The build runs `npm ci` + the Vite build inside the image, and the server applies
any pending DB migrations on boot — so a deploy is just those two commands. The
database persists in the `fip_data` volume (mounted at `/data`; `DATA_DIR=/data`).

The container publishes `127.0.0.1:3000` so only the reverse proxy can reach it. A
minimal **Caddyfile** terminates TLS and adds HSTS:

```
fiptracker.com {
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    reverse_proxy localhost:3000
}
```

> Node ≥ 22 matters: the app uses `node:sqlite`, which does not exist in Node 20 —
> both `FROM` lines in the Dockerfile must be `node:22-slim` (or newer).

Non-Docker (systemd) deployment works too — run `npm ci && npm run build`, then a
unit that runs `node server/index.js` with `EnvironmentFile=.env`.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `BASE_URL` | yes (prod) | Public URL, e.g. `https://fiptracker.com`. Used for OAuth redirects; enables `Secure` cookies when it starts with `https://`. |
| `NODE_ENV` | recommended | Set to `production` in prod. |
| `PORT` | no | Port to listen on (default `3000`). |
| `DATA_DIR` | no | Folder for the SQLite DB + session secret (default `./data`; `/data` in Docker). **Back this up.** |
| `SESSION_SECRET` | no | Pin the cookie-signing secret. If unset, one is generated once in `DATA_DIR`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google | Enables Google sign-in. |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | for Facebook | Enables Facebook sign-in. |
| `ALLOW_DEV_LOGIN` | no | `1` enables the passwordless test login. **Leave unset in production.** |

### OAuth setup

- **Google** — [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
  → OAuth client (Web). Authorized redirect URI: `https://your-domain/auth/google/callback`.
  Leave *Authorized JavaScript origins* empty (server-side code flow). Publish the
  consent screen to production (non-sensitive scopes need no verification).
- **Facebook** — [developers.facebook.com/apps](https://developers.facebook.com/apps)
  → Facebook Login → Valid OAuth Redirect URI: `https://your-domain/auth/facebook/callback`.

The **Continue with Google** button becomes real OAuth automatically once the
credentials are set — no code change.

### Backups

Everything stateful is in `DATA_DIR` (the `fip_data` volume in Docker): the SQLite
database (`fip-tracker.db` + `-wal`/`-shm`) and `.session-secret`. Back it up, e.g.
`sqlite3 fip-tracker.db ".backup '/backups/fip-YYYY-MM-DD.db'"` on a nightly cron.

## Adding a language

The most useful contribution. Steps:

1. Copy `client/src/i18n/en.ts` to e.g. `de.ts` and translate the values — keep the
   **keys identical** (`pl.ts` is typed against `en.ts`, so parity is enforced at
   build time and missing keys fail the build).
2. Register it in `client/src/i18n/index.tsx` (`dicts` + `Locale` type) and add it to
   the language `<select>` in `client/src/App.tsx`.
3. Translate the long-form prose pages that branch by locale:
   `pages/Guide.tsx`, `pages/Faq.tsx`, `pages/Privacy.tsx`.
4. Allow the new locale in `server/api.js` (`PATCH /api/me`) so it can be saved to a
   user's profile.

Not a developer but want to translate? Just send the translated strings — wiring it
up is quick. Contact [serweryaleksy@gmail.com](mailto:serweryaleksy@gmail.com).

## Data model note

Cats use a membership model (`cat_members`) for co-ownership, with `cat_join_requests`
for the approve-to-join flow and a per-cat `share_code`. Access is by membership;
owner-only actions (delete cat, manage members) are enforced server-side.

## Security

Reviewed hardening lives in `server/security.js` (headers, CSP, rate limiting) and
the session model in `server/auth.js`. Known lower-priority follow-ups (CSRF tokens,
input clamping, revocable sessions) are tracked privately; PRs welcome.
