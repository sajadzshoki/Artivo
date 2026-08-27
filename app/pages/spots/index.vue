<script setup lang="ts">
import { spotCategories, spotCategoryLabels } from '#shared/config/spot-categories'
import { formatDistance, haversineKm } from '#shared/utils/geo'
import { useSpots } from '~/composables/useSpots'
import { useSavedSpots } from '~/composables/useSavedSpots'
import { useUserLocation } from '~/composables/useUserLocation'

// ─────────────────────────────────────────────────────────────
// کشف لوکیشن‌های عکاسی — نقشه/فهرست، جست‌وجو، دسته‌بندی، نزدیک‌ترین
// موبایل: تعویض نقشه ↔ فهرست · دسکتاپ: نمای دو‌تکه‌ی همزمان
// ─────────────────────────────────────────────────────────────
useHead({ title: 'لوکیشن‌های عکاسی — آرتیوو' })

const { all, ready, photosOf } = useSpots()
const saved = useSavedSpots()
const { pos: userPos, status: locStatus, locate } = useUserLocation()

const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')

// ── وضعیت UI ──
const view = ref<string>('list')
const query = ref('')
const category = ref<string>('all')
const savedOnly = ref(false)
const sortBy = ref<string>('popular')
const selectedId = ref<string | null>(null)

const categoryOptions = [
  { value: 'all', label: 'همه' },
  ...spotCategories.map(c => ({ value: c.id as string, label: c.label })),
]

const sortOptions = [
  { value: 'popular', label: 'محبوب‌ترین' },
  { value: 'nearby', label: 'نزدیک‌ترین' },
  { value: 'newest', label: 'تازه‌ها' },
]

const selectedSpot = computed(() => all.value.find(s => s.id === selectedId.value) ?? null)
const selectedCover = computed(() => (selectedSpot.value ? photosOf(selectedSpot.value)[0]?.url : undefined))

// ── فیلتر و مرتب‌سازی ──
const filtered = computed(() => {
  let list = [...all.value]
  const q = query.value.trim()
  if (q) {
    list = list.filter(s =>
      s.name.includes(q)
      || s.city.includes(q)
      || s.description.includes(q)
      || s.tags.some(t => t.includes(q)))
  }
  if (category.value !== 'all') list = list.filter(s => s.categories.includes(category.value as SpotCategoryId))
  if (savedOnly.value) list = list.filter(s => saved.isSaved(s.id))

  if (sortBy.value === 'popular') {
    list.sort((a, b) => b.rating - a.rating)
  }
  else if (sortBy.value === 'newest') {
    list.sort((a, b) => Number(b.userAdded ?? false) - Number(a.userAdded ?? false))
  }
  else if (sortBy.value === 'nearby' && userPos.value) {
    list.sort((a, b) => haversineKm(userPos.value!, a.location) - haversineKm(userPos.value!, b.location))
  }
  return list
})

const mapSpots = computed(() => filtered.value)

/** قاب اولیه‌ی نقشه: میانگین مراکز لوکیشن‌های فیلترشده */
const mapCenter = computed(() => {
  const list = mapSpots.value
  if (!list.length) return { lat: 35.7219, lng: 51.389 }
  const lat = list.reduce((s, x) => s + x.location.lat, 0) / list.length
  const lng = list.reduce((s, x) => s + x.location.lng, 0) / list.length
  return { lat, lng }
})

async function onNearby() {
  const p = await locate()
  if (p) {
    sortBy.value = 'nearby'
    toast.success('موقعیت شما پیدا شد', 'لوکیشن‌ها بر اساس فاصله مرتب شدند.')
  }
  else {
    toast.error('دسترسی به موقعیت ممکن نشد', 'می‌توانید از مرتب‌سازی محبوب‌ترین استفاده کنید.')
  }
}

