<script setup lang="ts">
import type { LightboxSlide } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// Lightbox · نمایش تمام‌صفحه‌ی گالری نمونه‌کار (RTL-aware)
// ─────────────────────────────────────────────────────────────
const props = defineProps<{
  items: LightboxSlide[]
}>()

const index = defineModel<number | null>({ required: true })

const open = computed(() => index.value !== null)
const current = computed(() => (index.value !== null ? props.items[index.value] : null))
const fa = new Intl.NumberFormat('fa-IR')

function close() { index.value = null }
function next() { if (index.value !== null) index.value = (index.value + 1) % props.items.length }
function prev() { if (index.value !== null) index.value = (index.value - 1 + props.items.length) % props.items.length }

function onKey(e: KeyboardEvent) {
  // در RTL فلش چپ = جلو
  if (e.key === 'ArrowLeft') next()
  else if (e.key === 'ArrowRight') prev()
  else if (e.key === 'Escape') close()
}

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onUnmounted(() => {
  if (import.meta.client) { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
})

// سوایپ موبایل
let touchX = 0
function touchStart(e: TouchEvent) { touchX = e.touches[0]?.clientX ?? 0 }
function touchEnd(e: TouchEvent) {
  const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX
  if (Math.abs(dx) > 48) (dx < 0 ? prev() : next())
}
</script>

<template>
  <Teleport to="body">
    <Transition name="lb">
      <div v-if="open && current" class="lb" @click.self="close" @touchstart.passive="touchStart" @touchend.passive="touchEnd">
        <header class="lb__bar">
          <span class="lb__counter latin">{{ fa.format((index ?? 0) + 1) }} / {{ fa.format(items.length) }}</span>
          <button class="lb__close" aria-label="بستن گالری" @click="close"><AIcon name="x" :size="20" /></button>
        </header>

        <div class="lb__stage">
          <button v-if="items.length > 1" class="lb__nav lb__nav--prev" aria-label="قبلی" @click="prev">
            <AIcon name="arrow-right" :size="20" />
          </button>

          <figure class="lb__figure" :key="current.id">
            <img :src="current.cover" :alt="current.title">
          </figure>

          <button v-if="items.length > 1" class="lb__nav lb__nav--next" aria-label="بعدی" @click="next">
            <AIcon name="arrow-left" :size="20" />
          </button>
        </div>

        <footer class="lb__caption">
          <strong>{{ current.title }}</strong>
          <span v-if="current.description">{{ current.description }}</span>
          <span class="lb__meta">
            {{ current.year }}<template v-if="current.client"> · {{ current.client }}</template>
            <template v-for="t in current.tags"> · #{{ t }}</template>
          </span>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb {
  position: fixed;
  inset: 0;
  z-index: calc(var(--z-modal) + 10);
  background: rgba(26, 21, 14, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: grid;
  grid-template-rows: auto 1fr auto;
  color: var(--bg);
}

.lb__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.2rem;
}
.lb__counter { font-size: var(--fs-small); opacity: 0.7; letter-spacing: 0.1em; }
.lb__close {
  width: 2.4rem; height: 2.4rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: rgba(250, 246, 239, 0.12);
  color: inherit;
  transition: background 0.2s;
}
.lb__close:hover { background: rgba(250, 246, 239, 0.22); }

.lb__stage {
  position: relative;
  display: grid;
  place-items: center;
  padding-inline: 0.6rem;
  min-height: 0;
}
.lb__figure {
  max-width: min(56rem, 100%);
  max-height: 100%;
  display: grid;
  place-items: center;
}
.lb__figure img {
  max-width: 100%;
  max-height: calc(100dvh - 13rem);
  object-fit: contain;
  border-radius: var(--r-sm);
  animation: pop-in 0.3s var(--ease-out);
}

.lb__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 2.6rem; height: 2.6rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: rgba(250, 246, 239, 0.12);
  color: inherit;
  transition: background 0.2s;
}
.lb__nav:hover { background: rgba(250, 246, 239, 0.24); }
.lb__nav--prev { inset-inline-start: 0.8rem; }
.lb__nav--next { inset-inline-end: 0.8rem; }

.lb__caption {
  display: grid;
  gap: 0.2rem;
  padding: 0.9rem 1.3rem calc(1.1rem + env(safe-area-inset-bottom));
  text-align: center;
  justify-items: center;
}
.lb__caption strong { font-size: var(--fs-body); font-weight: 900; }
.lb__caption > span { font-size: var(--fs-caption); opacity: 0.75; max-width: 40rem; line-height: 1.8; }
.lb__meta { opacity: 0.55; }

.lb-enter-active { transition: opacity 0.3s; }
.lb-leave-active { transition: opacity 0.2s ease-in; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
</style>
