# Mobile-First UX Rules — Artivo

> Mobile is the project's **highest priority**: the app is designed to eventually ship as a packaged mobile app.
> This document records the conventions **actually implemented** — follow them for every new screen.
> Related: [`design-system.md`](./design-system.md) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27

---

## 1. Viewport & Breakpoints

- Viewport meta: `width=device-width, initial-scale=1, viewport-fit=cover` (safe-area aware).
- Primary design target: **320–430 px**. Audit every new screen at **320 / 360 / 375 / 390 / 430**.
- Breakpoints actually used in code: **640 px** (some grids 2→3 cols), **768 px** (bottom nav hidden, header nav appears, modals center, drawers become side panels), **900 px** (project workspace sidebar + desktop CTA swap).
- Page background blocks horizontal overflow globally (`body { overflow-x: clip }`); marquee/scroll-strip patterns use `.scroll-x` with negative margins inside the gutter so the page never scrolls sideways.

## 2. App Shell

```mermaid
flowchart TB
    subgraph default["layouts/default.vue"]
        SKIP["skip-link (a11y)"] --> HDR["AHeader (sticky, blur)"] --> MAIN["main#main<br/>padding-bottom: 5.2rem + safe-area"] --> FOOT["SiteFooter"] --> NAV["ABottomNav (<768px)"]
    end
    subgraph immersive["immersive routes (header/footer/nav hidden)"]
        W["/create wizard<br/>(own sticky bar + footer)"]
        C["/messages/[id] chat<br/>(fixed 100dvh grid)"]
    end
```

- **`ABottomNav`** (< 768 px): 6-column grid — خانه · پروژه‌ها · گفتگو (unread badge) · داشبورد · پروفایل · coral **FAB** «شروع پروژه». Active state = ink color + coral dot; prefix matching for nested routes. 20 s unread polling, paused when the tab is hidden.
- Immersive routes (`/create`, `/messages/*`) hide header/footer/bottom-nav via the `immersive` computed in the default layout.

## 3. Touch Targets & Interaction

| Rule | Implementation |
|---|---|
| Minimum tap target **≈44 px** | `sm` buttons 2.5rem on coarse pointers, save hearts/bookmarks 2.5rem, modal/drawer close 2.5rem, wizard CTA bar buttons `min-height: 44px` |
| No double-tap zoom / gray flash | `touch-action: manipulation` + `-webkit-tap-highlight-color: transparent` on all interactive elements |
| No iOS focus zoom | `@media (pointer: coarse) { input, textarea, select { font-size: 1rem !important } }` |
| Thumb-reach | Primary actions bottom-anchored (sticky CTAs, wizard footer, composer); destructive/back actions top |
| Press feedback | Scale/translate micro-transforms (`:active`), never color-only |

## 4. Bottom Sheets, Drawers, Modals

- `AModal` renders as a **bottom sheet on mobile** (rounded top, grab handle, `max-height: 86dvh`, scrollable body, safe-area padding) and a centered dialog on desktop (≥768 px).
- `ADrawer` is the mobile filter/summary pattern — used by the jobs filter sheet and the wizard live summary.
- Both lock body scroll while open, close on Esc (desktop) and backdrop tap, and have a 2.5rem close button.
- **Filters on mobile are always a bottom sheet** (`/jobs` pattern), never a permanent sidebar.

## 5. Sticky CTAs & Footers

| Surface | Behavior |
|---|---|
| Wizard (`/create`) | Sticky top bar (exit · brand · خلاصه + progress) **and** sticky bottom footer (قبلی · live estimate · ادامه/ثبت). Estimate hides **< 400 px** to prevent 320 px overflow |
| Project workspace | `.cta` sticky bar floats **above the bottom nav**: `bottom: calc(5.2rem + env(safe-area-inset-bottom))`, horizontally scrollable chips if actions overflow, hidden ≥900 px |
| Chat composer | Bottom row of a `100dvh` grid; `env(safe-area-inset-bottom)` padding |

## 6. Forms & Keyboard

- One-purpose screens; wizard = one step per screen, single primary action.
- Validation fires **on «ادامه»/submit**, not on every keystroke (errors clear as the user fixes the field).
- Correct keyboards via `inputmode` (`tel`, `numeric`, `email`, `url`), `enterkeyhint="send"` on chat, LTR direction for numbers/emails.
- Chat scrolls to bottom on **keyboard open/close** via `visualViewport` resize/scroll listeners (only when already stuck to bottom).
- Numeric budget inputs are digit-agnostic (`faNum` normalizes Persian/Arabic digits).

## 7. Images on Mobile

- Every image container declares an `aspect-ratio` (covers 4/3, 3/3.7, 16/10…) with `object-fit: cover` → no stretch, no CLS.
- Gradient placeholder **always** painted behind cover images so a broken/missing image still looks intentional (`CreativeCard`, `SpotCard`); `PortfolioCard` swaps to an icon fallback on `@error`.
- Below-fold images: `loading="lazy" decoding="async"`; hero: `fetchpriority="high"`.
- Seed imagery is pre-compressed (~2.8 MB total); user uploads/attachments are hard-capped (≤ 500 KB each — see [`known-issues.md`](./known-issues.md)).

## 8. Responsive Rules Summary

1. Design mobile-first; add `@media (min-width: 640/768/900px)` enhancements only.
2. Grids collapse to 1–2 columns under 640 px; `.scroll-x` strips for card rails.
3. `container` gutter is fluid (`clamp`) — nothing touches screen edges.
4. Text never below 0.63rem; body 15px; Persian line-height 1.75.
5. Long Persian labels: buttons `white-space: normal` when `block`; titles use `overflow-wrap: break-word`.
6. Fixed elements must always account for `env(safe-area-inset-*)` and each other (CTA above bottom-nav constant `5.2rem`).

## 9. Pre-merge Mobile Checklist

- [ ] 320/360/375/390/430 px — no horizontal scroll, no clipped labels
- [ ] Tap targets ≥ 44 px; composer/keyboard behavior verified
- [ ] Sticky bars don't cover content (bottom-nav offset!)
- [ ] Loading skeleton → content → empty → error states all present
- [ ] RTL intact (logical properties only); light theme only
- [ ] `nuxt typecheck` + `nuxt build` green
