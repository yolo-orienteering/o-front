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
├── server/               # Nuxt server routes (minimal)
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
- Data fetching through composables using `directus.request()` with SDK functions (`readItems`, `aggregate`)
- Hybrid local-first strategy: data cached in localStorage, synced with remote

## Composables

| Composable                   | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `useDeparture`               | Departure time formatting                        |
| `useFollowingUserDepartures` | Track followed departures                        |
| `useMyDepartures`            | Manage user's race departures (polls every 1.5s) |
| `useNewsletter`              | Newsletter subscription                          |
| `usePostsFilter`             | Feed/post filtering                              |
| `useRaceFilter`              | Race filtering logic                             |
| `useRaceTerrain`             | Terrain type helpers                             |
| `useRace`                    | Race utilities                                   |
| `useTeleport`                | Portal/teleport utilities                        |
| `useIsDesktop`               | Responsive breakpoint detection                  |

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
