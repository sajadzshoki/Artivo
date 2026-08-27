<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ASkeleton · اسکلتون بارگذاری
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  w?: string
  h?: string
  radius?: string
}>(), { w: '100%', h: '1rem', radius: '8px' })
</script>

<template>
  <div class="a-skeleton" :style="{ width: w, height: h, borderRadius: radius }" aria-hidden="true" />
</template>

<style scoped>
.a-skeleton {
  background: linear-gradient(90deg, var(--bg-deep) 25%, #EFE7D8 45%, var(--bg-deep) 65%);
  background-size: 200% 100%;
  animation: shimmer 1.4s linear infinite;
}
</style>
