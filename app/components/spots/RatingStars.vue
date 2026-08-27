<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// RatingStars · امتیازدهی کاربر (۱ تا ۵ ستاره، RTL)
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue: number | null
  size?: number
  label?: string
}>(), { size: 22, label: 'امتیاز شما' })

const emit = defineEmits<{ update: [stars: number] }>()

const hover = ref<number | null>(null)
const shown = computed(() => hover.value ?? props.modelValue ?? 0)
</script>

<template>
  <div class="rs">
    <span v-if="label" class="rs__label">{{ label }}</span>
    <div class="rs__stars" role="radiogroup" :aria-label="label" @mouseleave="hover = null">
      <button
        v-for="i in 5"
        :key="i"
        type="button"
        class="rs__star"
        :class="{ 'rs__star--on': i <= shown }"
        role="radio"
        :aria-checked="modelValue === i"
        :aria-label="`${i} ستاره`"
        @mouseenter="hover = i"
        @click="emit('update', i)"
      >
        <AIcon name="star" :size="size" :fill="i <= shown" />
      </button>
    </div>
    <span v-if="modelValue" class="rs__value">
      امتیاز شما: {{ new Intl.NumberFormat('fa-IR').format(modelValue) }}
    </span>
  </div>
</template>

<style scoped>
.rs { display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap; }
.rs__label { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.rs__stars { display: inline-flex; gap: 0.05rem; }
.rs__star {
  color: var(--line-strong);
  transition: color 0.15s, transform 0.15s;
  padding: 0.05rem;
}
.rs__star:hover { transform: scale(1.15); }
.rs__star--on { color: var(--amber); }
.rs__value { font-size: var(--fs-caption); font-weight: 800; color: var(--amber); }
</style>
