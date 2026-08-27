<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AButton · دکمه‌ی اصلی سیستم طراحی
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'soft' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconEnd?: string
  to?: string
  type?: 'button' | 'submit'
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const classes = computed(() => [
  'a-btn',
  `a-btn--${props.variant}`,
  `a-btn--${props.size}`,
  { 'a-btn--block': props.block, 'a-btn--loading': props.loading },
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="a-btn" :class="classes">
    <AIcon v-if="icon && !loading" :name="icon" :size="size === 'sm' ? 16 : 18" />
    <slot />
    <AIcon v-if="iconEnd && !loading" :name="iconEnd" :size="size === 'sm' ? 16 : 18" />
  </NuxtLink>
  <button v-else :type="type" class="a-btn" :class="classes" :disabled="disabled || loading">
    <ASpinner v-if="loading" :size="size === 'sm' ? 15 : 18" />
    <AIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    <slot />
    <AIcon v-if="iconEnd && !loading" :name="iconEnd" :size="size === 'sm' ? 16 : 18" />
  </button>
</template>

<style scoped>
.a-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: var(--r-pill);
  font-weight: 800;
  white-space: nowrap;
  user-select: none;
  transition: transform 0.18s var(--ease-out), background 0.2s, box-shadow 0.25s, border-color 0.2s, color 0.2s;
}
.a-btn:active { transform: translateY(1px) scale(0.99); }

.a-btn--sm { height: 2.25rem; padding-inline: 0.95rem; font-size: var(--fs-small); }
@media (pointer: coarse) {
  .a-btn--sm { height: 2.5rem; }
}
.a-btn--md { height: 2.75rem; padding-inline: 1.35rem; font-size: var(--fs-body); }
.a-btn--lg { height: 3.25rem; padding-inline: 1.75rem; font-size: 1rem; }
.a-btn--block { display: flex; width: 100%; white-space: normal; text-align: center; line-height: 1.5; }

.a-btn--primary { background: var(--coral); color: #fff; box-shadow: var(--shadow-coral); }
.a-btn--primary:hover { background: var(--coral-deep); transform: translateY(-1px); }

.a-btn--secondary { background: var(--ink); color: var(--bg); }
.a-btn--secondary:hover { background: #000; transform: translateY(-1px); }

.a-btn--soft { background: var(--coral-soft); color: var(--coral-deep); }
.a-btn--soft:hover { background: #FFDCCF; }

.a-btn--outline { background: var(--paper); color: var(--ink); border: 1px solid var(--line-strong); }
.a-btn--outline:hover { border-color: var(--ink); }

.a-btn--ghost { background: transparent; color: var(--ink-soft); }
.a-btn--ghost:hover { background: rgba(33, 28, 21, 0.06); color: var(--ink); }

.a-btn--loading { pointer-events: none; opacity: 0.85; }
.a-btn:disabled { pointer-events: none; opacity: 0.4; box-shadow: none; }
</style>