function distanceOf(spotId: string): number | null {
  if (!userPos.value) return null
  const s = all.value.find(x => x.id === spotId)
  return s ? haversineKm(userPos.value, s.location) : null
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Photo Spots</p>
      <h1 class="t-h1 page-head__title">لوکیشن‌های عکاسی</h1>
      <p class="t-body page-head__desc">
        نقشه‌ی تعاملی نشان + راهنمای میدانی عکاس‌ها؛ با بهترین ساعت نور، عکس‌های واقعی و فیلتر بر اساس نوع عکاسی.
      </p>
    </header>

    <!-- جست‌وجو + کنترل‌ها -->
    <div class="toolbar" v-reveal>
      <AInput v-model="query" icon="search" placeholder="جست‌وجوی لوکیشن، شهر یا تگ…" />

      <div class="toolbar__row">
        <AFilterChips v-model="category" :options="categoryOptions" label="فیلتر دسته" class="toolbar__cats" />
        <div class="toolbar__side">
          <button
            type="button"
            class="toolbar__nearby"
            :class="{ 'toolbar__nearby--on': locStatus === 'ready' }"
            :disabled="locStatus === 'locating'"
            @click="onNearby"
          >
            <ASpinner v-if="locStatus === 'locating'" :size="14" />
            <AIcon v-else name="map-pin" :size="15" />
            نزدیک‌ترین
          </button>
          <ASelect v-model="sortBy" :options="sortOptions" class="toolbar__sort" />
        </div>
      </div>

      <div class="toolbar__bottom">
        <ASegmented
          v-model="view"
          :options="[{ value: 'list', label: 'فهرست' }, { value: 'map', label: 'نقشه' }]"
          class="toolbar__toggle"
        />
        <button
          type="button"
          class="toolbar__saved"
          :class="{ 'toolbar__saved--on': savedOnly }"
          @click="savedOnly = !savedOnly"
        >
          <AIcon name="heart" :size="15" :fill="savedOnly" />
          علاقه‌مندی‌ها
          <span v-if="saved.ids.value.length" class="toolbar__savedn">{{ fa.format(saved.ids.value.length) }}</span>
        </button>
      </div>
    </div>

    <p class="count t-caption" aria-live="polite">
      {{ ready ? `${fa.format(filtered.length)} لوکیشن` : '…' }}
      <template v-if="userPos && sortBy === 'nearby'"> · مرتب بر اساس فاصله از شما</template>
    </p>

    <!-- ── نمای دو‌تکه: نقشه + فهرست ── -->
    <div class="explore" :class="`explore--${view}`">
      <!-- نقشه -->
      <div class="explore__map" v-reveal>
        <SpotMap
          :spots="mapSpots"
          :center="mapCenter"
          :zoom="12"
          :selected-id="selectedId"
          height="100%"
          class="explore__mapbox"
          @select="id => (selectedId = selectedId === id ? null : id)"
        />

        <!-- کارت انتخاب روی نقشه -->
        <Transition name="sheet">
          <div v-if="selectedSpot" class="mapcard">
            <button type="button" class="mapcard__close" aria-label="بستن" @click="selectedId = null">
              <AIcon name="x" :size="16" />
            </button>
            <div class="mapcard__img">
              <img v-if="selectedCover" :src="selectedCover" :alt="selectedSpot.name">
            </div>
            <div class="mapcard__body">
              <strong class="mapcard__name">{{ selectedSpot.name }}</strong>
              <span class="mapcard__meta">{{ selectedSpot.city }} · {{ selectedSpot.bestTime }}</span>
              <NuxtLink :to="`/spots/${selectedSpot.id}`" class="mapcard__link">
                مشاهده‌ی جزئیات
                <AIcon name="arrow-left" :size="14" />
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>

      <!-- فهرست -->
      <div class="explore__list">
        <div v-if="!ready" class="grid">
          <div v-for="i in 4" :key="i" class="panel" style="overflow:hidden">
            <ASkeleton h="11rem" radius="0" />
            <div style="display:grid;gap:.6rem;padding:1rem">
              <ASkeleton w="55%" h="1rem" />
              <ASkeleton w="85%" h="0.8rem" />
            </div>
          </div>
        </div>

        <template v-else>
          <TransitionGroup name="list" tag="div" class="grid">
            <SpotCard
              v-for="s in filtered"
              :key="s.id"
              :spot="s"
              :user-pos="userPos"
              @click="selectedId = s.id"
            />
            <AEmptyState
              v-if="filtered.length === 0"
              key="empty"
              icon="map-pin"
              title="لوکیشنی با این فیلترها پیدا نشد"
              description="جست‌وجو را کوتاه‌تر کن یا دسته‌ی دیگری را انتخاب کن؛ یا خودت اولین لوکیشن را اضافه کن!"
            >
              <AButton to="/spots/new" size="sm" icon-end="plus">افزودن لوکیشن جدید</AButton>
            </AEmptyState>
          </TransitionGroup>

          <div class="addcta">
            <p class="t-small">لوکیشن مخفی‌ای می‌شناسی که این‌جا نیست؟</p>
            <AButton to="/spots/new" variant="outline" size="sm" icon-end="plus">افزودن لوکیشن جدید</AButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 32rem; }

