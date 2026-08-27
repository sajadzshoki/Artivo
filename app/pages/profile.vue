<script setup lang="ts">
// پروفایل — حساب کاربری + درخواست‌ها و پیشنهادهای ثبت‌شده
// (داده‌های محلی فاز ۱ تا ۳ دست‌نخورده می‌مانند)
useHead({ title: 'پروفایل — آرتیوو' })
// بدون گارد — مهمان‌ها هم درخواست‌های محلی‌شان را می‌بینند (فاز ۱)

const { user, logout, isAdmin } = useAuth()
const { requests, ready } = useMyRequests()
const { proposals, ready: proposalsReady } = useJobProposals()

const fa = new Intl.NumberFormat('fa-IR')
const dateFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })

const roleLabels: Record<string, string> = {
  client: 'کارفرما',
  creative: 'خلاق',
  admin: 'مدیر',
}

const manageLinks = computed(() => {
  const links = [
    { to: '/profile/client', icon: 'briefcase', label: 'پروفایل کارفرما', desc: 'نام برند، شهر و حوزه‌های موردعلاقه', show: !!user.value?.roles.includes('client') },
    { to: '/profile/creative', icon: 'aperture', label: 'پروفایل خلاق', desc: 'پیوند یا ساخت پروفایل عمومی خلاق', show: !!user.value?.roles.includes('creative') || !!user.value?.roles.includes('admin') },
    { to: '/profile/settings', icon: 'sliders', label: 'تنظیمات حساب', desc: 'اطلاعات، رمز عبور و نقش‌ها', show: true },
    { to: '/dashboard', icon: 'grid', label: 'داشبورد', desc: 'نمای کلی پروژه‌ها و پیشنهادها', show: !!user.value },
    { to: '/projects', icon: 'briefcase', label: 'پروژه‌های من', desc: 'کارفرمایی و خلاقیت', show: !!user.value },
    { to: '/messages', icon: 'send', label: 'گفتگوها', desc: 'پیام‌های پروژه‌ها', show: !!user.value },
    { to: '/notifications', icon: 'bell', label: 'اعلان‌ها', desc: 'رویدادهای حساب', show: !!user.value },
    { to: '/saved', icon: 'heart', label: 'ذخیره‌شده‌ها', desc: 'پروژه‌ها، خلاق‌ها و لوکیشن‌ها', show: true },
  ]
  if (isAdmin.value) {
    links.unshift({ to: '/admin', icon: 'shield', label: 'پنل مدیریت', desc: 'قیمت‌گذاری، محتوا و کاربران', show: true })
  }
  return links.filter(l => l.show)
})

const savedJobs = useSavedJobs()
</script>

