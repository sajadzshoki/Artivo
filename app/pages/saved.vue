<script setup lang="ts">
import type { Creative } from '#shared/types'
import { useSavedJobs } from '~/composables/useSavedJobs'
import { useSavedCreatives } from '~/composables/useSavedCreatives'
import { useSavedSpots } from '~/composables/useSavedSpots'
import { useOverlay } from '~/composables/useOverlay'
import { useSpots } from '~/composables/useSpots'
import { formatTomanCompact } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// ذخیره‌شده‌ها — پروژه‌ها (باز بازار)، خلاق‌ها، لوکیشن‌های عکاسی
// ─────────────────────────────────────────────────────────────
useHead({ title: 'ذخیره‌شده‌ها — آرتیوو' })

const route = useRoute()
const router = useRouter()

const tab = ref<'jobs' | 'creatives' | 'spots'>(
  ['jobs', 'creatives', 'spots'].includes(String(route.query.tab)) ? route.query.tab as 'jobs' | 'creatives' | 'spots' : 'jobs',
)
watch(tab, (t) => router.replace({ query: { ...route.query, tab: t } }))

const savedJobs = useSavedJobs()
const savedCreatives = useSavedCreatives()
const savedSpots = useSavedSpots()
const { allCreatives } = useOverlay()
const spots = useSpots()

const fa = new Intl.NumberFormat('fa-IR')

const creativeList = computed<Creative[]>(() =>
  savedCreatives.ids.value
    .map(id => allCreatives.value.find(c => c.id === id))
    .filter((c): c is Creative => !!c))

const spotList = computed(() =>
  savedSpots.ids.value
    .map(id => spots.getById(id))
    .filter((s): s is NonNullable<typeof s> => !!s))

const jobsCount = computed(() => savedJobs.ids.value.length)
const creativesCount = computed(() => savedCreatives.ids.value.length)
const spotsCount = computed(() => savedSpots.ids.value.length)

// spots روی mount داده‌ی محلی را می‌خواند؛ محاسبه‌ها reactive هستند.
const tabOptions = computed(() => [
  { value: 'jobs', label: `پروژه‌ها${jobsCount.value ? ` (${fa.format(jobsCount.value)})` : ''}` },
  { value: 'creatives', label: `خلاق‌ها${creativesCount.value ? ` (${fa.format(creativesCount.value)})` : ''}` },
  { value: 'spots', label: `لوکیشن‌ها${spotsCount.value ? ` (${fa.format(spotsCount.value)})` : ''}` },
])
</script>

