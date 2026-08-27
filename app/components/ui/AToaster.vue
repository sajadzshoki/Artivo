<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AToaster · اعلان‌های شناور — ریشه‌ی سراسری در app.vue
// ─────────────────────────────────────────────────────────────
const { toasts, dismiss } = useToast()

const icons = { success: 'check-circle', error: 'info', info: 'info' } as const
</script>

<template>
  <Teleport to="body">
    <div class="a-toaster" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="a-toast" :class="`a-toast--${t.type}`" role="status">
          <AIcon :name="icons[t.type]" :size="19" class="a-toast__icon" />
          <div class="a-toast__body">
            <p class="a-toast__title">{{ t.title }}</p>
            <p v-if="t.desc" class="a-toast__desc">{{ t.desc }}</p>
          </div>
          <button class="a-toast__close" aria-label="بستن اعلان" @click="dismiss(t.id)">
            <AIcon name="x" :size="15" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.a-toaster {
  position: fixed;
  top: max(0.9rem, env(safe-area-inset-top));
  inset-inline: 0;
  z-index: var(--z-toast);
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding-inline: 1rem;
  pointer-events: none;
}

.a-toast {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  width: min(26rem, 100%);
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--r-md);
  padding: 0.8rem 0.95rem;
  box-shadow: var(--shadow-pop);
}
.a-toast__icon { flex-shrink: 0; margin-top: 0.15rem; }
.a-toast--success .a-toast__icon { color: #7BD8A8; }
.a-toast--error .a-toast__icon { color: var(--coral); }
.a-toast--info .a-toast__icon { color: #A5A1F5; }

.a-toast__body { display: grid; gap: 0.1rem; min-width: 0; }
.a-toast__title { font-size: var(--fs-small); font-weight: 800; }
.a-toast__desc { font-size: var(--fs-caption); opacity: 0.75; line-height: 1.7; }

.a-toast__close {
  margin-inline-start: auto;
  color: inherit;
  opacity: 0.55;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.a-toast__close:hover { opacity: 1; }

.toast-enter-active { transition: all 0.4s var(--ease-out); }
.toast-leave-active { transition: all 0.25s ease-in; }
.toast-enter-from { opacity: 0; transform: translateY(-12px) scale(0.96); }
.toast-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }
</style>
