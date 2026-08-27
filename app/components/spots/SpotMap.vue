<script setup lang="ts">
import type { PhotoSpot } from '#shared/types'
import type { MapController, MapPoint } from '~/composables/useMapProvider'
import { useMapProvider } from '~/composables/useMapProvider'

// ─────────────────────────────────────────────────────────────
// SpotMap · نقشه‌ی نشان با آداپتور لایه‌ی useMapProvider
// حالت‌ها:
//   view  → مارکر لوکیشن‌ها + انتخاب
//   pick  → انتخاب نقطه با کلیک (فرم افزودن لوکیشن)
// در نبود کلید Neshan: placeholder کاربردی با مختصات و لینک
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  spots?: PhotoSpot[]
  mode?: 'view' | 'pick'
  center?: MapPoint
  zoom?: number
  selectedId?: string | null
  height?: string
}>(), {
  spots: () => [],
  mode: 'view',
  center: () => ({ lat: 35.7219, lng: 51.389 }),
  zoom: 12,
  selectedId: null,
  height: '26rem',
})

const emit = defineEmits<{
  select: [id: string]
  'update:center': [p: MapPoint]
}>()

const container = ref<HTMLElement | null>(null)
const mounted = ref(false)
const failed = ref(false)
const { createMap, provider } = useMapProvider()

let controller: MapController | null = null

onMounted(async () => {
  mounted.value = true
  if (!container.value) return
  controller = await createMap(container.value, { center: props.center, zoom: props.zoom })
  if (!controller) {
    failed.value = true
    return
  }
  controller.setMarkers(props.spots.map(s => ({ id: s.id, lat: s.location.lat, lng: s.location.lng })))
  controller.onMarkerClick(id => emit('select', id))
  if (props.mode === 'pick') {
    controller.onMapClick(p => emit('update:center', p))
  }
})

onUnmounted(() => controller?.destroy())

// به‌روزرسانی مارکرها با تغییر فیلترها
watch(() => props.spots, (list) => {
  controller?.setMarkers(list.map(s => ({ id: s.id, lat: s.location.lat, lng: s.location.lng })))
}, { deep: true })

// پن به لوکیشن انتخاب‌شده
watch(() => props.selectedId, (id) => {
  if (!id || !controller) return
  const spot = props.spots.find(s => s.id === id)
  if (spot) controller.setCenter(spot.location, 15)
})

// پیکر: همگام‌سازی مرکز از بیرون (ورودی دستی مختصات)
watch(() => props.center, (c) => {
  if (props.mode === 'pick') controller?.setCenter(c)
}, { deep: true })

/** لینک باز کردن در نقشه‌ی نشان */
const externalUrl = computed(() =>
  `https://maps.neshan.org/@${props.center.lat},${props.center.lng},14z`)

const coordText = computed(() =>
  `${props.center.lat.toFixed(5)} , ${props.center.lng.toFixed(5)}`)
</script>

<template>
  <div class="sm" :style="{ height }">
    <!-- ظرف نقشه — فقط سمت کلاینت -->
    <div v-show="mounted && !failed" ref="container" class="sm__canvas" data-neshan-container />

    <!-- حالت بدون کلید / خطا: placeholder کاربردی -->
    <div v-if="!mounted || failed" class="sm__fallback" aria-label="نقشه">
      <span class="sm__fallback-icon"><AIcon name="compass" :size="26" /></span>
      <p class="sm__fallback-title">
        {{ failed ? 'نقشه در دسترس نیست' : 'نقشه‌ی نشان' }}
      </p>
      <code class="sm__coords latin">{{ coordText }}</code>
      <p v-if="failed" class="sm__fallback-note">
        اتصال به سرویس نقشه برقرار نشد؛ از لینک زیر استفاده کنید یا بعداً تلاش کنید.
      </p>
      <p v-else class="sm__fallback-note">
        برای نمایش نقشه‌ی تعاملی، کلید Neshan را در <code class="latin">.env</code> تنظیم کنید
        (<code class="latin">NUXT_PUBLIC_NESHAN_MAP_KEY</code>).
      </p>
      <a :href="externalUrl" target="_blank" rel="noopener" class="sm__fallback-link">
        <AIcon name="map-pin" :size="14" />
        باز کردن در نقشه‌ی نشان
      </a>
    </div>
  </div>
</template>

<style scoped>
.sm {
  position: relative;
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
}

.sm__canvas {
  position: absolute;
  inset: 0;
}

/* ── جایگزین بدون کلید ── */
.sm__fallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: 0.4rem;
  padding: 1.5rem;
  background:
    radial-gradient(28rem 16rem at 80% 0%, rgba(75, 68, 220, 0.07), transparent 60%),
    repeating-linear-gradient(0deg, transparent 0 23px, rgba(33, 28, 21, 0.05) 23px 24px),
    repeating-linear-gradient(90deg, transparent 0 23px, rgba(33, 28, 21, 0.05) 23px 24px),
    var(--bg-deep);
}
.sm__fallback-icon {
  width: 3.4rem;
  height: 3.4rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--paper);
  border: 1px solid var(--line);
  color: var(--indigo);
  margin-bottom: 0.3rem;
}
.sm__fallback-title { font-weight: 900; font-size: var(--fs-body); }
.sm__coords {
  font-size: var(--fs-caption);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  padding: 0.2rem 0.7rem;
  color: var(--ink-soft);
}
.sm__fallback-note {
  font-size: var(--fs-caption);
  color: var(--muted);
  max-width: 24rem;
  line-height: 1.9;
}
.sm__fallback-note code { font-size: 0.66rem; }
.sm__fallback-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.3rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  border: 1px solid var(--coral);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.95rem;
  transition: background 0.2s, color 0.2s;
}
.sm__fallback-link:hover { background: var(--coral); color: #fff; }
</style>
