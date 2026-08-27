# Photography Spots & Neshan Map — Artivo

> `/spots` (map explorer) · `/spots/[id]` · `/spots/new` — plus the swappable map layer.
> Code: `app/pages/spots/**` · `app/composables/{useSpots,useMapProvider,useUserLocation}.ts` · `shared/data/spots.ts` · `server/api/neshan/reverse.get.ts`
> Related: [`authentication.md`](./authentication.md) (env handling) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27

---

## 1. Map Integration (swappable by design)

`app/composables/useMapProvider.ts` exposes a **`MapController` interface** — UI code never talks to Neshan directly:

```ts
interface MapController {
  setCenter(p: { lat, lng }, zoom?): void
  setMarkers(markers: { id, lat, lng }[]): void
  onMarkerClick(cb: (id: string) => void): void
  onMapClick(cb: (p: { lat, lng }) => void): void
  destroy(): void
  provider: 'neshan' | 'none'
}
```

- **Provider `neshan`** — loads the Neshan Web SDK **v1.1.0** (JS+CSS) lazily into `<head>` on first use (12 s timeout), initializes with the **public** map key.
- **Provider `none`** — no key needed: components render a functional placeholder (list-mode explorer still fully usable). This is why the app works with zero configuration.
- **Adding a provider** (Mapbox/OSM…): add a branch in `createMap`, return the same `MapController`. **Never** call provider SDKs from components.

**Reverse geocoding** (address for a picked coordinate) is a **server proxy**: `GET /api/neshan/reverse?lat&lng` → calls `https://api.neshan.org/v5/reverse` with the **secret** key server-side. Graceful responses `{ ok:false, reason:'neshan-not-configured' | 'neshan-unavailable' }` — the spot form falls back to manual address entry (toast: «سرویس نشانی در دسترس نیست»).

## 2. Environment Variables

In `nuxt.config.ts → runtimeConfig` (never hardcoded):

| Env var | Scope | Purpose |
|---|---|---|
| `NUXT_NESHAN_API_KEY` | server-only | Neshan **REST** key for reverse geocoding proxy |
| `NUXT_PUBLIC_NESHAN_MAP_KEY` | public | Neshan **Web SDK** key for map tiles; empty → `none` provider (placeholder map) |
| `NUXT_PUBLIC_NESHAN_PROVIDER` | public | `neshan` (default) or `none` |
| `NUXT_PUBLIC_NESHAN_SDK_URL` / `_SDK_CSS` | public | SDK URLs (defaults pinned to v1.1.0 static CDN) |

Example `.env` (see `.env.example`; **never commit real keys**):

```env
NUXT_NESHAN_API_KEY=your_neshan_api_key_here
NUXT_PUBLIC_NESHAN_MAP_KEY=your_neshan_web_key_here
```

**Setup for another developer:** get keys from the [Neshan developer panel](https://neshan.org) (one *web service* key for REST, one *browser* key for Web SDK), put them in `.env`, restart `npm run dev`. Without them the app still runs — the map shows the no-key placeholder and address lookup degrades gracefully.

## 3. Spot Model (actual `PhotoSpot`)

```ts
{
  id, name, city, address, description, tip: string
  bestTime: string                 // e.g. 'غروب' — best photography time
  location: { lat: number, lng: number }
  categories: SpotCategoryId[]     // taxonomy in shared/config/spot-categories.ts
  tags: string[]
  photos: SpotPhoto[]              // { url, author, createdAt? }
  rating: number                   // aggregate (seed or local computation)
  ratingsCount: number
  accent: string                   // brand hue for gradient fallback
  image?: string                   // optional cover (else accent gradient)
  featured?: boolean
  userAdded?: boolean              // added by a user (localStorage)
}
```

## 4. Pages & Features (actual behavior)

| Page | Features |
|---|---|
| `/spots` | Split explorer (map + list on ≥900 px; tabbed/stacked on mobile), category filters, city & search, distance from user (`haversineKm`, `useUserLocation` via browser geolocation), sort, saved filter. Marker click ↔ list selection sync; **best-time** & rating badges on cards |
| `/spots/[id]` | Photo gallery (user photos merged), rating widget (**localStorage** `artivo:spot-ratings:v1`), best-time/tip/address cards, mini-map, «افزودن عکس» (`PhotoUploader`, data-URL ≤ 500 KB → `artivo:spot-photos:v1`) |
| `/spots/new` | Form: name/city/description/tip/**bestTime**, categories, tags; **map-click coordinate picking** + reverse-geocoded address (manual fallback); photos via `PhotoUploader`; saved to `artivo:user-spots:v1` (**localStorage, not the server**) |

Admin control: hide/feature spots (`/admin/collection/spots` overrides + `hiddenSpotIds`/`featuredSpotIds` in the overlay).

## 5. Accuracy Notes

- Spots = **static seeds + localStorage user content + admin overlay**; there is **no spots database table / API** yet (see [`database.md`](./database.md) recommended model).
- Ratings: seeds are static; user rating stored **per browser only** and locally merged with the seed average.
- User photos are base64 `data:` URLs in localStorage → device-local by design until a real upload pipeline exists.
- Map works fully offline from Neshan keys (placeholder mode) — CI/demo environments need zero secrets.