<template>
  <div class="container profile">
    <header class="page-head" v-reveal>
      <p class="overline">Account</p>
      <h1 class="t-h1 page-head__title">پروفایل</h1>
    </header>

    <!-- ── کارت حساب ── -->
    <section v-if="user" class="panel account" v-reveal>
      <span class="account__avatar account__avatar--letter">{{ user.name.trim().charAt(0) }}</span>
      <div class="account__body">
        <strong class="account__name">
          {{ user.name }}
          <AIcon v-if="user.mobileVerified" name="check-circle" :size="16" class="account__verified" aria-label="شماره تأییدشده" />
        </strong>
        <span class="t-caption account__contact latin" dir="ltr">{{ user.mobile }}{{ user.email ? ` · ${user.email}` : '' }}</span>
        <div class="account__roles">
          <ATag v-for="r in user.roles" :key="r" :label="roleLabels[r] ?? r" :tone="r === 'admin' ? 'indigo' : 'neutral'" />
          <ATag v-if="!user.hasPassword" label="بدون رمز — ورود با کد" tone="amber" />
        </div>
      </div>
      <AButton size="sm" variant="outline" icon="logout" @click="logout()">خروج</AButton>
    </section>

    <!-- مهمان: دعوت به ورود -->
    <section v-else class="panel account" v-reveal>
      <span class="account__avatar"><AIcon name="user" :size="26" /></span>
      <div class="account__body">
        <strong class="account__name">مهمان گرام</strong>
        <span class="t-caption">برای مدیریت حساب، نقش‌ها و پیگیری بهتر وارد شو؛ درخواست‌های محلی همین‌جا می‌مانند.</span>
      </div>
      <AButton to="/auth/login" size="sm">ورود / ثبت‌نام</AButton>
    </section>

    <!-- ── مدیریت حساب ── -->
    <section v-if="user" class="manage" v-reveal>
      <NuxtLink v-for="l in manageLinks" :key="l.to" :to="l.to" class="panel manage__item">
        <span class="manage__icon"><AIcon :name="l.icon" :size="19" /></span>
        <span class="manage__body">
          <strong>{{ l.label }}</strong>
          <small>{{ l.desc }}</small>
        </span>
        <AIcon name="arrow-left" :size="16" class="manage__arrow" />
      </NuxtLink>
    </section>

    <!-- ── درخواست‌های من ── -->
    <section class="reqs" v-reveal>
      <div class="section-head" style="margin-bottom:1rem">
        <div class="section-head__titles">
          <span class="section-head__kicker">درخواست‌های من</span>
          <h2 class="t-h2">آنچه ثبت کرده‌ای</h2>
        </div>
        <NuxtLink to="/create" class="section-head__link">
          شروع پروژه
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>

      <template v-if="ready && requests.length">
        <TransitionGroup name="list" tag="div" class="reqs__list">
          <article v-for="r in requests" :key="r.code" class="panel req">
            <span class="req__code latin">{{ r.code }}</span>
            <div class="req__body">
              <strong class="req__title">{{ r.typeLabel }}</strong>
              <span class="t-caption">{{ dateFmt.format(new Date(r.createdAt)) }} · {{ r.clientName }}</span>
            </div>
            <div class="req__side">
              <strong class="req__price">{{ formatTomanCompact(r.total) }}</strong>
              <ATag :label="r.status" tone="amber" dot />
            </div>
          </article>
        </TransitionGroup>
        <p class="t-caption local-note">این فهرست روی همین دستگاه ذخیره شده است.</p>
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

    <!-- ── پیشنهادهای من ── -->
    <section class="reqs" v-reveal>
      <div class="section-head" style="margin-bottom:1rem">
        <div class="section-head__titles">
          <span class="section-head__kicker">پیشنهادهای من</span>
          <h2 class="t-h2">برای پروژه‌های باز فرستاده‌ام</h2>
        </div>
        <NuxtLink to="/jobs" class="section-head__link">
          پروژه‌های باز
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>

      <template v-if="proposalsReady && proposals.length">
        <TransitionGroup name="list" tag="div" class="reqs__list">
          <NuxtLink v-for="p in proposals" :key="p.id" :to="`/jobs/${p.jobId}`" class="panel prop">
            <span class="prop__icon"><AIcon name="send" :size="16" /></span>
            <div class="req__body">
              <strong class="req__title">{{ p.jobTitle }}</strong>
              <span class="t-caption">{{ dateFmt.format(new Date(p.createdAt)) }} · مهلت {{ fa.format(p.deliveryDays) }} روزه</span>
            </div>
            <div class="req__side">
              <strong class="req__price">{{ formatTomanCompact(p.price) }}</strong>
              <ATag label="ارسال شد" tone="green" dot />
            </div>
          </NuxtLink>
        </TransitionGroup>
        <p class="t-caption local-note">این فهرست روی همین دستگاه ذخیره شده است.</p>
      </template>

      <p v-else-if="proposalsReady" class="t-caption prop-empty">
        هنوز پیشنهادی نفرستاده‌ای؛
        <NuxtLink to="/jobs" class="draft-note__btn">پروژه‌های باز</NuxtLink>
        منتظرند.
      </p>

      <div v-else class="panel" style="padding:1rem">
        <ASkeleton w="100%" h="3.5rem" radius="16px" />
      </div>
    </section>

    <!-- ── علاقه‌مندی‌ها ── -->
    <section class="reqs" v-reveal>
      <div class="section-head" style="margin-bottom:1rem">
        <div class="section-head__titles">
          <span class="section-head__kicker">ذخیره‌شده‌ها</span>
          <h2 class="t-h2">علاقه‌مندی‌های تو</h2>
        </div>
      </div>
      <div class="saves">
        <NuxtLink to="/jobs?saved=1" class="panel saves__item">
          <AIcon name="bookmark" :size="18" />
          <strong>پروژه‌های ذخیره‌شده</strong>
          <span class="saves__n">{{ fa.format(savedJobs.ids.value.length) }}</span>
        </NuxtLink>
        <NuxtLink to="/spots" class="panel saves__item">
          <AIcon name="heart" :size="18" />
          <strong>لوکیشن‌های نشان‌شده</strong>
          <span class="saves__n">در صفحه‌ی لوکیشن‌ها</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; }

