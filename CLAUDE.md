# O-Mate Frontend — Nuxt 3 + Vue 3

## Project Overview

Frontend for **o-mate**, a Swiss orienteering sports app — and the only real UI in the project (the iOS/Android apps are thin WebView wrappers around it). Built with **Nuxt 3** and **Vue 3 Composition API**, using **Quasar** as the UI component library. Connects to a Directus headless CMS backend. See the [root CLAUDE.md](../CLAUDE.md) for the overall multi-project architecture.

There is **no authentication**: users identify themselves by name + birth year, which the app derives into a `{firstName}{lastName}{birthYear}` identifier to match SOLV start lists.

## Tech Stack

- **Framework:** Nuxt 3.17, Vue 3.5
- **UI Library:** Quasar 2.18 (via nuxt-quasar-ui)
- **State Management:** Pinia 3
- **Backend SDK:** @directus/sdk 18
- **Styling:** SCSS + Quasar CSS variables (no Tailwind)
- **Icons:** Material Icons + MDI v7
- **Maps:** Leaflet 1.9.4
- **Bot protection:** Cloudflare Turnstile (`vue-turnstile`) — for calendar subscriptions
- **Date Handling:** Moment.js (locale: de-CH)
- **Tooling:** Prettier + Husky/lint-staged pre-commit formatting
- **Charts:** Chart.js 4 via vue-chartjs + chartjs-plugin-zoom (pinch-zoom/pan, uses hammerjs) — client-only; registered in `plugins/chart.client.ts`
- **XML parsing:** fast-xml-parser (server-side, in the race-results Nitro route)
- **Language:** TypeScript throughout

## Project Structure

```
frontend/
├── pages/                # File-based routing (Nuxt auto-routing)
├── components/           # Vue components organized by feature domain
│   ├── calendar/         # Calendar subscription dialog/section
│   ├── feed/             # News feed (carousel)
│   ├── filter/           # Generic filter UI
│   ├── games/            # Game cards
│   ├── helper/           # Navigation helpers
│   ├── layout/           # Header, menu, navigation
│   ├── newsletter/       # Mailchimp integration
│   ├── publicTransport/  # SBB timetable widget
│   ├── races/            # Race timeline, filters, departures
│   └── user/             # User profile form
├── composables/          # Reusable Vue composables (16 total)
├── stores/               # Pinia stores
├── types/                # TypeScript types (DirectusTypes.ts)
├── utils/                # Utility functions (DateUtils.ts)
├── assets/css/           # Global SCSS (app.scss)
├── layouts/              # Nuxt layouts (single default layout)
├── server/               # Nuxt server routes (Nitro) — incl. race-results proxy
└── public/               # Static assets, favicons
```

> **Deployment note:** the app is deployed on **Cloudflare Pages (Workers & Pages)** with a
> **server-enabled** Nitro build (`nuxt build`, cloudflare preset) — not static `nuxt generate`.
> This is required so `server/api/*` routes deploy as Pages Functions. Code in server routes must
> be edge-safe: use the global `fetch`/`$fetch` (no axios) and pure-JS libraries (no Node built-ins).

