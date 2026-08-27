<script setup lang="ts">
import type { LightboxSlide } from '#shared/types'
import { spotCategoryLabels } from '#shared/config/spot-categories'
import { formatDistance, haversineKm } from '#shared/utils/geo'
import { useSpots } from '~/composables/useSpots'
import { useSavedSpots } from '~/composables/useSavedSpots'
import { useUserLocation } from '~/composables/useUserLocation'

// ─────────────────────────────────────────────────────────────
// جزئیات لوکیشن عکاسی — گالری بزرگ، نقشه، امتیاز، عکس‌های کاربران
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')

const { getById, displayRating, rate, photosOf, ready, all: allSpotsList, addPhoto: addPhotoTo } = useSpots()
const saved = useSavedSpots()
const { pos: userPos } = useUserLocation()

const spot = computed(() => getById(String(route.params.id)))

// در SSR فقط داده‌ی استاتیک معتبر است → ۴۰۴ واقعی برای آیتم‌های ناموجود
if (!spot.value && import.meta.server) {
  throw createError({ statusCode: 404, message: 'لوکیشن پیدا نشد' })
}
// روی کلاینت، بررسی نهایی بعد از لود دیتای localStorage انجام می‌شود
const notFound = computed(() => ready.value && !spot.value)

useHead(() => ({
  title: spot.value ? `${spot.value.name} — لوکیشن عکاسی | آرتیوو` : 'آرتیوو',
}))

// عکس‌های پایه + عکس‌های افزوده‌ی کاربران (بعد از mount)
const photos = computed(() => (spot.value ? photosOf(spot.value) : []))
const gallery = computed<LightboxSlide[]>(() =>
  photos.value.map((p, i) => ({
    id: p.id,
    title: `${spot.value?.name ?? ''} — عکس ${fa.format(i + 1)}`,
    description: `عکاس: ${p.author}`,
    cover: p.url,
  })))

const ratingInfo = computed(() => (spot.value ? displayRating(spot.value) : { rating: 0, count: 0 }))
const distance = computed(() =>
  (spot.value && userPos.value) ? haversineKm(userPos.value, spot.value.location) : null)

const neshanUrl = computed(() =>
  spot.value ? `https://maps.neshan.org/@${spot.value.location.lat},${spot.value.location.lng},16z` : '#')

const lightboxIndex = ref<number | null>(null)
const showAddPhoto = ref(false)
const newPhotos = ref<{ url: string; author: string }[]>([])

function onSave() {
  if (!spot.value) return
  const now = saved.toggle(spot.value.id)
  toast.success(now ? 'ذخیره شد' : 'از علاقه‌مندی‌ها حذف شد', spot.value.name)
}

function onRate(stars: number) {
  if (!spot.value) return
  rate(spot.value.id, stars)
  toast.success('امتیازت ثبت شد', `به «${spot.value.name}» ${fa.format(stars)} ستاره دادی.`)
}

function submitPhotos() {
  if (!spot.value || !newPhotos.value.length) return
  for (const ph of newPhotos.value) addPhotoTo(spot.value.id, ph)
  newPhotos.value = []
  showAddPhoto.value = false
  toast.success('عکس‌هایت اضافه شد', 'از این به بعد در گالری همین لوکیشن می‌بینندش.')
}

const moreLike = computed(() => {
  if (!spot.value) return []
  return allSpotsList.value
    .filter(s => s.id !== spot.value?.id && s.categories.some(c => spot.value?.categories.includes(c)))
    .slice(0, 3)
})
</script>

