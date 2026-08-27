<script setup lang="ts">
import { formatTomanCompact } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// داشبورد ادمین — مرور وضعیت + میان‌برها
// ─────────────────────────────────────────────────────────────
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
useHead({ title: 'پنل مدیریت — آرتیوو' })

interface Stats {
  users: number
  jobs: number
  jobsOpen: number
  spots: number
  services: number
  communityCreatives: number
  fontPacks: number
  palettes: number
  pricingCustomized: boolean
  minimumPrice: number
  recentUsers: { id: string; name: string; email: string; mobile: string; roles: string[]; createdAt: string }[]
}

const stats = ref<Stats | null>(null)
const loadError = ref('')
const loading = ref(true)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    stats.value = await $fetch<Stats>('/api/admin/stats')
  }
  catch (err: unknown) {
    loadError.value = (err as { data?: { message?: string } })?.data?.message ?? 'بارگذاری ناموفق بود.'
  }
  finally {
    loading.value = false
  }
}
onMounted(load)

const quickLinks = [
  { to: '/admin/pricing', icon: 'wallet', label: 'موتور قیمت', desc: 'قواعد قیمت‌گذاری کل پلتفرم' },
  { to: '/admin/collection/users', icon: 'user', label: 'کاربران', desc: 'نقش‌ها و وضعیت حساب‌ها' },
  { to: '/admin/collection/jobs', icon: 'briefcase', label: 'پروژه‌ها', desc: 'توقف و بازگشایی آگهی‌ها' },
  { to: '/admin/collection/spots', icon: 'map-pin', label: 'لوکیشن‌ها', desc: 'مخفی/ویژه‌کردن لوکیشن عکاسی' },
]

const fa = new Intl.NumberFormat('fa-IR')
const dateFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })
</script>

<template>
  <div class="dash">
    <header class="dash__hero" v-reveal>
      <p class="overline">Admin</p>
      <h2 class="t-h1">مرکز فرماندهی آرتیوو</h2>
      <p class="t-body dash__sub">
        قیمت‌گذاری مرکزی، محتوا و کاربران — همه از یک‌جا؛ بدون دست زدن به کد.
      </p>
    </header>

    <div v-if="loading" class="dash__grid">
      <div v-for="i in 4" :key="i" class="panel" style="padding:1.1rem">
        <ASkeleton h="3.2rem" radius="12px" />
      </div>
    </div>

    <div v-else-if="loadError" class="panel dash__error">
      <AIcon name="info" :size="18" />
      <p>{{ loadError }}</p>
      <AButton size="sm" variant="outline" @click="load">تلاش دوباره</AButton>
    </div>

    <template v-else-if="stats">
      <!-- آمار -->
      <div class="dash__grid" v-reveal>
        <NuxtLink to="/admin/collection/users" class="panel stat">
          <span class="stat__n">{{ fa.format(stats.users) }}</span>
          <span class="stat__l">کاربر</span>
        </NuxtLink>
        <NuxtLink to="/admin/collection/jobs" class="panel stat">
          <span class="stat__n">{{ fa.format(stats.jobsOpen) }}</span>
          <span class="stat__l">پروژه‌ی باز</span>
        </NuxtLink>
        <NuxtLink to="/admin/collection/spots" class="panel stat">
          <span class="stat__n">{{ fa.format(stats.spots) }}</span>
          <span class="stat__l">لوکیشن عکاسی</span>
        </NuxtLink>
        <NuxtLink to="/admin/pricing" class="panel stat stat--price">
          <span class="stat__n">{{ formatTomanCompact(stats.minimumPrice) }}</span>
          <span class="stat__l">
            حداقل مبلغ پروژه
            <ATag v-if="stats.pricingCustomized" label="سفارشی‌شده" tone="indigo" />
          </span>
        </NuxtLink>
      </div>

      <!-- میان‌برها -->
      <div class="dash__links" v-reveal>
        <NuxtLink v-for="l in quickLinks" :key="l.to" :to="l.to" class="panel qlink">
          <span class="qlink__icon"><AIcon :name="l.icon" :size="18" /></span>
          <span>
            <strong>{{ l.label }}</strong>
            <small>{{ l.desc }}</small>
          </span>
          <AIcon name="arrow-left" :size="15" class="qlink__arrow" />
        </NuxtLink>
      </div>

      <!-- کاربران تازه -->
      <section class="panel recent" v-reveal>
        <h3 class="recent__h">تازه‌ترین ثبت‌نام‌ها</h3>
        <ul v-if="stats.recentUsers.length" class="recent__list">
          <li v-for="u in stats.recentUsers" :key="u.id" class="recent__row">
            <strong>{{ u.name }}</strong>
            <span class="latin recent__contact" dir="ltr">{{ u.mobile || u.email }}</span>
            <span class="recent__date">{{ dateFmt.format(new Date(u.createdAt)) }}</span>
          </li>
        </ul>
        <p v-else class="t-caption">هنوز ثبت‌نامی غیر از حساب‌های نمونه نیست.</p>
      </section>
    </template>
  </div>
</template>

<style scoped>
.dash { display: grid; gap: 1.4rem; }
.dash__hero { display: grid; gap: 0.3rem; }
.dash__sub { color: var(--muted); max-width: 30rem; }

.dash__grid { display: grid; gap: 0.7rem; }
@media (min-width: 640px) { .dash__grid { grid-template-columns: repeat(4, 1fr); } }
.stat { display: grid; gap: 0.2rem; padding: 1.1rem 1.2rem; transition: transform 0.2s; }
.stat:hover { transform: translateY(-2px); }
.stat__n { font-size: 1.7rem; font-weight: 900; }
.stat__l { font-size: var(--fs-caption); color: var(--muted); font-weight: 700; display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap; }
.stat--price .stat__n { color: var(--coral-deep); }

.dash__error { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; color: var(--coral-deep); }

.dash__links { display: grid; gap: 0.6rem; }
@media (min-width: 640px) { .dash__links { grid-template-columns: repeat(2, 1fr); } }
.qlink { display: flex; align-items: center; gap: 0.8rem; padding: 0.9rem 1rem; transition: transform 0.2s; }
.qlink:hover { transform: translateY(-2px); }
.qlink__icon {
  width: 2.5rem; height: 2.5rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.qlink strong { display: block; font-size: var(--fs-small); font-weight: 900; }
.qlink small { display: block; font-size: 0.66rem; color: var(--muted); }
.qlink__arrow { margin-inline-start: auto; color: var(--faint); }

.recent { padding: 1.2rem 1.3rem; display: grid; gap: 0.8rem; }
.recent__h { font-size: var(--fs-md); font-weight: 900; }
.recent__list { display: grid; gap: 0.5rem; }
.recent__row {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: var(--fs-small);
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--line);
}
.recent__row:last-child { border-bottom: 0; padding-bottom: 0; }
.recent__contact { font-size: var(--fs-caption); color: var(--muted); }
.recent__date { margin-inline-start: auto; font-size: var(--fs-caption); color: var(--faint); }
</style>