## Key Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Build for production
npm run generate  # Generate static site
npm run preview   # Preview production build
npm run lint      # Format with Prettier
```

## Routes

| Route                                                  | Page                                   |
| ------------------------------------------------------ | -------------------------------------- |
| `/`                                                    | Home                                   |
| `/feed`                                                | News feed                              |
| `/games`                                               | Games listing                          |
| `/games/external`                                      | External games                         |
| `/races/[raceId]`                                      | Race detail                            |
| `/races/[raceId]/departures/category/[raceCategoryId]` | Category departures                    |
| `/races/[raceId]/results`                              | Rangliste (redirects to best category) |
| `/races/[raceId]/results/category/[categoryName]`      | Category ranking + split analysis      |
| `/settings`                                            | User settings                          |
| `/roadmap`                                             | Roadmap                                |
| `/privacy-policy`                                      | Privacy policy                         |
| `/calendar-setup`                                      | Calendar how-to                        |

## State Management (Pinia Stores)

- **`syncCenter`** — Main app state: user data, followed races, departures. Syncs to localStorage.
- **`useApi`** — Directus SDK client initialization. Provides `directus` client and `getImgUrl()` helper.
- **`useRegion`** — Fetches unique race regions via Directus aggregation.

## Composables

| Composable                   | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `useDeparture`               | Departure time formatting                                                                                |
| `useFollowingUserDepartures` | Track followed departures                                                                                |
| `useMyDepartures`            | Manage user's race departures (polls every 1.5s)                                                         |
| `useRace`                    | Race utilities                                                                                           |
| `useRaceFilter`              | Race filtering logic                                                                                     |
| `useRaceTerrain`             | Terrain type helpers                                                                                     |
| `useRaceResults`             | Fetch race results from the `/api/race-results` proxy                                                    |
| `useSplitAnalysis`           | Client-side split-time (Zwischenzeiten) analysis                                                         |
| `useNewsletter`              | Newsletter subscription (via cookie, not backend)                                                        |
| `usePostsFilter`             | Feed/post filtering                                                                                      |
| `useCalendarSubscription`    | Create/manage iCalendar subscriptions (Turnstile); exposes `subscriptionUrl` (webcal) + `icsUrl` (https) |
| `useShareLink`               | Share a URL via WhatsApp/`mailto:` links + Web Share API (`canNativeShare`/`nativeShare`, e.g. Signal)   |
| `useNativeApp`               | Detect native wrapper + version (OS family via `$q.platform`); drives the force-update gate              |
| `useDevicePlatform`          | OS + mobile form factor via Quasar `$q.platform`; `supportsWebcal` branches the calendar flow            |
| `useTeleport`                | Portal/teleport utilities                                                                                |
| `useIsDesktop`               | Responsive breakpoint detection                                                                          |

## API Integration

- Directus SDK with REST protocol, initialized in `stores/useApi.ts`
- API URL configured via `NUXT_PUBLIC_API_URL` env variable (default: `http://0.0.0.0:8055`)
- Data fetching through composables using `directus.request()` with SDK functions (`readItems`, `aggregate`); pages use Nuxt `useAsyncData()` for SSR
- Custom endpoints that aren't part of the SDK use a direct `fetch()` — notably calendar subscriptions (see below)
- Hybrid local-first strategy: data cached in localStorage, synced with remote

### Calendar subscriptions & Turnstile

- Users can subscribe to a calendar of their followed races (iCalendar).
- Creation calls `POST ${apiUrl}/calendar-subscription` via direct `fetch()` (not the SDK),
  gated by a Cloudflare **Turnstile** token (`vue-turnstile`, key `NUXT_PUBLIC_TURNSTILE_SITE_KEY`).
  The Turnstile + create button is factored into `components/calendar/SubscriptionCreator.vue`.
- `composables/useCalendarSubscription.ts` exposes the feed `${apiUrl}/calendar-subscription/{id}/calendar.ics`
  in both forms: `subscriptionUrl` (the `webcal://` twin, handed to the OS) and `icsUrl` (the `https://`
  form you paste into "subscribe by URL" dialogs), plus `urlsForId(id)`.
- **Platform-aware UX** — `composables/useDevicePlatform.ts` exposes `supportsWebcal`, and
  `components/calendar/SubscriptionSection.vue` (used in settings + the prompt dialog) branches on it:
  - **iOS / macOS / Linux** open `webcal://` natively → keep the one-click "Kalender verknüpfen" flow
    (hand the link to the OS) + a copyable webcal URL, with a fallback link to the how-to page.
  - **Windows / Android / everything else** can't rely on `webcal://` → the section instead links to the
    dedicated step-by-step how-to page **`pages/calendar-setup.vue`** (route `/calendar-setup`).
