# Jobs Marketplace — Artivo

> `/jobs` (browse) + `/jobs/[id]` (brief + proposal).
> Data: `shared/data/jobs.ts` (static mock) · admin overlay · `app/composables/useJobsQuery.ts` + `useJobProposals.ts`
> Related: [`creative-profiles.md`](./creative-profiles.md) · [`api.md`](./api.md) · [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md)

**Last Updated:** 2026-08-27 · Status: **Implemented** — discovery, filtering, briefs and proposal UX are done; job data is static+overlay and proposals are localStorage (**not server-persisted**)

---

## 1. Job Model (actual `Job` type)

```ts
{
  id: string                       // e.g. 'job-theatre-poster'
  title, description: string
  categoryId: JobCategoryId        // poster | logo | branding | social | menu | packaging | ui | photo | other
  kinds: CreativeKind[]            // ['designer'] | ['photographer'] | both → "what type of creative is needed"
  budgetMin, budgetMax: number     // تومان
  deadlineDays: number
  urgent: boolean
  workplace: 'remote' | 'onsite' | 'hybrid'
  location: string                 // 'دورکاری' or 'شهر · محله'
  postedDaysAgo: number
  proposalsCount: number           // static mock counter
  status: 'open' | 'closed'
  client: { name, type, about, rating, jobsPosted, memberSince, verified? }
  brief: JobBrief                  // deliverables, usage rights, references…
}
```

Seeds: 6 rich demo briefs in `shared/data/jobs.ts` with reference images hosted in `public/images/**`.

## 2. Listing Page (`/jobs`) — Actual UX

| Capability | Implementation |
|---|---|
| Search | Free-text over title/description/client (`AInput` + search icon) |
| Category chips | `AFilterChips`, horizontally scrollable (never wraps/overflows on mobile) |
| **Filter sheet** | `ADrawer` **bottom sheet on mobile**: kind (designer/photographer), workplace (دورکاری/حضوری/هیبرید), budget presets, delivery presets, city `ASelect`, urgent-only & saved-only toggles. Active-filter count badge on the filter button |
| Sort | `ASelect`: newest / budget desc / budget asc / deadline |
| Paging | Client-side, 6 per page (`jobsPageSize`) with «نمایش بیشتر» |
| Cards | `JobCard` — category icon, فوری/بسته tags, budget `تا` range, deadline days, workplace+location, proposals count, client avatar/name, stretched-link pattern with independent save heart |
| Overlay | Admin state merges: closed/deleted jobs removed, title/urgent patches (`useOverlay` → `filterJobs`) |
| Saved | Heart → `useSavedJobs` (`localStorage['artivo:saved-jobs:v1']`); «فقط ذخیره‌شده‌ها» filter + `/saved` hub tab |

Empty state: `AEmptyState` «پروژه‌ای مطابق فیلترها پیدا نشد» + reset action. Loading: skeleton cards.

## 3. Job Detail (`/jobs/[id]`)

- Full brief: description, deliverables list, usage rights, reference images (aspect-safe), client card with rating/verified badge, sticky apply CTA on mobile.
- **Closed jobs** (admin-toggled) render a closed banner and disable proposing.

## 4. Proposals (`ProposalModal`) — ⚠️ localStorage only

```ts
// JobProposal — stored in localStorage['artivo:proposals:v1'] via useJobProposals
{ id, jobId, price: number /* ≥ min 100k */, deliveryDays: number,
  message: string /* ≥ 20 chars */, createdAt: string, status: 'pending' }
```

- Validation mirrors the server-side project proposal rules (price ≥ 100,000; days 1–365; message ≥ 20 chars) with Persian field errors.
- One proposal per job per browser (`hasProposed`); a pending state with the submitted price/duration is shown afterward.
- ⚠️ **No API exists for job proposals.** The Phase-6 **project** proposal API (`POST /api/projects/[id]/proposal`) is a separate, server-persisted concept — do not confuse them. Migrating job proposals to the backend is tracked in [`known-issues.md`](./known-issues.md).

## 5. Job Creation

There is **no client-facing job creation form**. Jobs come from seeds + admin collection editing (`/admin/collection/jobs`, override mode). The *client* path for posting work is: wizard `/create` (request) or `/projects/new` → publish (Phase-6 project flow).

## 6. Mock vs Real (summary)

| Part | Status |
|---|---|
| Job catalog | Static mock + admin overlay (no DB) |
| Job proposals | **localStorage mock** |
| Proposal counters / client ratings on jobs | Static mock |
| Filters/search/sort/paging | Real client-side logic (fully functional) |
| Saved jobs | Real per-browser (localStorage) |
