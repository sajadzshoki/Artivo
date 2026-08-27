<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ATag · برچسب کوچک وضعیت/ویژگی
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  label: string
  icon?: string
  tone?: 'neutral' | 'coral' | 'indigo' | 'green' | 'amber' | 'ink'
  dot?: boolean
}>(), { tone: 'neutral' })
</script>

<template>
  <span class="a-tag" :class="`a-tag--${tone}`">
    <span v-if="dot" class="a-tag__dot" aria-hidden="true" />
    <AIcon v-else-if="icon" :name="icon" :size="13" />
    {{ label }}
  </span>
</template>

<style scoped>
.a-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  padding: 0.22rem 0.62rem;
  border-radius: var(--r-pill);
  font-size: var(--fs-caption);
  font-weight: 700;
  white-space: nowrap;
}
.a-tag__dot { width: 6px; height: 6px; border-radius: 99px; background: currentColor; }

.a-tag--neutral { background: var(--bg-deep); color: var(--ink-soft); }
.a-tag--coral { background: var(--coral-soft); color: var(--coral-deep); }
.a-tag--indigo { background: var(--indigo-soft); color: var(--indigo-deep); }
.a-tag--green { background: var(--green-soft); color: #1F7A4D; }
.a-tag--amber { background: var(--amber-soft); color: #A6701E; }
.a-tag--ink { background: var(--ink); color: var(--bg); }
</style>