<template>
  <div v-if="spot" class="container sd">
    <nav class="crumbs" aria-label="مسیر">
      <NuxtLink to="/spots">لوکیشن‌های عکاسی</NuxtLink>
      <AIcon name="chevron-left" :size="13" />
      <span>{{ spot.city.split('·')[0]?.trim() }}</span>
    </nav>

    <!-- ── گالری بزرگ ── -->
    <section class="gal" v-reveal>
      <button
        v-if="photos.length"
        type="button"
        class="gal__main"
        @click="lightboxIndex = 0"
        aria-label="بزرگ‌نمایی گالری"
      >
        <img :src="photos[0]?.url ?? spot.image" :alt="spot.name" width="1200" height="800">
        <span class="gal__zoom"><AIcon name="eye" :size="15" /> تماشای گالری</span>
      </button>
      <div v-else class="gal__empty" :style="{ background: `linear-gradient(150deg, ${spot.accent}26, ${spot.accent}5E)` }">
        <AIcon name="camera" :size="30" />
        <p>اولین عکس این لوکیشن را تو اضافه کن!</p>
        <AButton size="sm" icon-end="plus" @click="showAddPhoto = true">افزودن عکس</AButton>
      </div>

      <div v-if="photos.length > 1" class="gal__thumbs">
        <button
          v-for="(ph, i) in photos.slice(1, 5)"
          :key="ph.id"
          type="button"
          class="gal__thumb"
          @click="lightboxIndex = i + 1"
        >
          <img :src="ph.url" :alt="`عکس ${fa.format(i + 2)} از ${spot.name}`" loading="lazy">
        </button>
        <button v-if="photos.length > 5" type="button" class="gal__more" @click="lightboxIndex = 1">
          +{{ fa.format(photos.length - 5) }}
        </button>
      </div>
    </section>

    <!-- ── سربرگ ── -->
    <header class="head" v-reveal>
      <div class="head__main">
        <h1 class="t-display head__title">{{ spot.name }}</h1>
        <div class="head__meta">
          <span class="head__city"><AIcon name="map-pin" :size="15" /> {{ spot.city }}</span>
          <ARating :rating="ratingInfo.rating" :size="14" show-value />
          <span class="head__count">({{ fa.format(ratingInfo.count) }} امتیاز)</span>
          <span v-if="distance != null" class="head__dist"><AIcon name="compass" :size="14" /> {{ formatDistance(distance) }} از شما</span>
        </div>
        <div class="head__cats">
          <ATag v-for="c in spot.categories" :key="c" :label="spotCategoryLabels[c]" tone="neutral" />
          <ATag v-if="spot.userAdded" label="افزوده‌ی کاربر" tone="indigo" />
        </div>
      </div>

      <div class="head__side">
        <button type="button" class="head__save" :class="{ 'head__save--on': saved.isSaved(spot.id) }" @click="onSave">
          <AIcon name="heart" :size="18" :fill="saved.isSaved(spot.id)" />
          {{ saved.isSaved(spot.id) ? 'ذخیره شد' : 'ذخیره' }}
        </button>
        <a :href="neshanUrl" target="_blank" rel="noopener" class="head__dir">
          <AIcon name="send" :size="16" />
          مسیریابی
        </a>
      </div>
    </header>

    <!-- امتیازدهی کاربر -->
    <div class="rate" v-reveal>
      <RatingStars :model-value="ratingInfo.mine ?? null" @update="onRate" />
    </div>

    <!-- ── بدنه ── -->
    <div class="body">
      <div class="main">
        <section class="block" v-reveal>
          <h2 class="block__h">درباره‌ی این لوکیشن</h2>
          <p class="block__desc">{{ spot.description }}</p>
          <aside class="tip">
            <span class="tip__badge"><AIcon name="sparkles" :size="15" /></span>
            <div>
              <strong>نکته‌ی عکاس‌ها</strong>
              <p>{{ spot.tip }}</p>
            </div>
          </aside>
        </section>

        <section class="block" v-reveal>
          <h2 class="block__h">اطلاعات کلیدی</h2>
          <dl class="info">
            <div class="info__item">
              <dt><AIcon name="clock" :size="14" /> بهترین زمان</dt>
              <dd>{{ spot.bestTime }}</dd>
            </div>
            <div class="info__item">
              <dt><AIcon name="map" :size="14" /> نشانی</dt>
              <dd>{{ spot.address || spot.city }}</dd>
            </div>
            <div class="info__item">
              <dt><AIcon name="compass" :size="14" /> مختصات</dt>
              <dd class="latin">{{ spot.location.lat.toFixed(5) }} , {{ spot.location.lng.toFixed(5) }}</dd>
            </div>
          </dl>
          <div v-if="spot.tags.length" class="tags">
            <span v-for="t in spot.tags" :key="t" class="tags__t">#{{ t }}</span>
          </div>
        </section>

        <!-- عکس‌های کاربران -->
        <section class="block" v-reveal>
          <div class="block__head">
            <h2 class="block__h">عکس‌های کاربران</h2>
            <AButton size="sm" variant="outline" icon-end="plus" @click="showAddPhoto = true">افزودن عکس</AButton>
          </div>
          <div v-if="photos.some(p => p.user)" class="ugrid">
            <button
              v-for="(p, i) in photos.filter(x => x.user)"
              :key="p.id"
              type="button"
              class="uimg"
              @click="lightboxIndex = photos.indexOf(p)"
            >
              <img :src="p.url" :alt="`عکس ${p.author}`" loading="lazy">
              <span class="uimg__by">{{ p.author }}</span>
            </button>
          </div>
          <p v-else class="block__empty">
            هنوز کسی عکی از این‌جا نفرستاده؛ اولین نفر تو باش.
          </p>
        </section>
      </div>

      <!-- ── نقشه ── -->
      <aside class="side" v-reveal>
        <div class="side__sticky">
          <SpotMap
            :spots="[spot]"
            :center="spot.location"
            :zoom="15"
            height="16rem"
          />
          <p class="side__addr"><AIcon name="map-pin" :size="14" /> {{ spot.address || spot.city }}</p>
          <a :href="neshanUrl" target="_blank" rel="noopener" class="side__open">
            باز کردن در نقشه‌ی نشان
            <AIcon name="arrow-left" :size="14" />
          </a>
        </div>
      </aside>
    </div>

    <!-- ── مشابه‌ها ── -->
    <section v-if="moreLike.length" class="section" v-reveal>
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">لوکیشن‌های نزدیک از نظر حال‌وهوا</span>
          <h2 class="t-h2">مثل همین‌جا</h2>
        </div>
        <NuxtLink to="/spots" class="section-head__link">
          همه‌ی لوکیشن‌ها
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>
      <div class="similar">
        <SpotCard v-for="s in moreLike" :key="s.id" :spot="s" />
      </div>
    </section>

    <!-- مودال افزودن عکس -->
    <AModal v-model="showAddPhoto" title="افزودن عکس به لوکیشن" size="sm">
      <p class="addphoto__hint">
        عکس‌هایت در همین دستگاه ذخیره می‌شوند و در فاز بعدی با اکانت به لوکیشن وصل می‌شوند.
      </p>
      <PhotoUploader v-model="newPhotos" :max="4" />
      <template #footer>
        <AButton variant="outline" @click="showAddPhoto = false">انصراف</AButton>
        <AButton :disabled="!newPhotos.length" @click="submitPhotos">افزودن {{ newPhotos.length ? `(${fa.format(newPhotos.length)})` : '' }}</AButton>
      </template>
    </AModal>

    <Lightbox v-model="lightboxIndex" :items="gallery" />
  </div>

  <!-- پیدا نشد / در حال لود -->
  <div v-else-if="notFound" class="container nf">
    <AEmptyState
      icon="map-pin"
      title="این لوکیشن پیدا نشد"
      description="ممکن است حذف شده باشد یا آدرس را اشتباه وارد کرده باشی."
    >
      <AButton to="/spots" size="sm">بازگشت به لوکیشن‌ها</AButton>
    </AEmptyState>
  </div>
  <div v-else class="container nf">
    <ASkeleton h="14rem" radius="var(--r-xl)" />
    <ASkeleton w="45%" h="2rem" />
    <ASkeleton w="90%" h="1rem" />
  </div>
