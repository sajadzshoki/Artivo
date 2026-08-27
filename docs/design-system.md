# Design System — Artivo

> Extracted from the actual tokens in `app/assets/css/main.css` and the `A*` components in `app/components/ui/`.
> **Do not invent tokens — extend this file only when code changes.**
> Related: [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) · [`mobile-ux.md`](./mobile-ux.md) · [`components.md`](./components.md)

**Last Updated:** 2026-08-27

---

## 1. Visual Philosophy

Artivo deliberately avoids a generic SaaS/dashboard look. The language is **editorial / magazine-like**:

- **Premium** — generous whitespace, restrained shadows, strong typography as the main design tool
- **Warm** — ivory/cream paper background (`#FAF6EF`), never sterile white
- **Creative & energetic** — coral accent used sparingly for primary actions and highlights
- **Editorial** — overline kickers, Latin display numerals, hairline rules, asymmetric layouts
- **Image-focused** — photography/portfolio imagery is large and respects intrinsic aspect ratios
- **Light mode only** — there is **no dark mode**; do not add one
- Avoid: excessive rounded cards, heavy shadows, decorative gradients, border noise, unnecessary animation

## 2. Color Palette (exact tokens from `main.css`)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#FAF6EF` | Warm ivory — page background |
| `--bg-deep` | `#F3EDE2` | Deeper ivory — secondary surfaces |
| `--paper` | `#FFFDF8` | Card / raised surface |
| `--ink` | `#211C15` | Primary text, near-black |
| `--ink-soft` | `#4A443A` | Body text |
| `--muted` | `#756C5A` | Secondary text (≥ 4.5:1 on ivory) |
| `--faint` | `#9A9080` | Metadata / tertiary (≥ 3:1) |
| `--line` | `#E7DFCF` | Hairline borders |
| `--line-strong` | `#D9CFBA` | Emphasised borders / input borders |
| `--coral` | `#FF5A3C` | Primary accent (CTAs, active states) |
| `--coral-deep` | `#E8431F` | Accent hover / strong text |
| `--coral-soft` | `#FFE9E2` | Accent tint surface |
| `--indigo` / `--indigo-deep` / `--indigo-soft` | `#4B44DC` / `#3A34B8` / `#ECEBFC` | Secondary accent (selection highlights) |
| `--green` / `--green-soft` | `#2E9E66` / `#E3F4EA` | Success |
| `--amber` / `--amber-soft` | `#E8A33D` / `#FCF1DD` | Warning / pending states |

Contrast rule adopted in the polish pass: body-secondary text ≥ 4.5:1, metadata ≥ 3:1 against `--bg`.

## 3. Typography

Architecture (single swap point — change these two variables to change fonts app-wide):

```css
--font-fa: 'Vazirmatn', 'Segoe UI', Tahoma, sans-serif;   /* Persian base */
--font-latin: 'Fraunces', Georgia, serif;                  /* Latin editorial (wordmark, overlines, numerals) */
```

Google Fonts also loads 8 **preview-only** families (Lalezar, Markazi Text, Noto Naskh Arabic, Rubik, Inter, Space Grotesk, Playfair Display, DM Sans) used exclusively by the wizard's font-pairing picker (`shared/config/font-pairings.ts`).

**Type scale:**

| Class / token | Size | Use |
|---|---|---|
| `--fs-caption` | 0.75rem (12) | Captions, meta |
| `--fs-small` | 0.8125rem (13) | Small labels, buttons `sm` |
| `--fs-body` | 0.9375rem (15) | Base body |
| `--fs-md` | 1.0625rem (17) | Lead paragraphs |
| `--fs-lg` | 1.25rem (20) | `t-h3`, modal titles |
| `--fs-xl` | 1.5rem (24) | `t-h2` |
| `--fs-2xl` | clamp(1.6→2.25rem) | `t-h1` |
| `--fs-display` | clamp(2.35→4.5rem) | `t-display` (hero) |

Base line-height **1.75** (comfortable for Persian), headings 1.22–1.4, weights 700–900. Utility classes: `.t-display .t-h1 .t-h2 .t-h3 .t-body .t-body-lg .t-small .t-caption .overline .latin`.

**Numbers:** Persian formatting everywhere via `new Intl.NumberFormat('fa-IR')`; prices through `formatToman`/`formatTomanCompact` (`shared/utils/format.ts`) with the unit **تومان** — never hardcode formatted prices.
**Latin inside RTL:** use the `.latin` class (`direction: ltr`) for codes/wordmarks so Latin never breaks RTL layout.

