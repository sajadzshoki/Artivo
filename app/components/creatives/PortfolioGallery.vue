<script setup lang="ts">
import type { PortfolioItem } from '#shared/types'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// ─────────────────────────────────────────────────────────────
// PortfolioGallery · گرید نمونه‌کار + فیلتر دسته + لایت‌باکس
// حالت «tall» برای پورتفولیو عکاس‌ها (تصاویر بزرگ‌تر و عمیق‌تر)
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  items: PortfolioItem[]
  tall?: boolean
  showDesc?: boolean
  withFilter?: boolean
}>(), { tall: false, showDesc: false, withFilter: true })

const category = ref('all')

const catOptions = computed(() => {
  const set = new Map<string, string>()
  for (const it of props.items) if (!set.has(it.category)) set.set(it.category, serviceCategoryLabels[it.category])
  return [{ value: 'all', label: 'همه' }, ...[...set.entries()].map(([value, label]) => ({ value, label }))]
})

const filtered = computed(() => {
  if (category.value === 'all') return props.items
  return props.items.filter(it => it.category === category.value)
})

const lightboxIndex = ref<number | null>(null)
function openAt(id: string) {
  lightboxIndex.value = Math.max(0, filtered.value.findIndex(it => it.id === id))
}
</script>

<template>
  <div>
    <AFilterChips v-if="withFilter && catOptions.length > 2" v-model="category" :options="catOptions" label="فیلتر دسته نمونه‌کار" class="pg__filter" />

    <TransitionGroup v-if="filtered.length" name="pg" tag="div" class="pg" :class="{ 'pg--tall': tall }">
      <PortfolioCard
        v-for="it in filtered"
        :key="it.id"
        :item="it"
        :tall="tall"
        :show-desc="showDesc"
        @open="openAt"
      />
    </TransitionGroup>

    <AEmptyState
      v-else
      icon="image"
      title="نمونه‌کاری در این دسته نیست"
      description="دسته‌ی دیگری را انتخاب کن."
    />

    <Lightbox v-model="lightboxIndex" :items="filtered" />
  </div>
</template>

<style scoped>
.pg__filter { margin-bottom: 1rem; }

.pg {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.7rem;
}
@media (min-width: 768px) { .pg { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .pg { grid-template-columns: repeat(3, 1fr); gap: 1rem; } }

/* حالت عکاسی: تصویر بزرگ‌تر */
.pg--tall { grid-template-columns: 1fr; }
@media (min-width: 640px) { .pg--tall { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .pg--tall { grid-template-columns: repeat(3, 1fr); } }

.pg-move { transition: transform 0.35s var(--ease-out); }
.pg-enter-active { transition: all 0.3s var(--ease-out); }
.pg-enter-from { opacity: 0; transform: scale(0.97); }
.pg-leave-active { display: none; }
</style>
