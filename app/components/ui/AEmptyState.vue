<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AEmptyState · حالت خالی
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  icon?: string
  title: string
  description?: string
}>(), { icon: 'sparkles' })
</script>

<template>
  <div class="a-empty">
    <span class="a-empty__icon"><AIcon :name="icon" :size="26" /></span>
    <h3 class="a-empty__title">{{ title }}</h3>
    <p v-if="description" class="a-empty__desc">{{ description }}</p>
    <div v-if="$slots.default" class="a-empty__action"><slot /></div>
  </div>
</template>

<style scoped>
.a-empty {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 0.6rem;
  padding: 3.5rem 1.5rem;
  max-width: 26rem;
  margin-inline: auto;
}
.a-empty__icon {
  width: 4rem;
  height: 4rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--coral-soft);
  color: var(--coral);
  margin-bottom: 0.4rem;
}
.a-empty__title { font-size: var(--fs-lg); font-weight: 900; }
.a-empty__desc { font-size: var(--fs-small); color: var(--muted); line-height: 1.9; }
.a-empty__action { margin-top: 0.75rem; }
</style>
