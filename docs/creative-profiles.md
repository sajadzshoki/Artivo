# Creative Profiles — Artivo

> Designer & photographer public profiles, portfolio and services.
> Data: `shared/data/content.ts` + `shared/data/portfolio.ts` + `shared/data/reviews.ts` + `shared/data/services.ts` (static seeds) · admin overlay (`useOverlay`) · community profiles API (`server/api/profile/creative.*`)
> Related: [`jobs-marketplace.md`](./jobs-marketplace.md) · [`api.md`](./api.md) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27

---

## 1. Profile Model (actual `Creative` type — `shared/types/index.ts`)

```ts
{
  id: string                  // slug e.g. 'leila-farhmand'
  name, role, city: string
  kind: 'designer' | 'photographer'
  rating: number              // 0–5, one decimal
  projectsDone: number
  startingPrice: number       // تومان
  skills: string[]
  bio, about: string
  image?, avatar?, accent     // accent = brand hue used for gradient fallbacks
  featured?: boolean
  portfolio: PortfolioItem[]  // see § 3
  categories: ServiceCategory[]
  stats?: …                   // experience/experienceYears, clients, etc. (seed-dependent)
}
```

> ⚠️ Two overlapping `Creative` interface declarations exist in `shared/types/index.ts` (declaration merging keeps it compiling) — known debt, see [`known-issues.md`](./known-issues.md).

**Sources of profiles (all three merge in the UI):**

1. **Static seeds** (`shared/data/content.ts`) — the featured creatives incl. `leila-farhmand` (demo login link).
2. **Community profiles** — any logged-in user can create/link one via `POST /api/profile/creative` (persisted in the JSON store, delivered through `/api/public/overlay` as `communityCreatives`). Managed at `/profile/creative`.
3. **Admin overrides** — rename/feature/hide via the admin collections (`creative-categories`, or overlay fields).

## 2. Profile Page (`/creatives/[id]` + nested `/portfolio`)

| Section | Content | Source |
|---|---|---|
| Hero | Avatar (letter fallback), name, role, city, rating, stats strip (projects/experience/rating), CTAs: «شروع پروژه با …» (`/create?creative=`), «پروژه‌ی اختصاصی …» (`/projects/new?creative=`), «ذخیره» heart | Creative record |
| Portfolio preview | `PortfolioGallery` grid (photographers get the taller `pg--tall` variant) → `PortfolioCard` → `Lightbox` with keyboard nav | `portfolio: PortfolioItem[]` |
| Services | Services offered by this creative (price, delivery, features) | merged services |
| Reviews | `ReviewList` — client name, rating, text, date | `shared/data/reviews.ts` (**static mock**) |
| Related creatives | Same-kind suggestions | seeds |

`PortfolioItem` shape: `{ id, title, category (ServiceCategory), year, client?, cover, images: LightboxSlide[], description? }`. Multi-image items show a count badge; the lightbox supports arrow keys/Esc.

## 3. Portfolio Image Handling (actual behavior)

- All cover/preview images declare explicit `width`/`height` + CSS `aspect-ratio` + `object-fit: cover` → **no stretching, no layout shift**.
- `loading="lazy" decoding="async"` on below-fold images; `PortfolioCard` renders an icon fallback tile if `@error` fires.
- Images are committed static assets (`public/images/portfolio/**`, pre-compressed ≤ ~250 KB).
- **User uploads for portfolios do not exist** — community profiles link out or omit images (a future upload pipeline is noted in [`known-issues.md`](./known-issues.md)).

## 4. Services (`CreativeService`)

Services power `/services`, `/services/[id]` and profile service sections.

```ts
{ id, title, description, category: ServiceCategory,
  basePrice: number,          // تومان «شروع از»
  deliveryDays: number,
  features: string[],
  cover?, accent, creativeIds: string[], active: boolean }
```

- Seeds: `shared/data/services.ts`; **created** services (via profile API or admin) arrive through `useOverlay` (`createdServices`) and are merged with patches (`serviceOverrides`) minus hidden ids (`hiddenServiceIds`).
- Categories taxonomy: `shared/config/service-categories.ts` (labels + icons shared by filters everywhere).

## 5. Ratings & Reviews (accuracy)

- `rating` is a **static seed number** on profiles/services/spots; user-facing rating *input* exists **only for photography spots** (localStorage, `useSpots`).
- Profile reviews are static demo content — **no review submission, storage or aggregation is implemented**.
- `ARating`/`RatingStars` are display components only.

## 6. Save / Contact Actions

- «ذخیره» heart → `useSavedCreatives` (localStorage `artivo:saved-creatives:v1`), shown in `/saved` and on cards.
- «شروع پروژه با …» pre-fills the wizard; «پروژه‌ی اختصاصی …» goes to the quick-create form (`/projects/new?creative=`) — the creative reference lands in the project description, and only an accepted proposal (Phase 6) formally links a creative to a project.