## 4. Spacing, Radii, Shadows, Layers

| Group | Tokens |
|---|---|
| Spacing (4-pt scale) | `--sp-1: .25rem` → `--sp-9: 6rem` |
| Radii | `--r-xs: 8px · --r-sm: 12px · --r-md: 16px · --r-lg: 22px · --r-xl: 30px · --r-pill: 999px` |
| Shadows (deliberately subtle) | `--shadow-soft` · `--shadow-pop` · `--shadow-coral` (coral glow for primary CTAs only) |
| Layout | `--container: 76rem` · `--gutter: clamp(1.125→2.75rem)` · `--section-gap: clamp(3.5→6.5rem)` · `--header-h: 4rem` |
| Z-layers | `--z-nav: 40` · `--z-header: 50` · `--z-modal: 90` · `--z-toast: 100` |
| Motion | `--ease-out: cubic-bezier(.22,1,.36,1)` · `--dur: .45s` · all disabled under `prefers-reduced-motion` |

## 5. Core Building Blocks

All primitives live in `app/components/ui/` (auto-imported, `pathPrefix: false`). Full props/events: [`components.md`](./components.md).

| Component | Notes |
|---|---|
| `AButton` | Pill buttons; variants `primary/secondary/soft/outline/ghost`; sizes `sm 2.25rem · md 2.75rem · lg 3.25rem` (sm → 2.5rem on touch); `block` wraps long labels |
| `AInput` / `ATextarea` / `ASelect` | Label + required marker (`*`), error/hint text, `dir`, icons, counters; inputs are 16px on coarse pointers (iOS zoom guard) |
| `ACheck` | Checkbox card with title + description |
| `ASegmented` / `AFilterChips` | Radio-group & chip rows with `aria-checked` / `aria-pressed`; chips scroll horizontally (no wrap overflow) |
| `ATag` | Status pill with optional `dot` (never rely on dot color alone — always paired with a label) |
| `AModal` | **Bottom sheet on mobile**, centered dialog ≥768px, grab handle, Esc to close, body scroll-lock, 2.5rem close target |
| `ADrawer` | **Mobile bottom sheet** (same pattern as AModal on phones) / side drawer on desktop |
| `AHeader` | Sticky, translucent blur, active-link underline, bell with unread dot, account menu |
| `ABottomNav` | Mobile-only (<768px) 6-slot grid incl. coral FAB «شروع پروژه»; unread message badge; hidden on immersive routes |
| `ASkeleton` / `ASpinner` | Loading shimmer blocks / inline spinner |
| `AEmptyState` | Icon + title + description + optional action slot (Persian copy — see below) |
| `AStepProgress` | Wizard stepper: Persian numerals, done/current states, «گام ۳ از ۸» counter |
| `AIcon` | ~55 inline Lucide-style paths — **no external icon font**; `fill` prop for heart/star |
| `ARating` / `AChip` / `ACard` / `AField` / `AToaster` | Rating stars, filter/label chips, base card, form field wrapper, toast stack (top, `aria-live="polite"`) |

## 6. State Patterns

| State | Pattern |
|---|---|
| **Loading** | `ASkeleton` mirrors of the real layout (never blank white); `AButton :loading` shows `ASpinner` and disables |
| **Empty** | `AEmptyState` with a meaningful Persian message **and** a next-step action |
| **Error** | Same `AEmptyState` pattern with ز«تلاش دوباره» retry bound to the composable's `refresh()` (dashboard, projects, messages, notifications) |
| **Success** | Toast (`useToast().success`) + success screen for the wizard (`StepSuccess` with copyable tracking code) |

## 7. RTL & Accessibility Rules

- Whole app is RTL by document direction; use **CSS logical properties** (`margin-inline`, `inset-inline-start`, …) — never physical `left/right`. There is **no** `@media (direction: rtl)` hack.
- `:focus-visible` gets a 2px coral outline globally; a skip-link («پرش به محتوای اصلی») is the first tab stop in the default layout.
- Icon-only controls require `aria-label` (Persian); toggles expose `aria-pressed`/`aria-checked`; toasts are `aria-live`.
- `touch-action: manipulation` + transparent tap-highlight on all controls; tap targets ≥ 44px (see [`mobile-ux.md`](./mobile-ux.md)).
