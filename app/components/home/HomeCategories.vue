<script setup lang="ts">
import { homeCategories } from '#shared/data/content'

// دسته‌بندی‌های منتخب — میان‌بر شروع پروژه با نوع از پیش انتخاب‌شده
const tones = ['coral', 'indigo', 'green', 'amber', 'coral', 'indigo'] as const
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">دسته‌بندی‌ها</span>
          <h2 class="t-h1">چه چیزی می‌خواهی بسازی؟</h2>
        </div>
      </div>

      <div class="cats">
        <NuxtLink
          v-for="(c, i) in homeCategories"
          :key="c.id"
          :to="`/create?type=${c.id}`"
          class="cat"
          :class="`cat--${tones[i % tones.length]}`"
        >
          <span class="cat__icon"><AIcon :name="c.icon" :size="22" /></span>
          <span class="cat__label">{{ c.label }}</span>
          <span class="cat__count">{{ new Intl.NumberFormat('fa-IR').format(c.count) }} پروژه</span>
          <AIcon name="arrow-left" :size="16" class="cat__arrow" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.7rem;
}
@media (min-width: 768px) { .cats { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1024px) { .cats { grid-template-columns: repeat(6, 1fr); } }

.cat {
  position: relative;
  display: grid;
  gap: 0.15rem;
  padding: 1rem 0.9rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  transition: border-color 0.25s, transform 0.25s var(--ease-out), box-shadow 0.25s;
}
.cat:hover {
  border-color: var(--ink);
  transform: translateY(-3px);
  box-shadow: var(--shadow-soft);
}

.cat__icon {
  width: 2.6rem; height: 2.6rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  margin-bottom: 0.55rem;
  transition: transform 0.25s var(--ease-out);
}
.cat:hover .cat__icon { transform: rotate(-6deg) scale(1.06); }

.cat--coral .cat__icon { background: var(--coral-soft); color: var(--coral-deep); }
.cat--indigo .cat__icon { background: var(--indigo-soft); color: var(--indigo-deep); }
.cat--green .cat__icon { background: var(--green-soft); color: var(--green); }
.cat--amber .cat__icon { background: var(--amber-soft); color: #A6701E; }

.cat__label { font-size: var(--fs-small); font-weight: 800; }
.cat__count { font-size: var(--fs-caption); color: var(--muted); }
.cat__arrow {
  position: absolute;
  top: 0.9rem;
  inset-inline-end: 0.8rem;
  color: var(--faint);
  opacity: 0;
  transform: translateX(6px);
  transition: all 0.25s var(--ease-out);
}
.cat:hover .cat__arrow { opacity: 1; transform: none; color: var(--coral); }
</style>