</template>

<style scoped>
.crumbs {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding-top: 1.4rem;
  font-size: var(--fs-caption);
  color: var(--muted);
}
.crumbs a:hover { color: var(--coral); }
.crumbs span:last-child { color: var(--ink); font-weight: 700; }

/* ── گالری ── */
.gal { margin-top: 1.4rem; display: grid; gap: 0.6rem; }
.gal__main {
  position: relative;
  display: block;
  width: 100%;
  border-radius: var(--r-xl);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
  padding: 0;
}
.gal__main img { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; }
.gal__zoom {
  position: absolute;
  bottom: 0.9rem;
  inset-inline-end: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--bg);
  border-radius: 99px;
  padding: 0.4rem 0.85rem;
  font-size: var(--fs-caption);
  font-weight: 700;
}
.gal__empty {
  border-radius: var(--r-xl);
  aspect-ratio: 21 / 9;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.5rem;
  color: color-mix(in srgb, var(--ink) 70%, transparent);
  text-align: center;
}
.gal__empty p { font-weight: 800; font-size: var(--fs-small); }
.gal__thumbs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6rem; }
.gal__thumb {
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
  padding: 0;
}
.gal__thumb img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform 0.4s var(--ease-out); }
.gal__thumb:hover img { transform: scale(1.06); }
.gal__more {
  border-radius: var(--r-sm);
  border: 1px dashed var(--line-strong);
  background: var(--paper);
  font-weight: 900;
  color: var(--ink-soft);
}

