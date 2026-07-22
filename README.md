# 🐈 FIP Tracker

A free, self-hostable web app for tracking a cat through **FIP** (feline
infectious peritonitis) — across all three phases: **monitoring** (suspected /
pre-diagnosis), **treatment**, and **post-treatment observation**.

Built for caregivers, not for profit. Log the things that matter day to day, see
the trends that actually reveal how treatment is going, print a clean report for
your vet, and share a read-only view with your FIP support group. English 🇬🇧 and
Polish 🇵🇱 out of the box, light & dark theme.

> ### ⚕️ Not medical advice
> FIP treatment is a fast-moving, largely off-label field. This app is a
> **tracking aid** to help you and your vet see trends. It does **not** diagnose,
> prescribe, or replace veterinary care. Dosing and treatment decisions belong to
> your vet and an experienced FIP support group.

---

## Features

- **Three-phase model** — monitoring → treatment (an 84-day countdown) →
  observation (a 12-week relapse watch), with phase-aware guidance on each.
- **Daily log** — weight, temperature (auto fever-flagging), appetite, energy,
  interest in toys & treats (0–5 scores), stools (count + 1–7 consistency),
  vomiting, medication given, a grouped symptom checklist (general / eyes /
  neurological / abdomen), and free-text notes. One entry per day, editable.
- **Trends** — weight, temperature (with the normal band and fever line shaded),
  appetite/energy/interest, and stools over 14 / 30 / 90 days or all-time.
  Treatment- and observation-start are marked on every chart. Hover/tap for exact
  values. Custom SVG charts — no chart library.
- **Bloodwork** — A:G ratio (auto-computed from albumin ÷ globulin), globulin,
  albumin, total protein, hematocrit, lymphocyte/neutrophil %, WBC, bilirubin,
  ALT, AST, AGP — with recovery-target reference lines and trend charts for the
  two clearest response signals (A:G, and globulin vs albumin).
- **Dry-FIP aware** — for dry / ocular / neurological cats (where bloodwork can
  look near-normal and clinical signs matter most) the app emphasises the eye and
  neuro symptoms and charts weight against appetite. A relapse watch highlights
  the high-risk first ~60 days after treatment.
- **Vet report** — a clean, one-page printable summary (key figures + charts +
  bloodwork + recent log). Print it or save as PDF straight from the browser.
- **Read-only sharing** — one tap creates a link your vet or FB FIP group can view
  (never edit), disableable anytime. Only the shared cat is exposed.
- **Live demo** — `/demo` shows two weeks of sample data so people can look around
  before signing up.
- **Multi-cat**, per-cat breed, sex, birth date, treatment plan + dose helper.
- **Sign-in with Google / Facebook** so records persist and follow the user across
  devices and browsers.
- **Optional, opt-in FIP research** — users may consent to share **de-identified**
  records for research. Off by default; never sold or mined. See *Privacy* below.
- **i18n (EN + PL)** and light/dark theme.

The clinical defaults (temperature ranges, A:G thresholds, dosing-by-form, the
84-day treatment / 12-week observation windows, the dry-FIP symptom set) follow
the UC Davis / Dr. Niels Pedersen GS-441524 protocols and FIP caregiver
communities (FIP Warriors, FIP Advocates, fip-support.org). The in-app
**How to use** and **FIP guide** pages explain everything in plain language.

---

## Tech & architecture

- **Server** — Node ≥ 22, Express, and the **built-in `node:sqlite`** module (no
  native build step, no `better-sqlite3`). A single SQLite file in `DATA_DIR`,
  migrated automatically on boot. Sessions are stateless signed HMAC cookies.
- **Client** — React 18 + Vite + TypeScript. Custom SVG charts, a tiny key/value
  i18n layer, CSS-variable theming. Built to `client/dist` and served by the Node
  server (single origin, so no CORS and no separate host to run).
- **Auth** — Google and Facebook OAuth, each optional; the login page shows only
  the providers you've configured. A dev login stand-in lets you test the whole
  app before OAuth is set up.

### Project layout

```
server/
  index.js        Express app: JSON, sessions, routes, static client, SPA fallback
  db.js           node:sqlite connection + schema migrations (v1→v3)
  auth.js         OAuth (Google/Facebook), dev login, HMAC session cookies
  api.js          REST API: cats, entries, bloodwork, sharing, CSV export
  env.js          minimal .env loader (no dependency)
client/
  index.html, vite.config.ts, tsconfig.json
  src/
    main.tsx, App.tsx        bootstrap + routing + top bar
    api.ts                   typed API client
    fipConfig.ts             clinical constants (scores, symptoms, markers, breeds…)
    theme.css                design tokens + all styles
    i18n/                    en.ts, pl.ts, index.tsx (provider + t())
    components/              Chart.tsx, ui.tsx (Modal, ScoreInput, BreedInput…), AccountModal.tsx
    lib/stats.ts             trend/phase/streak computations
    pages/                   Landing, Login, Demo, CatsList, CatDashboard,
                             SharedView, Guide, Faq, Report
    pages/tabs/              Overview, DailyLog, Trends, BloodworkTab, SettingsTab
```

---

## Run locally

Requires **Node ≥ 22**.

```bash
npm install
cp .env.example .env          # ALLOW_DEV_LOGIN=1 is already set for local use
npm run build                 # build the client once
npm start                     # serves API + client on http://localhost:3000
```

