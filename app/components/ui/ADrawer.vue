<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ADrawer · کشوی کناری — موبایل: شیت پایین / دسکتاپ: پنل کنار
// ─────────────────────────────────────────────────────────────
defineProps<{ title: string }>()
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
    <Transition name="a-drawer">
      <div v-if="open" class="a-drawer" @click.self="close">
        <aside class="a-drawer__panel" role="dialog" aria-modal="true" :aria-label="title">
          <span class="a-drawer__grab" aria-hidden="true" />
          <header class="a-drawer__head">
            <h2 class="a-drawer__title">{{ title }}</h2>
            <button class="a-drawer__close" aria-label="بستن" @click="close"><AIcon name="x" :size="18" /></button>
          </header>
          <div class="a-drawer__body"><slot /></div>
          <footer v-if="$slots.footer" class="a-drawer__foot"><slot name="footer" /></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.a-drawer {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  background: rgba(26, 21, 14, 0.45);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
}
.a-drawer__panel {
  background: var(--paper);
  width: 100%;
  border-radius: var(--r-xl) var(--r-xl) 0 0;
  padding: 1rem 1.25rem calc(1.25rem + env(safe-area-inset-bottom));
  max-height: 82dvh;
  display: flex;
  flex-direction: column;
}
.a-drawer__grab {
  width: 2.6rem; height: 4px; border-radius: 99px;
  background: var(--line-strong);
  margin: 0 auto 0.7rem; flex-shrink: 0;
}
.a-drawer__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.a-drawer__title { font-size: var(--fs-lg); font-weight: 900; }
.a-drawer__close {
  width: 2.1rem; height: 2.1rem; display: grid; place-items: center;
  border-radius: 99px; background: var(--bg-deep); color: var(--ink-soft);
  transition: background 0.2s;
}
.a-drawer__close:hover { background: var(--line); }
.a-drawer__body { overflow-y: auto; }
.a-drawer__foot { padding-top: 1rem; margin-top: 0.4rem; border-top: 1px solid var(--line); display: flex; gap: 0.6rem; }

@media (min-width: 768px) {
  .a-drawer { align-items: stretch; justify-content: flex-end; }
  .a-drawer__panel {
    width: min(24rem, 90vw);
    max-height: none;
    border-radius: 0;
    padding: 1.5rem;
  }
  .a-drawer__grab { display: none; }
}

.a-drawer-enter-active { transition: opacity 0.3s; }
.a-drawer-leave-active { transition: opacity 0.22s ease-in; }
.a-drawer-enter-active .a-drawer__panel { transition: transform 0.38s var(--ease-out); }
.a-drawer-leave-active .a-drawer__panel { transition: transform 0.22s ease-in; }
.a-drawer-enter-from, .a-drawer-leave-to { opacity: 0; }
.a-drawer-enter-from .a-drawer__panel { transform: translateY(80px); }
.a-drawer-leave-to .a-drawer__panel { transform: translateY(60px); }
</style>
