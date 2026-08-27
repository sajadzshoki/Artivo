<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ACard · پنل پایه (کاغذی / عاجی / جوهری) — پدینگ اختیاری
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  tone?: 'paper' | 'ivory' | 'ink'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}>(), { tone: 'paper', padding: 'md' })
</script>

<template>
  <div class="a-card" :class="[`a-card--${tone}`, `a-card--p-${padding}`, { 'a-card--hover': hover }]">
    <slot />
  </div>
</template>

<style scoped>
.a-card { border-radius: var(--r-lg); transition: transform 0.3s var(--ease-out), box-shadow 0.3s; }
.a-card--paper { background: var(--paper); border: 1px solid var(--line); }
.a-card--ivory { background: var(--bg-deep); border: 1px solid var(--line); }
.a-card--ink { background: var(--ink); color: var(--bg); }

.a-card--p-none { padding: 0; overflow: hidden; }
.a-card--p-sm { padding: 0.85rem; }
.a-card--p-md { padding: 1.25rem; }
.a-card--p-lg { padding: 1.75rem; }

.a-card--hover:hover { transform: translateY(-3px); box-shadow: var(--shadow-pop); }
</style>