- **`pages/calendar-setup.vue`** is the guided fallback (also the second-chance link from the
  iOS/macOS/Linux flow): if no subscription exists yet it creates one (Turnstile); on **mobile** it nudges
  the user to a **desktop** via a `?sub=<id>` link that carries the subscription across devices (no shared
  localStorage) — sharable by copy / WhatsApp / e-mail / native share (`useShareLink`, the Signal path) —
  and the provider step stays hidden until the user actively chooses to continue on the phone; then the
  user picks their calendar provider (9 Swiss-common providers + a generic fallback) and gets tailored
  "subscribe by URL" instructions with the `.ics` URL to copy.
- The calendar (and every other feature) is **not** gated per-feature. A single global
  **force-update gate** (see below) guarantees that any native app reaching the UI is new enough to
  handle `webcal://`; normal browsers are never gated. So the subscription section/dialog render
  unconditionally.

### Force-update gate (native apps)

- `composables/useNativeApp.ts` reads the `o-mate-app/<version>` User-Agent marker the native
  wrappers append, and exposes `updateRequired`, `platform`, and `storeUrl`.
- `components/AppUpdateGate.vue` (mounted globally in `app.vue`) shows a **persistent,
  non-dismissable** overlay with a store button whenever `updateRequired` is true — i.e. a
  native app below `MIN_REQUIRED_APP_VERSION`, including pre-marker wrappers (old iOS
  `WePublish/`, old/other Android `; wv)`). **Normal browsers are never gated.**
- Bump `MIN_REQUIRED_APP_VERSION` in `useNativeApp.ts` **deliberately** — only when a release
  truly requires it — in lockstep with the native apps' `versionCode`/`CFBundleVersion`. See
  the [root CLAUDE.md](../CLAUDE.md) capability handshake.
- **Prerequisite:** the iOS `storeUrl` has a `<APPLE_APP_ID>` placeholder — fill in the numeric
  App Store ID. Accepted trade-off: visitors opening o-mate.app inside other Android in-app
  browsers (FB/IG) also see the update overlay (their UA is indistinguishable from the old app).

## Race results (Rangliste)

In-app, mobile-first orienteering results with split-time analysis — instead of linking out to o-l.ch.

- **Data source:** o-l.ch serves IOF Data Standard 3.0 XML but **sends no CORS headers**, so the
  browser can't fetch it directly. The Nitro route **`server/api/race-results/[eventId].get.ts`**
  proxies it: it accepts only a numeric `result_event_id` (extracted from a race's `rankingLink`
  via `parseEventId`), builds a fixed o-l.ch URL, fetches with the global `fetch`, parses with
  `fast-xml-parser`, and returns app-friendly JSON (`types/RaceResults.ts`). Edge-cached 5 min.
- **Frontend:** `components/races/results/` — `RaceResultList`/`RaceResultRow` (progressive-disclosure
  ranked list with client-side name search, inverted time-behind bars, and a per-row toggle to
  add/remove a runner from the comparison chart without expanding), `RaceResultSplitsTable`, and the
  two Chart.js views `RaceResultSplitChart` (cumulative time-behind-leader; **linear x-axis spaced by
  the fastest split per control**, so columns reflect leg length — true per-leg distances are NOT in
  the o-l.ch XML — with **pinch-zoom + pan** via `chartjs-plugin-zoom`) + `RaceResultLegChart`.
- **`RaceCategoryCarousel`** — a horizontally-swipeable row of all categories (top-3 podium per
  card). It preselects (scrolls to) the profile user's category and shows them as a highlighted
  4th entry there when they're not already on the podium; otherwise it starts on a random category.
  Each card links to that category's full ranking page.
