<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AModal · مودال مرکزی (در موبایل از پایین بالا می‌آید)
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>(), { size: 'sm' })

const open = defineModel<boolean>({ required: true })

function close() { open.value = false }

function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }

watch(open, (v) => {
  if (!import.meta.client) return
  document.body.style.overflow = v ? 'hidden' : ''
  if (v) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
})
onUnmounted(() => {
  if (import.meta.client) { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="a-modal">
      <div v-if="open" class="a-modal" @click.self="close">
        <div class="a-modal__panel" :class="`a-modal__panel--${size}`" role="dialog" aria-modal="true" :aria-label="title">
          <span class="a-modal__grab" aria-hidden="true" />
          <header v-if="title" class="a-modal__head">
            <h2 class="a-modal__title">{{ title }}</h2>
            <button class="a-modal__close" aria-label="بستن" @click="close"><AIcon name="x" :size="18" /></button>
          </header>
          <div class="a-modal__body"><slot /></div>
          <footer v-if="$slots.footer" class="a-modal__foot"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.a-modal {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(26, 21, 14, 0.45);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
}
.a-modal__panel {
  background: var(--paper);
  width: 100%;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: 1.1rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));
  max-height: 86dvh;
  display: flex;
  flex-direction: column;
}
.a-modal__panel--sm { max-width: 26rem; }
.a-modal__panel--md { max-width: 34rem; }
.a-modal__panel--lg { max-width: 44rem; }

.a-modal__grab {
  width: 2.6rem;
  height: 4px;
  border-radius: 99px;
  background: var(--line-strong);
  margin: 0 auto 0.7rem;
  flex-shrink: 0;
}

.a-modal__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 0.85rem; }
.a-modal__title { font-size: var(--fs-lg); font-weight: 900; }
.a-modal__close {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  transition: background 0.2s;
}
.a-modal__close:hover { background: var(--line); }

.a-modal__body { overflow-y: auto; }

.a-modal__foot {
  padding-top: 1rem;
  margin-top: 0.4rem;
  border-top: 1px solid var(--line);
  display: flex;
  gap: 0.6rem;
}

@media (min-width: 768px) {
  .a-modal { align-items: center; padding: 1.5rem; }
  .a-modal__panel { border-radius: var(--r-xl); padding: 1.5rem; max-height: 84dvh; }
  .a-modal__grab { display: none; }
}

.a-modal-enter-active { transition: opacity 0.3s; }
.a-modal-leave-active { transition: opacity 0.22s ease-in; }
.a-modal-enter-active .a-modal__panel { transition: transform 0.38s var(--ease-out); }
.a-modal-leave-active .a-modal__panel { transition: transform 0.22s ease-in; }
.a-modal-enter-from, .a-modal-leave-to { opacity: 0; }
.a-modal-enter-from .a-modal__panel { transform: translateY(60px); }
.a-modal-leave-to .a-modal__panel { transform: translateY(40px); }
</style>
