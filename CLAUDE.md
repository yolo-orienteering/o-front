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
├── composables/          # Reusable Vue composables (11 total)
├── stores/               # Pinia stores
├── types/                # TypeScript types (DirectusTypes.ts)
├── utils/                # Utility functions (DateUtils.ts)
├── assets/css/           # Global SCSS (app.scss)
├── layouts/              # Nuxt layouts (single default layout)
├── server/               # Reserved for future server routes (none currently)
└── public/               # Static assets, favicons
```

## Key Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Build for production
npm run generate  # Generate static site
npm run preview   # Preview production build
npm run lint      # Format with Prettier
```

## Routes

| Route                                                  | Page                |
| ------------------------------------------------------ | ------------------- |
| `/`                                                    | Home                |
| `/feed`                                                | News feed           |
| `/games`                                               | Games listing       |
| `/games/external`                                      | External games      |
| `/races/[raceId]`                                      | Race detail         |
| `/races/[raceId]/departures/category/[raceCategoryId]` | Category departures |
| `/settings`                                            | User settings       |
| `/roadmap`                                             | Roadmap             |
| `/privacy-policy`                                      | Privacy policy      |

## State Management (Pinia Stores)

- **`syncCenter`** — Main app state: user data, followed races, departures. Syncs to localStorage.
- **`useApi`** — Directus SDK client initialization. Provides `directus` client and `getImgUrl()` helper.
- **`useRegion`** — Fetches unique race regions via Directus aggregation.

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
- The feed URL `${apiUrl}/calendar-subscription/{id}/calendar.ics` is handed to the OS as
  `webcal://`. Logic lives in `composables/useCalendarSubscription.ts`.
- The calendar (and every other feature) is **not** gated per-feature. Instead, a single
  global **force-update gate** (see below) guarantees that any native app reaching the UI is
  new enough to handle `webcal://`; in a normal browser (mobile or desktop) the OS handles
  `webcal://` natively. So the subscription section/dialog render unconditionally.

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

## Composables

| Composable                   | Purpose                                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `useDeparture`               | Departure time formatting                                                                                |
| `useFollowingUserDepartures` | Track followed departures                                                                                |
| `useMyDepartures`            | Manage user's race departures (polls every 1.5s)                                                         |
| `useNewsletter`              | Newsletter subscription (via cookie, not backend)                                                        |
| `usePostsFilter`             | Feed/post filtering                                                                                      |
| `useRaceFilter`              | Race filtering logic                                                                                     |
| `useRaceTerrain`             | Terrain type helpers                                                                                     |
| `useRace`                    | Race utilities                                                                                           |
| `useTeleport`                | Portal/teleport utilities                                                                                |
| `useIsDesktop`               | Responsive breakpoint detection                                                                          |
| `useCalendarSubscription`    | Create/manage iCalendar subscriptions (Turnstile)                                                        |
| `useNativeApp`               | Detect native wrapper + version; drives the force-update gate (`updateRequired`, `platform`, `storeUrl`) |

## Coding Conventions

- Use **Vue 3 Composition API** with `<script setup lang="ts">` — no Options API
- All code in **TypeScript**
- Directus schema types are defined in `types/DirectusTypes.ts` — keep them in sync with backend changes
- Components are organized by feature domain, not by type. Naming is mixed (PascalCase like `GameCard.vue` and kebab-case like `feed-carousel.vue`) — prefer **PascalCase** for new components
- Use Quasar components (`QBtn`, `QCard`, `QPage`, etc.) for all UI elements
- Style with **SCSS** and Quasar CSS variables (`var(--q-primary)`, etc.) — no Tailwind
- Brand colors are defined in `app.config.ts` (primary: #264653, secondary: #f4a261)
- Responsive layout: desktop uses side drawer, mobile uses bottom footer navigation
- Locale is German (de-CH) — use Moment.js with German locale for date formatting
- Format code with Prettier (enforced via Husky pre-commit hook)
- Never hardcode the API URL — always use `useRuntimeConfig().public.apiUrl`

## Keeping this doc current

When you make a code change that affects anything described here — stack/deps, pages,
routes, components, composables, stores, env vars, commands, or conventions — **update this
`CLAUDE.md` as part of the same change.** See [root CLAUDE.md](../CLAUDE.md) for the full policy.

## Environment Variables

- `NUXT_PUBLIC_API_URL` — Directus backend URL (local: `http://0.0.0.0:8055`, prod: `https://admin.o-mate.app`)
- `NUXT_PUBLIC_TURNSTILE_SITE_KEY` — Cloudflare Turnstile site key. The test key `1x00000000000000000000AA` always passes verification for local development.