.toolbar { display: grid; gap: 0.7rem; }
.toolbar__row { display: flex; align-items: center; gap: 0.7rem; }
.toolbar__cats { flex: 1; min-width: 0; }
.toolbar__side { display: flex; gap: 0.5rem; flex-shrink: 0; }

.toolbar__nearby {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  height: 2.9rem;
  padding-inline: 0.95rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  font-size: var(--fs-small);
  font-weight: 800;
  white-space: nowrap;
  transition: all 0.2s;
}
.toolbar__nearby:hover { border-color: var(--ink); }
.toolbar__nearby:disabled { opacity: 0.6; }
.toolbar__nearby--on { border-color: var(--green); color: var(--green); background: var(--green-soft); }

.toolbar__sort { width: 9.5rem; }

.toolbar__bottom { display: flex; align-items: center; justify-content: space-between; gap: 0.7rem; }
.toolbar__toggle { max-width: 14rem; }

.toolbar__saved {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink-soft);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.85rem;
  transition: all 0.2s;
}
.toolbar__saved--on { color: var(--coral); border-color: var(--coral); background: var(--coral-soft); }
.toolbar__savedn {
  min-width: 1.2rem;
  height: 1.2rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
  font-size: 0.62rem;
}

.count { margin-top: 1rem; }

/* ── explore ── */
.explore { margin-top: 0.4rem; display: grid; gap: 1rem; }

.explore__map {
  position: relative;
  height: 60vh;
  min-height: 20rem;
  display: none;
}

.explore__mapbox { height: 100% !important; }

.mapcard {
  position: absolute;
  bottom: 0.9rem;
  inset-inline: 0.9rem;
  z-index: 5;
  display: flex;
  gap: 0.7rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.7rem;
  box-shadow: var(--shadow-pop);
  max-width: 26rem;
}
.mapcard__close {
  position: absolute;
  top: 0.45rem;
  inset-inline-end: 0.45rem;
  width: 1.8rem;
  height: 1.8rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  color: var(--muted);
  background: var(--bg-deep);
}
.mapcard__img {
  width: 5rem;
  aspect-ratio: 4 / 3;
  border-radius: var(--r-xs);
  overflow: hidden;
  background: var(--bg-deep);
  flex-shrink: 0;
}
.mapcard__img img { width: 100%; height: 100%; object-fit: cover; }
.mapcard__body { display: grid; gap: 0.15rem; align-content: center; min-width: 0; padding-inline-end: 1.6rem; }
.mapcard__name { font-size: var(--fs-small); font-weight: 900; }
.mapcard__meta { font-size: var(--fs-caption); color: var(--muted); }
.mapcard__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  margin-top: 0.15rem;
}

.sheet-enter-active { transition: all 0.3s var(--ease-out); }
.sheet-leave-active { transition: all 0.2s ease-in; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; transform: translateY(12px); }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(19rem, 100%), 1fr));
  gap: 0.9rem;
}

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }

.addcta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r-md);
  margin-top: 0.6rem;
}

/* ── موبایل: نمایش یک پنل ── */
@media (max-width: 899px) {
  .explore--list .explore__map { display: none; }
  .explore--map .explore__map { display: block; }
  .explore--map .explore__list { display: none; }
}

/* ── دسکتاپ: هر دو همزمان ── */
@media (min-width: 900px) {
  .explore { grid-template-columns: 1.1fr 1fr; align-items: start; }
  .explore__map {
    display: block;
    position: sticky;
    top: 5rem;
    height: calc(100dvh - 12rem) !important;
    min-height: 26rem;
  }
  .toolbar__toggle { display: none; }
}
</style>
