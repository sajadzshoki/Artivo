# CHANGELOG — Artivo

> History reconstructed from the repository's actual git history and code — no invented dates or events.
> Development happened as six feature phases plus a polish pass on branch `arena/01a042e5-artivo` (base: initial commit `ef260b4`).

**Last Updated:** 2026-08-27 · Format inspired by Keep a Changelog; status labels: ✅ Implemented · 🟡 Partial · 🔜 Planned

---

## Current State (HEAD `5f3c5f0`, 2026-08-27)

A Persian, RTL, mobile-first creative marketplace (Nuxt 4 + Vue 3 + TypeScript, strict). Six phases **implemented and pushed**; dev data in a JSON file store (`.data/`, gitignored); **payments not implemented (by decision)**. Validation status at HEAD: `nuxt typecheck` 0 errors · `nuxt build` clean · full project-lifecycle E2E green · all routes verified.

## Major Implemented Areas

| Area | Highlights | Status |
|---|---|---|
| Design system & shell | Editorial ivory/coral light theme, 21 `A*` primitives, RTL-first, mobile bottom nav + FAB, immersive layouts, a11y pass (contrast, focus, skip-link, touch targets) | ✅ |
| Client wizard (`/create`) | 8 steps, resumable draft (localStorage), live **real** price estimate, per-section edit from review | ✅ (submission stored client-side 🟡) |
| Pricing engine | Centralized formula (base × size × complexity × urgency + add-ons, minimum floor, 10k rounding), admin-editable live via `/admin/pricing` | ✅ |
| Creative profiles & portfolio | Directory, profile + nested portfolio w/ lightbox, services marketplace, save-to-favorites; community profiles via API | ✅ (reviews are static seeds 🟡) |
| Jobs marketplace | Search/filters/sort/paging, bottom-sheet filters, rich briefs, proposal UX | ✅ (job data static + admin overlay; proposals localStorage 🟡) |
| Photography spots + Neshan map | Swappable `MapController` (`neshan`/`none`), server-proxied reverse geocoding, map explorer, user spots/photos/ratings | ✅ (user content localStorage 🟡) |
| Authentication | Register/login (identifier+password), OTP login/verify (Kavenegar in prod, dev code `1111`), password forgot/reset/change, cookie sessions (scrypt), SSR session hydration | ✅ |
| Admin panel | Stats, live pricing editor + reset, registry-driven collections (font-packs, palettes, categories, services, users), overlay hide/feature/patch of static content | ✅ |
| Projects (Phase 6) | 8-state lifecycle, proposals, delivery with revision-aware timeline, sticky-CTA workspace, role-switched dashboard | ✅ |
| Chat & notifications (Phase 6) | Project-linked threads, optimistic send, read receipts, typing dots, file attachments; notification feed + header/bottom-nav badges | ✅ (polling, not WebSocket 🟡) |
| Saved hub | Jobs / creatives / spots in one page | ✅ (localStorage 🟡) |

## History (from git)

| Commit | Phase | Content |
|---|---|---|
| `ef260b4` | — | Initial commit |
| `3ace2c4` | **Phase 1** | Artivo creative marketplace foundation — Nuxt 4 + Vue 3 + TS, design system, landing, services, wizard skeleton |
| `8f47ed3` | **Phase 2** | Creative profiles, portfolio & services marketplace |
| `8edf5b3` | **Phase 3** | Jobs marketplace (discovery, briefs, proposals) |
| `7b2ae92` | **Phase 4** | Photography locations with Neshan map |
| `f34a07b` | **Phase 5** | Auth, accounts, admin foundation & centralized pricing engine |
| `0e86a66` | **Phase 6** | Project lifecycle, real-time-ready chat, notifications, dashboards, mobile polish |
| `5f3c5f0` | **Polish pass** | Mobile UX audit (320–430px), a11y (contrast, focus, touch targets, iOS zoom guard), Persian error/empty states with retry, broken-image fallbacks, image payload −63% (7.7→2.8 MB) |

## Known Future Work

See [`docs/known-issues.md`](./docs/known-issues.md) for the full honest list. Headlines:

1. 🔜 Connect wizard submission to a server endpoint (currently client-side only)
2. 🔜 Server-persist jobs proposals; real jobs collection
3. 🔜 Real database to replace the JSON store (single-file seam: `server/utils/store.ts`)
4. 🔜 Object storage for files (replace 500 KB data-URLs)
5. 🔜 WebSocket/SSE transport behind `useConversations`
6. 🔜 Reviews submission (profiles), server-side spot ratings/photos
7. 🔜 PWA packaging → mobile app distribution
8. ❌ Payments — **excluded by product decision**
