<script setup lang="ts">
// پروفایل — فاز ۱: مهمان + درخواست‌های ثبت‌شده روی همین دستگاه
useHead({ title: 'پروفایل — آرتیوو' })

const toast = useToast()
const { requests, ready } = useMyRequests()
const { reset } = useProjectRequest()

const soon = () => toast.info('به‌زودی', 'این بخش در فازهای بعدی آرتیوو فعال می‌شود.')

const menu = [
  { icon: 'briefcase', label: 'پروژه‌های من', hint: '', action: 'requests' },
  { icon: 'heart', label: 'علاقه‌مندی‌ها', hint: 'به‌زودی', action: 'soon' },
  { icon: 'bookmark', label: 'لوکیشن‌های ذخیره‌شده', hint: 'به‌زودی', action: 'soon' },
  { icon: 'sliders', label: 'تنظیمات', hint: 'به‌زودی', action: 'soon' },
  { icon: 'info', label: 'درباره‌ی آرتیوو', hint: '', action: 'soon' },
]
</script>

<template>
  <div class="container profile">
    <header class="page-head" v-reveal>
      <p class="overline">Account</p>
      <h1 class="t-h1 page-head__title">پروفایل</h1>
    </header>

    <!-- کارت حساب -->
    <section class="panel account" v-reveal>
      <span class="account__avatar"><AIcon name="user" :size="26" /></span>
      <div class="account__body">
        <strong class="account__name">مهمان گرام</strong>
        <span class="t-caption">برای پیگیری پروژه‌ها و پیشنهادها وارد شوید.</span>
      </div>
      <AButton size="sm" variant="outline" @click="soon">ورود / ثبت‌نام</AButton>
    </section>

    <!-- درخواست‌های من -->
    <section class="reqs" v-reveal>
      <div class="section-head" style="margin-bottom:1rem">
        <div class="section-head__titles">
          <span class="section-head__kicker">درخواست‌های من</span>
          <h2 class="t-h2">آنچه ثبت کرده‌ای</h2>
        </div>
      </div>

      <template v-if="ready && requests.length">
        <TransitionGroup name="list" tag="div" class="reqs__list">
          <article v-for="r in requests" :key="r.code" class="panel req">
            <span class="req__code latin">{{ r.code }}</span>
            <div class="req__body">
              <strong class="req__title">{{ r.typeLabel }}</strong>
              <span class="t-caption">{{ new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(new Date(r.createdAt)) }} · {{ r.clientName }}</span>
            </div>
            <div class="req__side">
              <strong class="req__price">{{ formatTomanCompact(r.total) }}</strong>
              <ATag :label="r.status" tone="amber" dot />
            </div>
          </article>
        </TransitionGroup>
      </template>

      <AEmptyState
        v-else-if="ready"
        icon="briefcase"
        title="هنوز درخواستی ثبت نکرده‌ای"
        description="اولین بریف‌ات را در چند دقیقه کامل کن؛ همین‌جا پیگیری‌اش می‌کنی."
      >
        <AButton to="/create" size="sm" icon-end="arrow-left">شروع پروژه</AButton>
      </AEmptyState>

      <div v-else class="panel" style="padding:1rem">
        <ASkeleton w="100%" h="4.5rem" radius="16px" />
      </div>
    </section>

    <!-- منو -->
    <nav class="menu" aria-label="منوی پروفایل" v-reveal>
      <button
        v-for="m in menu"
        :key="m.label"
        type="button"
        class="menu__item"
        @click="m.action === 'soon' ? soon() : toast.info('پروژه‌های من', 'همین بالا، درخواست‌های ثبت‌شده‌ات را می‌بینی.')"
      >
        <span class="menu__icon"><AIcon :name="m.icon" :size="19" /></span>
        <span class="menu__label">{{ m.label }}</span>
        <ATag v-if="m.hint" :label="m.hint" tone="neutral" />
        <AIcon name="chevron-left" :size="16" class="menu__chev" />
      </button>
    </nav>

    <!-- حالت نمایش -->
    <section class="panel theme" v-reveal>
      <span class="menu__icon"><AIcon name="palette" :size="19" /></span>
      <div class="theme__body">
        <strong class="menu__label">حالت نمایش</strong>
        <span class="t-caption">آرتیوو فعلاً فقط با حالت روشنِ عاجی می‌آید.</span>
      </div>
      <div class="theme__opts">
        <button type="button" class="theme__opt theme__opt--on">روشن</button>
        <button type="button" class="theme__opt" disabled @click="soon">تیره · به‌زودی</button>
      </div>
    </section>

    <p class="draft-note t-caption" v-reveal>
      پیش‌نویس درخواست پروژه روی همین دستگاه ذخیره می‌شود؛
      <button type="button" class="draft-note__btn" @click="reset(); toast.success('پیش‌نویس پاک شد')">پاک‌سازی پیش‌نویس</button>
    </p>
  </div>
</template>

<style scoped>
.profile { padding-bottom: 2rem; }
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; }

.account { display: flex; align-items: center; gap: 0.9rem; padding: 1.1rem 1.2rem; }
.account__avatar {
  width: 3.4rem; height: 3.4rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--muted);
  flex-shrink: 0;
}
.account__body { display: grid; min-width: 0; }
.account__name { font-weight: 900; }

.reqs { margin-top: var(--sp-6); }
.reqs__list { display: grid; gap: 0.6rem; }

.req { display: flex; align-items: center; gap: 0.9rem; padding: 0.95rem 1.05rem; }
.req__code {
  font-size: var(--fs-caption);
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--coral-deep);
  background: var(--coral-soft);
  border-radius: var(--r-xs);
  padding: 0.35rem 0.55rem;
  flex-shrink: 0;
}
.req__body { display: grid; min-width: 0; }
.req__title { font-size: var(--fs-small); font-weight: 800; }
.req__side { margin-inline-start: auto; display: grid; justify-items: end; gap: 0.3rem; flex-shrink: 0; }
.req__price { font-size: var(--fs-small); font-weight: 800; }

.menu { display: grid; margin-top: var(--sp-6); gap: 0.45rem; }
.menu__item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.85rem 1rem;
  text-align: start;
  transition: border-color 0.2s, background 0.2s;
}
.menu__item:hover { border-color: var(--line-strong); background: var(--bg-deep); }
.menu__icon {
  width: 2.4rem; height: 2.4rem;
  display: grid; place-items: center;
  border-radius: var(--r-xs);
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.menu__label { font-size: var(--fs-small); font-weight: 800; }
.menu__chev { margin-inline-start: auto; color: var(--faint); }
.menu__item .a-tag + .menu__chev { margin-inline-start: 0.4rem; }

.theme { display: flex; align-items: center; gap: 0.8rem; padding: 0.95rem 1rem; margin-top: 0.45rem; }
.theme__body { display: grid; }
.theme__opts { margin-inline-start: auto; display: flex; gap: 0.4rem; }
.theme__opt {
  border-radius: var(--r-pill);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  color: var(--muted);
  font-size: var(--fs-caption);
  font-weight: 700;
  padding: 0.35rem 0.8rem;
}
.theme__opt--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.theme__opt:disabled { opacity: 0.6; cursor: default; }

.draft-note { margin-top: 1.6rem; text-align: center; }
.draft-note__btn { color: var(--coral-deep); font-weight: 700; font-size: inherit; }
.draft-note__btn:hover { text-decoration: underline; }

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }
</style>
