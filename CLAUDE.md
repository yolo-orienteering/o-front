# O-Mate Frontend — Nuxt 3 + Vue 3

## Project Overview

Frontend for **o-mate**, a Swiss orienteering sports app. Built with **Nuxt 3** and **Vue 3 Composition API**, using **Quasar** as the UI component library. Connects to a Directus headless CMS backend.

## Tech Stack

- **Framework:** Nuxt 3.17, Vue 3.5
- **UI Library:** Quasar 2.18 (via nuxt-quasar-ui)
- **State Management:** Pinia 3
- **Backend SDK:** @directus/sdk 18
- **Styling:** SCSS + Quasar CSS variables (no Tailwind)
- **Icons:** Material Icons + MDI v7
- **Date Handling:** Moment.js (locale: de-CH)
- **Charts:** Chart.js 4 via vue-chartjs + chartjs-plugin-zoom (pinch-zoom/pan, uses hammerjs) — client-only; registered in `plugins/chart.client.ts`
- **XML parsing:** fast-xml-parser (server-side, in the race-results Nitro route)
- **Language:** TypeScript throughout

## Project Structure

```
frontend/
├── pages/                # File-based routing (Nuxt auto-routing)
├── components/           # Vue components organized by feature domain
│   ├── feed/             # News feed (carousel)
│   ├── filter/           # Generic filter UI
│   ├── games/            # Game cards
│   ├── helper/           # Navigation helpers
│   ├── layout/           # Header, menu, navigation
│   ├── newsletter/       # Mailchimp integration
│   ├── publicTransport/  # SBB timetable widget
│   ├── races/            # Race timeline, filters, departures
│   └── user/             # User profile form
├── composables/          # Reusable Vue composables (10 total)
├── stores/               # Pinia stores
├── types/                # TypeScript types (DirectusTypes.ts)
├── utils/                # Utility functions
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

## State Management (Pinia Stores)

- **`syncCenter`** — Main app state: user data, followed races, departures. Syncs to localStorage.
- **`useApi`** — Directus SDK client initialization. Provides `directus` client and `getImgUrl()` helper.
- **`useRegion`** — Fetches unique race regions via Directus aggregation.

## API Integration

- Directus SDK with REST protocol, initialized in `stores/useApi.ts`
- API URL configured via `NUXT_PUBLIC_API_URL` env variable (default: `http://0.0.0.0:8055`)
- Data fetching through composables using `directus.request()` with SDK functions (`readItems`, `aggregate`)
- Hybrid local-first strategy: data cached in localStorage, synced with remote

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

## Composables

| Composable                   | Purpose                                               |
| ---------------------------- | ----------------------------------------------------- |
| `useDeparture`               | Departure time formatting                             |
| `useFollowingUserDepartures` | Track followed departures                             |
| `useMyDepartures`            | Manage user's race departures (polls every 1.5s)      |
| `useNewsletter`              | Newsletter subscription                               |
| `usePostsFilter`             | Feed/post filtering                                   |
| `useRaceFilter`              | Race filtering logic                                  |
| `useRaceTerrain`             | Terrain type helpers                                  |
| `useRace`                    | Race utilities                                        |
| `useRaceResults`             | Fetch race results from the `/api/race-results` proxy |
| `useSplitAnalysis`           | Client-side split-time (Zwischenzeiten) analysis      |
| `useTeleport`                | Portal/teleport utilities                             |
| `useIsDesktop`               | Responsive breakpoint detection                       |

## Coding Conventions

- Use **Vue 3 Composition API** with `<script setup lang="ts">` — no Options API
- All code in **TypeScript**
- Directus schema types are defined in `types/DirectusTypes.ts` — keep them in sync with backend changes
- Components are organized by feature domain, not by type
- Use Quasar components (`QBtn`, `QCard`, `QPage`, etc.) for all UI elements
- Style with **SCSS** and Quasar CSS variables (`var(--q-primary)`, etc.) — no Tailwind
- Brand colors are defined in `app.config.ts` (primary: #264653, secondary: #f4a261)
- Responsive layout: desktop uses side drawer, mobile uses bottom footer navigation
- Locale is German (de-CH) — use Moment.js with German locale for date formatting
- Format code with Prettier (enforced via Husky pre-commit hook)
- Never hardcode the API URL — always use `useRuntimeConfig().public.apiUrl`

## Environment Variables

- `NUXT_PUBLIC_API_URL` — Directus backend URL (local: `http://0.0.0.0:8055`, prod: `https://admin.o-mate.app`)