.account { display: flex; align-items: center; gap: 1rem; padding: 1.1rem 1.2rem; flex-wrap: wrap; }
.account__avatar {
  width: 3.4rem;
  height: 3.4rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
  font-weight: 900;
  font-size: 1.3rem;
}
.account__avatar--letter { background: var(--ink); color: var(--bg); }
.account__body { display: grid; gap: 0.25rem; min-width: 0; flex: 1; }
.account__name { display: inline-flex; align-items: center; gap: 0.35rem; font-size: var(--fs-md); font-weight: 900; }
.account__verified { color: var(--green); }
.account__contact { font-size: var(--fs-caption); color: var(--muted); }
.account__roles { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.2rem; }

.manage { display: grid; gap: 0.6rem; margin-top: 0.9rem; }
@media (min-width: 640px) { .manage { grid-template-columns: repeat(3, 1fr); } }
.manage__item { display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; transition: all 0.2s; }
.manage__item:hover { transform: translateY(-2px); box-shadow: var(--shadow-soft); }
.manage__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: var(--r-sm);
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.manage__body { display: grid; gap: 0.1rem; min-width: 0; }
.manage__body strong { font-size: var(--fs-small); font-weight: 900; }
.manage__body small { font-size: 0.66rem; color: var(--muted); line-height: 1.7; }
.manage__arrow { margin-inline-start: auto; color: var(--faint); flex-shrink: 0; }

.reqs { margin-top: var(--sp-6); }
.reqs__list { display: grid; gap: 0.55rem; }
.req, .prop { display: flex; align-items: center; gap: 0.9rem; padding: 0.8rem 1rem; }
.req__code {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--ink-soft);
  background: var(--bg-deep);
  border-radius: var(--r-xs);
  padding: 0.35rem 0.55rem;
  flex-shrink: 0;
}
.prop__icon {
  width: 2.2rem; height: 2.2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--green-soft);
  color: var(--green);
  flex-shrink: 0;
}
.req__body { display: grid; gap: 0.1rem; min-width: 0; flex: 1; }
.req__title { font-size: var(--fs-small); font-weight: 800; }
.req__side { display: flex; align-items: center; gap: 0.7rem; flex-shrink: 0; }
.req__price { font-size: var(--fs-caption); font-weight: 900; white-space: nowrap; }
.local-note { color: var(--faint); margin-top: 0.5rem; }
.prop-empty { color: var(--muted); }

.saves { display: grid; gap: 0.6rem; }
@media (min-width: 640px) { .saves { grid-template-columns: repeat(2, 1fr); } }
.saves__item { display: flex; align-items: center; gap: 0.7rem; padding: 0.9rem 1rem; font-size: var(--fs-small); font-weight: 800; }
.saves__item svg { color: var(--indigo); }
.saves__n { margin-inline-start: auto; font-size: var(--fs-caption); font-weight: 700; color: var(--muted); }
</style>
