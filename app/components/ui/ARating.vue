<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ARating · نمایش ستاره‌ای امتیاز + عدد فارسی
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  rating: number
  size?: number
  showValue?: boolean
}>(), { size: 14, showValue: false })

const fa = new Intl.NumberFormat('fa-IR')
const stars = computed(() => [1, 2, 3, 4, 5].map(i => props.rating >= i - 0.25))
</script>

<template>
  <span class="ar" role="img" :aria-label="`امتیاز ${fa.format(rating)} از ۵`">
    <span class="ar__stars" aria-hidden="true">
      <AIcon v-for="(on, i) in stars" :key="i" name="star" :size="size" :fill="on" :style="{ opacity: on ? 1 : 0.25 }" />
    </span>
    <span v-if="showValue" class="ar__value">{{ fa.format(rating) }}</span>
  </span>
</template>

<style scoped>
.ar { display: inline-flex; align-items: center; gap: 0.35rem; }
.ar__stars { display: inline-flex; gap: 0.1rem; color: var(--amber); }
.ar__value { font-size: var(--fs-caption); font-weight: 800; color: var(--ink); }
</style>
