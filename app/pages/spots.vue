<script setup lang="ts">
import { photoSpots } from '#shared/data/content'

// لوکیشن‌های عکاسی — مکان‌های پیشنهادی برای شوت
useHead({ title: 'لوکیشن عکاسی — آرتیوو' })

const loading = ref(true)
const city = ref('all')

onMounted(() => { setTimeout(() => { loading.value = false }, 550) })

const cities = computed(() => {
  const set = new Set<string>()
  for (const s of photoSpots) set.add(s.city.split('·')[0]?.trim() ?? s.city)
  return [{ value: 'all', label: 'همه‌ی شهرها' }, ...[...set].map(c => ({ value: c, label: c }))]
})

const filtered = computed(() => {
  if (city.value === 'all') return photoSpots
  return photoSpots.filter(s => s.city.startsWith(city.value))
})
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Photo Spots</p>
      <h1 class="t-h1 page-head__title">لوکیشن‌های عکاسی</h1>
      <p class="t-body page-head__desc">
        مکان‌هایی که عکاس‌ها دم‌شان را بسته‌اند؛ با بهترین ساعت نور و نکته‌های اجرایی.
      </p>
    </header>

    <AFilterChips v-model="city" :options="cities" label="فیلتر شهر" />

    <section aria-label="فهرست لوکیشن‌ها">
      <div v-if="loading" class="grid">
        <div v-for="i in 3" :key="i" class="panel" style="overflow:hidden">
          <ASkeleton h="11rem" radius="0" />
          <div style="display:grid;gap:.6rem;padding:1rem">
            <ASkeleton w="55%" h="1rem" />
            <ASkeleton w="85%" h="0.8rem" />
          </div>
        </div>
      </div>

      <TransitionGroup v-else name="list" tag="div" class="grid">
        <SpotCard v-for="s in filtered" :key="s.id" :spot="s" />
        <AEmptyState
          v-if="filtered.length === 0"
          key="empty"
          icon="map-pin"
          title="لوکیشنی در این شهر نداریم"
          description="فعلاً روی تهران و اصفهان تمرکز کرده‌ایم؛ به‌زودی شهرهای بیشتر."
        >
          <AButton variant="outline" size="sm" @click="city = 'all'">نمایش همه</AButton>
        </AEmptyState>
      </TransitionGroup>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 30rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(20rem, 100%), 1fr));
  gap: 0.9rem;
  margin-top: 1rem;
}

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }
</style>