<template>
  <div class="container sv">
    <header class="page-head" v-reveal>
      <p class="overline">Saved</p>
      <h1 class="t-h1 page-head__title">ذخیره‌شده‌ها</h1>
      <p class="t-body page-head__desc">هرچه نشان کردی، این‌جا منتظرت می‌ماند.</p>
      <ASegmented v-model="tab" :options="tabOptions" class="sv__seg" />
    </header>

    <!-- ═══ پروژه‌های ذخیره‌شده (بازار) ═══ -->
    <section v-show="tab === 'jobs'" class="sv__body" v-reveal>
      <div v-if="!savedJobs.ready.value" class="panel" style="padding:1rem">
        <ASkeleton h="4rem" radius="16px" />
      </div>
      <template v-else>
        <p class="t-caption sv__note">پروژه‌های ذخیره‌شده‌ی بازار کار در صفحه‌ی «پروژه‌ها» با فیلتر ذخیره‌شده‌ها دیده می‌شوند.</p>
        <AButton to="/jobs?saved=1" icon-end="arrow-left">نمایش در بازار پروژه‌ها</AButton>
        <AEmptyState
          v-if="!jobsCount"
          icon="bookmark"
          title="هنوز پروژه‌ای نشان نکرده‌ای"
          description="در بازار پروژه‌ها، روی نشانِ هر پروژه بزن تا این‌جا ذخیره شود."
        >
          <AButton to="/jobs" size="sm">مرور پروژه‌ها</AButton>
        </AEmptyState>
      </template>
    </section>

    <!-- ═══ خلاق‌های ذخیره‌شده ═══ -->
    <section v-show="tab === 'creatives'" class="sv__body" v-reveal>
      <div v-if="creativeList.length" class="cards">
        <article v-for="c in creativeList" :key="c.id" class="panel crd">
          <NuxtLink :to="`/creatives/${c.id}`" class="crd__link" :aria-label="c.name" />
          <span class="crd__avatar" :class="{ 'crd__avatar--img': c.avatar }">
            <img v-if="c.avatar" :src="c.avatar" :alt="c.name" loading="lazy">
            <template v-else>{{ c.name.charAt(0) }}</template>
          </span>
          <div class="crd__body">
            <strong>{{ c.name }}</strong>
            <small>{{ c.role }} · {{ c.city }}</small>
          </div>
          <div class="crd__side">
            <strong class="crd__price">{{ formatTomanCompact(c.startingPrice) }}</strong>
            <button type="button" class="crd__unsave" :aria-label="`حذف ${c.name} از ذخیره‌ها`" @click="savedCreatives.toggle(c.id)">
              <AIcon name="heart" :size="15" fill />
            </button>
          </div>
        </article>
      </div>
      <AEmptyState
        v-else
        icon="users"
        title="خلاقی ذخیره نکرده‌ای"
        description="قلب کنار هر خلاق را بزن تا این‌جا منتظرت بماند."
      >
        <AButton to="/creatives" size="sm">مرور خلاق‌ها</AButton>
      </AEmptyState>
    </section>

    <!-- ═══ لوکیشن‌های ذخیره‌شده ═══ -->
    <section v-show="tab === 'spots'" class="sv__body" v-reveal>
      <div v-if="spotList.length" class="cards">
        <NuxtLink v-for="s in spotList" :key="s.id" :to="`/spots/${s.id}`" class="panel crd">
          <span class="crd__avatar crd__avatar--spot" :style="{ background: `linear-gradient(150deg, ${s.accent}30, ${s.accent}60)` }">
            <img v-if="s.image" :src="s.image" :alt="s.name" loading="lazy">
            <AIcon v-else name="map-pin" :size="18" />
          </span>
          <div class="crd__body">
            <strong>{{ s.name }}</strong>
            <small>{{ s.city }} · {{ s.bestTime }}</small>
          </div>
          <AIcon name="arrow-left" :size="15" class="crd__go" />
        </NuxtLink>
        <p class="t-caption sv__note">مدیریت کامل در <NuxtLink to="/spots" class="sv__link">صفحه‌ی لوکیشن‌ها</NuxtLink> با فیلتر علاقه‌مندی‌ها.</p>
      </div>
      <AEmptyState
        v-else
        icon="heart"
        title="لوکیشنی ذخیره نکرده‌ای"
        description="در نقشه‌ی لوکیشن‌ها، قلب هر لوکیشن را بزن."
      >
        <AButton to="/spots" size="sm">مرور لوکیشن‌ها</AButton>
      </AEmptyState>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.4rem; }
.page-head__desc { color: var(--muted); }
.sv__seg { max-width: 22rem; margin-top: 0.6rem; }
.sv__body { display: grid; gap: 0.8rem; justify-items: start; }
.sv__note { color: var(--faint); }
.sv__link { color: var(--coral-deep); font-weight: 800; }

.cards { display: grid; gap: 0.55rem; width: 100%; }
.crd {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.8rem 1rem;
  transition: transform 0.2s var(--ease-out);
}
.crd:hover { transform: translateY(-1px); }
.crd__link { position: absolute; inset: 0; }

.crd__avatar {
  width: 2.9rem; height: 2.9rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  font-weight: 900;
  overflow: hidden;
  flex-shrink: 0;
}
.crd__avatar img { width: 100%; height: 100%; object-fit: cover; }
.crd__avatar--spot { border-radius: var(--r-sm); }

.crd__body { display: grid; gap: 0.1rem; min-width: 0; flex: 1; }
.crd__body strong { font-size: var(--fs-small); font-weight: 900; overflow-wrap: anywhere; }
.crd__body small { font-size: 0.66rem; color: var(--muted); }

.crd__side { display: grid; gap: 0.3rem; justify-items: end; flex-shrink: 0; }
.crd__price { font-size: var(--fs-caption); font-weight: 900; color: var(--coral-deep); }
.crd__unsave {
  width: 2rem; height: 2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  color: var(--coral);
  background: var(--coral-soft);
}
.crd__go { color: var(--faint); }
</style>
