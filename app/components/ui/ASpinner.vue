<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ASpinner · نشانگر بارگذاری چرخان
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{ size?: number }>(), { size: 18 })
</script>

<template>
  <svg class="a-spinner" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.2" stroke-width="2.6" />
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
  </svg>
</template>

<style scoped>
.a-spinner { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
