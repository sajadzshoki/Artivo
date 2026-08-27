# Components — Artivo

> The components another developer/AI must understand to work safely. All live under `app/components/` and are **auto-imported** (`pathPrefix: false` — use `<AButton>` directly).
> Related: [`design-system.md`](./design-system.md) · [`mobile-ux.md`](./mobile-ux.md) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27

---

## 1. UI Primitives (`app/components/ui/`) — the design system

| Component | Purpose | Key props | Events / v-model | Used by |
|---|---|---|---|---|
| `AButton` | Pill button/link; 5 variants × 3 sizes | `variant: primary\|secondary\|soft\|outline\|ghost`, `size: sm\|md\|lg`, `block`, `loading`, `disabled`, `icon`, `iconEnd`, `to`, `type` | renders `NuxtLink` when `to`, else `<button :disabled>` | everywhere |
| `AInput` | Text input with label/required/error/hint | `label`, `type`, `placeholder`, `hint`, `error`, `dir: rtl\|ltr`, `icon`, `required`, `inputmode`, `maxlength: number`, `disabled`, `suffix` | `v-model`, `@blur` | all forms |
| `ATextarea` | Multiline with counter | `rows`, `maxlength`, `counter`, label/error/hint | `v-model` | brief, chat-adjacent forms |
| `ASelect` | Native select, styled | `options {value,label}`, `label`, `error` | `v-model` | filters, city pickers |
| `ACheck` | Checkbox card | `label`, `description` | `v-model` | review confirmation, toggles |
| `ASegmented` | Radio-group tabs | `options {value,label}`, `label` | `v-model` (`role=radiogroup`) | dashboard role tabs, filters |
| `AFilterChips` | Horizontal chip scroller | `options`, `label` | `v-model` (`aria-pressed`) | jobs/creatives/spots filters |
| `ATag` | Status pill | `label`, `tone: neutral\|indigo\|amber\|coral\|green`, `dot?` | — | status/tags |
| `AChip` | Small label chip | label/icon | — | meta rows |
| `AModal` | Bottom sheet (mobile) / dialog (desktop); scroll-lock, Esc, grab handle | `title`, `size: sm\|md\|lg` | `v-model`; slots default + `#footer` | cancel confirm, proposal modal, lightbox-adjacent dialogs |
| `ADrawer` | Mobile bottom sheet / desktop side drawer | `title` | `v-model`; `#footer` | filter sheet, wizard summary, saved |
| `AHeader` | Sticky translucent header | — (self-contained: nav, CTA, bell w/ unread dot, account menu, logout) | — | default layout |
| `ABottomNav` | Mobile bottom navigation + coral FAB | — (unread badge via `useConversations`, hidden on immersive routes by layout) | — | default layout |
| `AStepProgress` | Wizard stepper | `steps {key,label}[]`, `current` | — | `/create` |
| `ASkeleton` | Shimmer placeholder | `w`, `h`, `radius` | — | all loading states |
| `ASpinner` | Inline spinner | `size` | — | buttons, inline loading |
| `AEmptyState` | Icon + title + description + action slot | `icon`, `title`, `description` | slot | empty & **error** states |
| `AIcon` | Inline SVG icon set (~55 names, Lucide-style) | `name`, `size`, `fill?` | — | everywhere |
| `ARating` | Star display | `value`, `count?` | — | cards, profiles |
| `ACard`, `AField`, `AToaster` | Base card, field wrapper, toast stack (`aria-live`) | — | `AToaster` self-wired via `useToast` | layouts/forms |

**`AIcon` naming note:** no `undo` icon exists (use `arrow-right`); check the `paths` map before referencing a new name.

## 2. Domain Components

| Component | Purpose | Props | Notes |
|---|---|---|---|
| `cards/CreativeCard` | Creative directory card (cover, kind tag, rating, save heart) | `creative: Creative` | heart → `useSavedCreatives`; gradient always behind image; `@error` fallback |
| `cards/PortfolioCard` | Portfolio tile (button → lightbox) | `item: PortfolioItem`, `tall?`, `showDesc?` | emits `open(id)`; icon fallback on image error |
| `cards/ServiceCard`, `cards/SpotCard` | Service & spot cards | `service` / `spot` | SpotCard merges user photos + save heart |
| `jobs/JobCard` | Editorial job row (budget/deadline/remote/proposals/save) | `job: Job` | stretched-link pattern; independent save button (`useSavedJobs`) |
| `jobs/ProposalModal` | Job proposal form (price/days/message) | `job`, `v-model` | **localStorage only** via `useJobProposals` |
| `project/StatusTag` | Project status pill | `status: ProjectStatus` | labels/tones from `shared/config/project-status.ts` |
| `project/ProjectCard` | Project summary card (role-aware) | `project: ProjectSummary` | links to workspace |
| `project/FilePicker` | File attach control | `v-model: FileAttachment[]`, `max`, `label`, `maxKb=500` | reads to data-URLs; enforces count+size with Persian errors |
| `spots/SpotMap` | Map container via **`useMapProvider`** | markers, center, interactive | **never touches Neshan SDK directly** |
| `spots/PhotoUploader` | Data-URL photo upload w/ previews | `v-model` | ≤500 KB each |
| `spots/RatingStars` | Interactive rating | `v-model` | localStorage-backed via `useSpots` |
| `creatives/PortfolioGallery` / `Lightbox` / `ReviewList` | Portfolio grid, keyboard-navigable lightbox, reviews list | items / slides | lightbox: arrows/Esc |
| `create/Step*` (10) | Wizard steps (see [`client-project-flow.md`](./client-project-flow.md)) | — (read `useProjectRequest`) | stateless vs state |
| `create/CreateSummary`, `EstimatePanel`, `PalettePreview` | Live summary rail/drawer, price breakdown, palette preview | — | consume `useRequestSummary`/`usePricing` |
| `home/*` (8) | Landing sections (hero, marquee, categories, creatives, services, how-it-works, spots teaser, CTA) | — | editorial layout |
| `auth/OtpInput` | 4-digit OTP input | `v-model` | auto-advance, paste support |
| `admin/CollectionManager` | Generic admin CRUD table/form | collection def | registry-driven from `shared/config/admin-collections.ts` |
| `site/SiteFooter` | Footer («به‌زودی» column is a static editorial list, **not** a placeholder) | — | default layout |

## 3. Layouts, Pages & Plugins

| File | Role |
|---|---|
| `layouts/default.vue` | skip-link · `AHeader` · `main#main` (bottom-nav padding) · footer · `ABottomNav`; `immersive` hides chrome on `/create` + `/messages/*` |
| `layouts/admin.vue` | Admin sidebar shell (nav items typed `AdminNavItem[]`) |
| `plugins/auth.global.ts` | SSR session hydration (`useRequestFetch`) — no flash of wrong auth state |
| `plugins/reveal.ts` | `v-reveal` IntersectionObserver scroll-reveal directive |
| `error.vue` | Branded error/404 page |

## 4. Composables Index (logic layer — see [PROJECT_CONTEXT §10](../PROJECT_CONTEXT.md#10-state-management))

`useAuth` · `useConversations` (+`useThread`) · `useNotifications` · `useProjects` · `useOverlay` · `usePricing` · `useProjectRequest` · `useRequestSummary` · `useMyRequests` · `useJobsQuery` · `useJobProposals` · `useSavedJobs` / `useSavedCreatives` / `useSavedSpots` · `useSpots` · `useMapProvider` · `useUserLocation` · `useToast`