/* ── سربرگ ── */
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.4rem;
  flex-wrap: wrap;
}
.head__main { display: grid; gap: 0.5rem; justify-items: start; }
.head__title { font-size: clamp(1.7rem, 5.5vw, 3rem); }
.head__meta { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem 1rem; font-size: var(--fs-caption); color: var(--muted); }
.head__city { display: inline-flex; align-items: center; gap: 0.3rem; font-weight: 700; color: var(--ink-soft); }
.head__count { font-size: 0.66rem; }
.head__dist { display: inline-flex; align-items: center; gap: 0.3rem; font-weight: 700; color: var(--indigo-deep); background: var(--indigo-soft); border-radius: 99px; padding: 0.15rem 0.6rem; }
.head__cats { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.head__side { display: flex; gap: 0.5rem; }
.head__save, .head__dir {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.5rem 1rem;
  font-size: var(--fs-small);
  font-weight: 800;
  transition: all 0.2s;
}
.head__save:hover, .head__dir:hover { border-color: var(--ink); }
.head__save--on { color: var(--coral); border-color: var(--coral); background: var(--coral-soft); }
.head__dir { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.head__dir:hover { background: #000; }

.rate { margin-top: 1rem; padding: 0.85rem 1rem; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); width: fit-content; }

/* ── بدنه ── */
.body {
  display: grid;
  gap: var(--sp-6);
  margin-top: var(--sp-5);
}
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 21rem; align-items: start; }
  .side { position: sticky; top: 5rem; }
}

.main { display: grid; gap: var(--sp-6); }
.block { display: grid; gap: 0.8rem; }
.block__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.block__h { font-size: var(--fs-lg); font-weight: 900; }
.block__desc { font-size: var(--fs-md); line-height: 2.1; color: var(--ink-soft); }
.block__empty { font-size: var(--fs-small); color: var(--faint); }

.tip {
  display: flex;
  gap: 0.7rem;
  background: var(--amber-soft);
  border-radius: var(--r-md);
  padding: 0.9rem 1rem;
}
.tip__badge {
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--paper);
  color: var(--amber);
  flex-shrink: 0;
}
.tip strong { font-size: var(--fs-small); font-weight: 900; }
.tip p { font-size: var(--fs-small); color: var(--ink-soft); line-height: 1.95; margin-top: 0.15rem; }

.info { display: grid; grid-template-columns: 1fr; gap: 0.6rem; }
@media (min-width: 640px) { .info { grid-template-columns: repeat(3, 1fr); } }
.info__item {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.75rem 0.9rem;
  display: grid;
  gap: 0.2rem;
}
.info__item dt { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.66rem; font-weight: 800; color: var(--muted); }
.info__item dt svg { color: var(--indigo); }
.info__item dd { font-size: var(--fs-caption); font-weight: 700; line-height: 1.9; }

.tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.tags__t {
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--indigo-deep);
  background: var(--indigo-soft);
  border-radius: var(--r-pill);
  padding: 0.25rem 0.7rem;
}

/* عکس‌های کاربران */
.ugrid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
@media (min-width: 640px) { .ugrid { grid-template-columns: repeat(3, 1fr); } }
.uimg {
  position: relative;
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  padding: 0;
  background: var(--bg-deep);
}
.uimg img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform 0.4s var(--ease-out); }
.uimg:hover img { transform: scale(1.05); }
.uimg__by {
  position: absolute;
  bottom: 0.4rem;
  inset-inline-start: 0.4rem;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--bg);
  font-size: 0.62rem;
  font-weight: 700;
  border-radius: 99px;
  padding: 0.15rem 0.5rem;
}

/* ستون نقشه */
.side { display: none; }
@media (min-width: 900px) { .side { display: block; } }
.side__sticky {
  display: grid;
  gap: 0.7rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 0.8rem;
}
.side__addr { display: flex; align-items: flex-start; gap: 0.4rem; font-size: var(--fs-caption); color: var(--muted); line-height: 1.85; padding-inline: 0.3rem; }
.side__addr svg { flex-shrink: 0; margin-top: 0.2rem; color: var(--indigo); }
.side__open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  border: 1px solid var(--coral);
  border-radius: var(--r-pill);
  padding: 0.5rem 1rem;
  transition: all 0.2s;
}
.side__open:hover { background: var(--coral); color: #fff; }

.similar { display: grid; gap: 0.9rem; }
@media (min-width: 640px) { .similar { grid-template-columns: repeat(3, 1fr); } }

.addphoto__hint { font-size: var(--fs-caption); color: var(--muted); margin-bottom: 0.8rem; line-height: 1.9; }
</style>
