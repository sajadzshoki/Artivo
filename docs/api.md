# API Reference — Artivo

> Every Nitro endpoint under `server/api/**` — nothing invented. All bodies/responses are JSON.
> Auth legend: 🔓 public · 🔒 `requireUser` (401 if anonymous) · 👑 `requireAdmin` (403 if not admin).
> Errors: `{ statusCode, message, data?: { field } }` — Persian messages; field errors keyed for inline display.
> Related: [`database.md`](./database.md) (shapes) · [`authentication.md`](./authentication.md) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27 · **38 endpoints**

---

## Auth — `server/api/auth/**`

| Method & Path | Auth | Purpose | Body → Response |
|---|---|---|---|
| `POST /api/auth/register` | 🔓 | Create account (unverified) | `{ name, mobile, email, password, roles[] }` → `{ user: PublicUser }` |
| `POST /api/auth/login` | 🔓 | Login with identifier (email **or** mobile) + password | `{ identifier, password }` → `{ user }` · 401 bad credentials |
| `POST /api/auth/logout` | 🔒 | Destroy session + cookie | — → `{ ok }` |
| `GET /api/auth/me` | 🔓 | Session → current user (null if anonymous) | → `{ user: PublicUser \| null }` |
| `PUT /api/auth/profile` | 🔒 | Update name/email/clientProfile/roles | partial → `{ user }` |
| `POST /api/auth/otp/request` | 🔓 | Issue OTP (`purpose: login\|reset\|verify`); 45 s resend gap | `{ mobile, purpose }` → `{ ok, ttl: 120, dev? }` (dev flag only when `NODE_ENV !== 'production'`) |
| `POST /api/auth/otp/verify` | 🔓 | Verify code (TTL 2 min, ≤5 attempts); `login` auto-creates mobile account; sets session cookie | `{ mobile, code, purpose }` → `{ ok, purpose, user }` · **dev code `1111` (dev only!)** |
| `POST /api/auth/password/change` | 🔒 | Change password (requires current) | `{ currentPassword, newPassword }` → `{ ok }` |
| `POST /api/auth/password/forgot` | 🔓 | OTP(`reset`) for account recovery; dev returns reset hint | `{ mobile }` → `{ ok, dev? }` |
| `POST /api/auth/password/reset` | 🔓 | Consume one-time reset token (10 min) → set password | `{ mobile, resetToken, newPassword }` → `{ ok }` |

## Public — `server/api/{public,pricing,neshan}/**`

| Method & Path | Auth | Purpose | Response |
|---|---|---|---|
| `GET /api/public/overlay` | 🔓 | Admin overlay state + community creatives (single fetch, SSR-shared) | `PublicOverlay` (closed/deleted/hidden/featured ids, overrides, createdServices, communityCreatives, taxonomies) |
| `GET /api/pricing/config` | 🔓 | Live pricing config (defaults ⊕ admin rules via `rulesToPricingConfig`) | `PricingConfig` |
| `GET /api/neshan/reverse?lat&lng` | 🔓 (key server-side) | Reverse geocode proxy → Neshan REST v5 | `{ ok:true, address, city }` or `{ ok:false, reason }` — **never leaks `NUXT_NESHAN_API_KEY`** |

## Profile — `server/api/profile/**`

| Method & Path | Auth | Purpose | Body → Response |
|---|---|---|---|
| `GET /api/profile/creative` | 🔒 | Current user's linked creative profile | → `{ profile }` |
| `POST /api/profile/creative` | 🔒 | Create public creative profile (kind designer/photographer, role, city, categories, startingPrice, bio, skills…) | → `{ profile, user }` |
| `PUT /api/profile/creative` | 🔒 | Edit it | → `{ profile, user }` |

## Projects — `server/api/projects/**`