- **`RaceResultSummary`** (race detail page) = `RaceCategoryCarousel` plus, when there's no profile
  (or while the user is editing), a dismissable prompt that reuses `components/user/UserForm.vue`
  to capture name + birth year. It does **not** embed the full ranking list — that lives only on the
  dedicated category page (`/races/[raceId]/results/category/[categoryName]`).
- **Routes:** `/races/[raceId]/results` redirects to the user's own category when their result is
  found, else shows the `RaceCategoryCarousel` as a category picker. The category page renders the
  full `RaceResultList`.
- **Identity match:** the current user is highlighted/located by comparing each result's composed
  identifier (`${firstName}${lastName}${birthYear}`, lowercased) against `syncCenter.userIdentifier`
  — the same scheme as start lists. No backend storage. The profile form stays visible while typing
  (a `formTouched` flag) so it doesn't vanish the moment the identifier becomes valid.
- **Quick access:** for races today/in the past, the race detail page teleports a filled button
  next to the "Zurück" button (`teleport-right-to-back-btn`) — **Rangliste** (in-app) when a
  `rankingLink` exists, else external **Live-Resultate**; slowly blinks when the race is today;
  **shown on mobile only** (hidden on desktop). Both the Rangliste section and the Anreise map render
  with reserved-height skeletons to avoid layout shift on load.

## Coding Conventions

- Use **Vue 3 Composition API** with `<script setup lang="ts">` — no Options API
- All code in **TypeScript**
- Directus schema types are defined in `types/DirectusTypes.ts` — keep them in sync with backend changes
- Components are organized by feature domain, not by type. Naming is mixed (PascalCase like `GameCard.vue` and kebab-case like `feed-carousel.vue`) — prefer **PascalCase** for new components
- Use Quasar components (`QBtn`, `QCard`, `QPage`, etc.) for all UI elements
- Style with **SCSS** and Quasar CSS variables (`var(--q-primary)`, etc.) — no Tailwind
- **Layout & spacing via Quasar utility classes**, not bespoke CSS: spacing `q-pa-*` / `q-mt-*` /
  `q-mb-*` / `q-my-*`, grids with `row` + `col-*` / `col-sm-*` / `col-md-*`, gaps with
  `q-col-gutter-*`. **Avoid custom scoped CSS with hard-coded pixel values** — reach for a Quasar
  class or `$q` first (rare, accepted exceptions: library containers like the Leaflet map, dialog
  `min/max-width`, content `max-width` for readability)
- **Page top spacing:** a page's root element uses `q-pt-md` so content sits consistently below the
  header (the layout's `<q-page padding>` supplies the base padding) — see `pages/index.vue`,
  `pages/settings.vue`. Don't add ad-hoc top margins/paddings against the header
- **Detect OS / device form factor via Quasar's `$q.platform`** (`useQuasar().platform`), not
  hand-rolled User-Agent regex. It disambiguates Android from Linux, corrects iPadOS's desktop UA,
  and is SSR-aware. The one exception is `useNativeApp`'s custom `o-mate-app/` / `WePublish/` / `wv`
  wrapper markers, which no library exposes
- Brand colors are defined in `app.config.ts` (primary: #264653, secondary: #f4a261)
- Responsive layout: desktop uses side drawer, mobile uses bottom footer navigation
- Locale is German (de-CH) — use Moment.js with German locale for date formatting
- Format code with Prettier (enforced via Husky pre-commit hook)
- Never hardcode the API URL — always use `useRuntimeConfig().public.apiUrl`

## Environment Variables

- `NUXT_PUBLIC_API_URL` — Directus backend URL (local: `http://0.0.0.0:8055`, prod: `https://admin.o-mate.app`)
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key. The test key `1x00000000000000000000AA` always passes verification for local development.

## Keeping this doc current

When you make a code change that affects anything described here — stack/deps, pages,
routes, components, composables, stores, env vars, commands, or conventions — **update this
`CLAUDE.md` as part of the same change.** See [root CLAUDE.md](../CLAUDE.md) for the full policy.
