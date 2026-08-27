# Known Issues & Technical Debt — Artivo

> **Honest inventory** of what is mock, incomplete, fragile or temporary — verified against the code at commit `5f3c5f0`.
> Read this **before** refactoring anything. Related: [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) · [`database.md`](./database.md)

**Last Updated:** 2026-08-27

---

## 1. Wizard submission is client-side only ⚠️ High

`/create` computes a **real** estimate but `submit()` (app/pages/create.vue) just spins 900 ms, generates `ART-####` **in the browser**, and saves to `localStorage['artivo:requests:v1']`. **No server call exists.** Staff never sees these requests.
→ *Fix path:* new `POST /api/requests` + store table; keep `useMyRequests` signature and swap its storage backend (its header already promises this).

## 2. Jobs marketplace is mock + localStorage ⚠️ High

- Job catalog = static arrays in `shared/data/jobs.ts` patched by admin overrides (closed/hidden/title/urgent).
- `useJobProposals` stores proposals **per browser** in `localStorage['artivo:proposals:v1']` — clients can never see them; `proposalsCount` on jobs is a static number.
→ *Fix path:* port the Phase-6 project API pattern (`proposal.post.ts`) to jobs.

## 3. Photography-spot user content is device-local

User-added spots (`artivo:user-spots:v1`), user photos (`artivo:spot-photos:v1`) and ratings (`artivo:spot-ratings:v1`) live in localStorage only. Clearing browser data destroys them; they never reach other users.
→ *Fix path:* `photo_spots` / `spot_photos` / `spot_ratings` tables ([`database.md`](./database.md) § recommended).

## 4. No database — single JSON file store

`.data/artivo.json` is loaded once per boot and saved **synchronously** on each write. Consequences: single-process only, no concurrency control, write-amplification, and **chat file attachments inline as base64** (4×500 KB per message bloats the file fast). Backup = none.
→ *Intentional seam:* rewrite **only** `server/utils/store.ts`; API contracts (`#shared/types`) stay frozen.

## 5. Files/attachments have no real storage

All uploads (chat files, deliverables, spot photos, wizard reference files) are `data:` URLs capped at 500 KB. No S3/object storage, no thumbnails, no virus scanning, no MIME verification beyond size.
→ Security review required before public launch (see § 10).

## 6. Dev OTP `1111` — guarded, but verify per release

`sendOtpCode()` short-circuits to code `1111` when `NODE_ENV !== 'production'`, and production **500s** if Kavenegar env is missing (no silent fallback). Correct today — but any refactor of that guard must preserve both properties. Never demo a production build expecting `1111`.

## 7. Duplicate `Creative` interface

`shared/types/index.ts` declares `Creative` **twice** (≈line 216 and ≈line 563) with slightly different fields; TypeScript declaration merging hides the conflict. Adding a field to one may silently not exist on the other.
→ *Fix:* merge into one interface; update consumers. Low-risk, do deliberately.

## 8. Real-time chat is polling

4 s HTTP polling (tab-visibility aware) + typing TTL — fine for demo scale, not for production battery/server load. The transport seam is cleanly isolated in `useConversations` (WebSocket/SSE swap documented in its header).

## 9. Notification semantics quirks

- Project **cancellation** reuses kind `project-started` («پروژه لغو شد») — works in UI but is semantically odd.
- Feed capped at 60 per user; older notifications silently dropped (JSON-store trade-off).

## 10. Security review checklist (before real users)

- [ ] Rate limiting exists **only** for OTP resend/attempts — no global API rate limiting, no captcha.
- [ ] Password policy is minimal (client-side hints); no 2FA beyond OTP.
- [ ] Admin API guarded by `requireAdmin`, but admin actions are **not audit-logged**.
- [ ] Attachments are base64 JSON — no content scanning; size checks are the only validation.
- [ ] Sessions: opaque tokens server-side (good), TTL 30 days, **no rotation/revocation-all-devices**.
- [ ] Persian/RTL input is accepted broadly; server validation is length/format based (no HTML sanitization needed yet since rendering escapes by default — keep it that way, avoid `v-html`).

## 11. Casual-refactor hazards (things that look wrong but are deliberate)

| Thing | Why it is the way it is |
|---|---|
| `nuxt.config.ts → typescript.typeCheck: false` | Type checking runs explicitly via `nuxt typecheck` (vue-tsc) — CI/manual gate, keep both green |
| Footer column titled «به‌زودی» | Editorial content list, **not** an unfinished placeholder |
| `/pricing` and `/estimate` URLs 404 | Those routes never existed; pricing lives in the wizard + `/api/pricing/config` |
| `spots/new` & `/saved` have no auth middleware | Deliberate: content is localStorage-scoped; login not required |
| Admin collection `overlay` name 404s | `overlay` is not an editable collection; admin edits jobs/spots/services collections instead |
| `overflow-x: clip` on body + negative-margin `.scroll-x` | The sanctioned horizontal-scroller pattern — don't replace with page-level scroll |
| Import depth from server handlers | `../../utils/*` vs `../../../utils/*` by nesting — copy from a sibling file |
| Google Fonts loads 10 families | 2 are app fonts; 8 render the wizard font-picker previews — removing them breaks that feature |

## 12. Explicitly out of scope (do not "fix" by adding)

- **Payments** — excluded by product decision.
- Dark mode — product is light-only.
- Email delivery — only SMS OTP exists.
- Admin RBAC beyond the single `admin` role.
- i18n — Persian-only UI (Latin islands are typographic accents).

## 13. Testing & CI

There is **no test framework**. The validation contract is: `npx nuxt typecheck` (via `./node_modules/.bin/nuxt`) → 0 errors, `nuxt build` clean, manual route/flow smoke (see [`AI_DEVELOPMENT_GUIDE.md`](../AI_DEVELOPMENT_GUIDE.md) § workflow). Introducing Vitest/Playwright would be a *new* initiative, not a repair.