| Method & Path | Auth | Purpose | Body → Response |
|---|---|---|---|
| `GET /api/projects` | 🔒 | My projects, both roles | → `{ asClient: ProjectSummary[], asCreative: ProjectSummary[] }` |
| `POST /api/projects` | 🔒 | Create project (status `draft`, code `PRJ-####`) | `{ title ≥4, typeId, typeLabel, description ≥30, budgetMin?, budgetMax?, deadlineDays 1–365 }` → `{ project }` |
| `GET /api/projects/open` | 🔒 | Open market (`published\|receiving`, excludes own) | → `{ items: ProjectSummary[] }` |
| `GET /api/projects/[id]` | participant/proposer/👑 | Detail; proposals filtered to own for creatives; `threadId` if chat exists | → `{ project, myRole, threadId }` · 403 non-participant |
| `POST /api/projects/[id]/status` | client/👑 | Lifecycle actions: `publish` · `open` · `accept{proposalId}` (rejects other pendings, sets creativeId, find-or-creates chat thread, notifies) · `reject{proposalId}` · `approve` · `cancel` — transitions validated by `shared/config/project-status.ts` | `{ action, proposalId? }` → `{ project, threadId? }` |
| `POST /api/projects/[id]/proposal` | 🔒 creative | Submit proposal (once, `receiving` only) | `{ price ≥100k, deliveryDays 1–365, message ≥20 }` → `{ proposal }` |
| `POST /api/projects/[id]/deliverable` | selected creative | Submit work (`in_progress\|revision_requested`) → status `ready_for_approval` | `{ note ≥10, files: 1–4 × FileAttachment (data-URL ≤500 KB) }` → `{ project }` |
| `POST /api/projects/[id]/revision` | client | Request revision (`ready_for_approval`) → `revision_requested`, `revisionCount++` | `{ note ≥10 }` → `{ project }` |

Status machine (enforced by `canTransition`):
`draft → published|cancelled` · `published → receiving|cancelled` · `receiving → in_progress|cancelled` · `in_progress → ready_for_approval|cancelled` · `revision_requested → ready_for_approval|cancelled` · `ready_for_approval → revision_requested|completed|cancelled` · terminal states locked.

## Conversations — `server/api/conversations/**`

| Method & Path | Auth | Purpose | Response / Body |
|---|---|---|---|
| `GET /api/conversations` | 🔒 | My threads (+project info, last message, unread count) | → `{ items: ConversationSummary[], totalUnread }` |
| `GET /api/conversations/[id]` | member/👑 | Thread payload; **fetching marks peer messages read**; returns peer typing (4 s window) | → `ThreadPayload { id, projectId, projectTitle, projectStatus, peers[], messages[], peerTyping }` |
| `POST /api/conversations/[id]/message` | member | Send message | `{ body ≤2000, files? ≤4×500KB data-URLs }` → `{ message }` |
| `POST /api/conversations/[id]/typing` | member | Typing ping (server TTL 4 s) | → `{ ok }` |

> Transport = **HTTP polling** (client polls every 4 s, tab-visibility aware). The seam for WebSockets is isolated in `useConversations`.

## Notifications — `server/api/notifications/**`

| Method & Path | Auth | Purpose | Body → Response |
|---|---|---|---|
| `GET /api/notifications` | 🔒 | Newest 60 + unread count | → `{ items, unread }` |
| `POST /api/notifications/read` | 🔒 | Mark one (`{ id }`) or all (`{}`) read | → `{ ok }` |

Kinds emitted: `proposal`, `proposal-accepted`, `proposal-rejected`, `project-started`, `work-submitted`, `revision-requested`, `project-completed`, `message`.

## Admin — `server/api/admin/**` (all 👑 `requireAdmin`)

| Method & Path | Purpose | Body → Response |
|---|---|---|
| `GET /api/admin/stats` | Dashboard counters (users/projects/threads/etc.) | → stats object |
| `GET /api/admin/pricing` | Current `AdminPricingRules` | → rules |
| `PUT /api/admin/pricing` | Update live pricing rules (validated) | rules → rules |
| `POST /api/admin/pricing/reset` | Restore code defaults | → rules |
| `GET /api/admin/collections/[name]` | Collection rows (store mode) or static+overrides (override mode). Registry-driven names: `font-packs`, `color-palettes`, `project-categories`, `creative-categories`, `photography-categories`, `services`, `users` | → `{ items }` |
| `POST /api/admin/collections/[name]` | Create row (registry-validated fields per `admin-collections.ts`) | row → `{ item }` |
| `PUT /api/admin/collections/[name]/[id]` | Update row / patch static item | row → `{ item }` |
| `DELETE /api/admin/collections/[name]/[id]` | Delete row / hide static item | → `{ ok }` |

## Conventions

- Import depths from handlers: `../../utils/*` for `server/api/x.ts`, `../../../utils/*` for nested — check a sibling file before adding imports.
- Validation helpers: `readJson`, `str`, `num`, `strArray`, `bad(message, field?)` in `server/utils/validate.ts`.
- File attachments everywhere: `FileAttachment { id, name, url(data-URL), size }`, max **4 files × 500 KB** per request.
- All money values are integers in **تومان**.