Open http://localhost:3000 and click **Continue with Google** — with no OAuth
configured it creates a throwaway test account so you can try everything.

For live client development with hot reload, run two terminals:

```bash
npm run dev:server            # API on :3000
npm run dev:client            # Vite on :5173, proxies /api and /auth to :3000
```

---

## Deploy on a VPS

1. **Install Node ≥ 22** (needed for `node:sqlite`) — via
   [NodeSource](https://github.com/nodesource/distributions) or `nvm`.

2. **Get the code, install, build:**
   ```bash
   git clone <your-repo> /opt/fip-tracker && cd /opt/fip-tracker
   npm ci                       # installs everything (Vite etc. are needed to build)
   npm run build                # produces client/dist
   npm prune --omit=dev         # optional: drop dev tooling now that the build exists
   ```
   > The Vite build needs devDependencies, so install them first, build, and only
   > then prune if you want a lean runtime. The server itself only needs `express`.

3. **Configure `.env`** (see `.env.example` and the table below). At minimum set
   `BASE_URL` to your `https://` domain and add the Google credentials. **Remove
   `ALLOW_DEV_LOGIN`** in production.

4. **Run it under a process manager.** A systemd unit is simplest:
   ```ini
   # /etc/systemd/system/fip-tracker.service
   [Unit]
   Description=FIP Tracker
   After=network.target

   [Service]
   WorkingDirectory=/opt/fip-tracker
   ExecStart=/usr/bin/node server/index.js
   EnvironmentFile=/opt/fip-tracker/.env
   Restart=always
   User=www-data

   [Install]
   WantedBy=multi-user.target
   ```
   ```bash
   sudo systemctl enable --now fip-tracker
   ```

5. **Put it behind TLS with a reverse proxy.** Caddy is a two-line config and gets
   HTTPS automatically:
   ```
   # Caddyfile
   fip.example.com {
       reverse_proxy localhost:3000
   }
   ```
   (nginx + certbot works equally well — proxy your domain to `localhost:3000`.)

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `BASE_URL` | yes (prod) | Public URL, e.g. `https://fip.example.com`. Used for OAuth redirects; enables `Secure` cookies when it starts with `https://`. |
| `PORT` | no | Port to listen on (default `3000`). |
| `DATA_DIR` | no | Folder for the SQLite DB + session secret (default `./data`). **Back this up.** |
| `SESSION_SECRET` | no | Pin the cookie-signing secret. If unset, one is generated once in `DATA_DIR`. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for Google | Enables Google sign-in. |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | for Facebook | Enables Facebook sign-in. |
| `ALLOW_DEV_LOGIN` | no | `1` enables the passwordless test login. **Leave unset in production.** |

### OAuth setup

- **Google** — [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
  → create an OAuth client (Web). Authorized redirect URI:
  `https://your-domain/auth/google/callback`. Put the ID/secret in `.env`.
- **Facebook** — [developers.facebook.com/apps](https://developers.facebook.com/apps)
  → add Facebook Login → Valid OAuth Redirect URI:
  `https://your-domain/auth/facebook/callback`.

Enable only what you configure — the login page shows the buttons that are set up.
Once Google is configured, the **Continue with Google** button becomes real OAuth
automatically (no code change).

### Backups

Everything stateful lives in `DATA_DIR` (default `./data`): the SQLite database
(`fip-tracker.db` + its `-wal`/`-shm` files) and `.session-secret`. Back that
folder up (e.g. a nightly `cp`/`rsync` or `sqlite3 .backup`). To reset the app,
stop the server and delete the folder.

---

## Privacy & data ownership

Self-hosted: the data lives on **your** VPS, in your SQLite file. Users sign in
only so their records persist and follow them across devices — nothing is tracked
beyond what's needed to run the app, and each user sees only their own cats (the
API enforces ownership on every request).

**Optional research consent.** Users can opt in (a first-login prompt, and a
toggle under **Account**) to allow their cat's **de-identified** records to be
used for FIP research. It is off unless chosen, changeable anytime, and never
changes how the app works. Stored per-user as `research_consent`
(NULL = undecided, 0 = declined, 1 = consented). If you intend to actually share
data with a researcher, export only the measurement rows and **never** the
`users` table's identifying fields (name, email, provider IDs) or cat names.

---

## Adding a language

1. Copy `client/src/i18n/en.ts` to e.g. `de.ts` and translate the values (keep the
   keys identical — `pl.ts` is typed against `en.ts`, so parity is enforced).
2. Register it in `client/src/i18n/index.tsx` (`dicts` + `Locale` type) and add it
   to the language `<select>` in `client/src/App.tsx`.
3. The long-form prose pages (`pages/Guide.tsx`, `pages/Faq.tsx`) branch by
   locale — add a section for the new language.
4. Extend the allow-list in `server/api.js` (`PATCH /api/me`) so the new locale
   can be saved to the user's profile.

---

## Dev tooling

`playwright-core` is listed under `devDependencies` — it was used to drive a local
Chrome for visual/screenshot testing during development. It is **not** part of the
running app and is skipped by `npm ci --omit=dev` on the server. Remove it from
`package.json` if you don't want it.

---

## License

No warranty. Use freely for the benefit of cats and their people. 🐾
