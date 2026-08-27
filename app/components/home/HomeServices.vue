<script setup lang="ts">
import type { ProjectTypeId } from '#shared/types'
import { projectTypeMap } from '#shared/config/project-types'

// خدمات منتخب — فهرست شماره‌دار ادیتوریال با قیمت پایه از کانفیگ مرکزی
const { config } = usePricing()

const services: { id: ProjectTypeId; en: string }[] = [
  { id: 'poster', en: 'Poster' },
  { id: 'social', en: 'Social Media' },
  { id: 'menu', en: 'Menu Design' },
  { id: 'logo', en: 'Logo' },
  { id: 'packaging', en: 'Packaging' },
  { id: 'ui', en: 'UI Design' },
]
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">خدمات منتخب</span>
          <h2 class="t-h1">از پوستر تا هویت کامل</h2>
        </div>
        <NuxtLink to="/create" class="section-head__link">
          همه‌ی خدمات
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>

      <ul class="svc">
        <li v-for="(s, i) in services" :key="s.id">
          <NuxtLink :to="`/create?type=${s.id}`" class="svc__row">
            <span class="svc__num latin">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="svc__body">
              <span class="svc__title">{{ projectTypeMap[s.id].label }}</span>
              <span class="svc__tag">{{ projectTypeMap[s.id].tagline }}</span>
            </span>
            <span class="svc__price">شروع از <strong>{{ formatTomanCompact(config.basePrices[s.id]) }}</strong></span>
            <span class="svc__go"><AIcon name="arrow-left" :size="17" /></span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.svc { border-top: 1px solid var(--line-strong); }
.svc__row {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding-block: 1.05rem;
  border-bottom: 1px solid var(--line);
  transition: background 0.2s, padding 0.25s var(--ease-out);
}
.svc__row:hover { background: var(--paper); padding-inline: 0.6rem; }

.svc__num {
  font-size: 1.05rem;
  font-weight: 600;
  font-style: italic;
  color: var(--faint);
  width: 2.4rem;
  flex-shrink: 0;
  transition: color 0.2s;
}
.svc__row:hover .svc__num { color: var(--coral); }

.svc__body { display: grid; gap: 0.05rem; min-width: 0; }
.svc__title { font-size: var(--fs-md); font-weight: 800; }
.svc__tag { font-size: var(--fs-caption); color: var(--muted); }

.svc__price {
  margin-inline-start: auto;
  font-size: var(--fs-caption);
  color: var(--muted);
  text-align: end;
}
.svc__price strong { color: var(--ink); font-weight: 800; }

.svc__go {
  width: 2.2rem; height: 2.2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  color: var(--ink);
  flex-shrink: 0;
  transition: all 0.25s var(--ease-out);
}
.svc__row:hover .svc__go { background: var(--coral); border-color: var(--coral); color: #fff; transform: translateX(-3px); }

@media (max-width: 640px) {
  .svc__price { display: none; }
}
</style>
