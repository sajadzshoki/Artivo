<script setup lang="ts">
// خلاصه‌ی زنده‌ی درخواست — پنل چسبان دسکتاپ و محتوای کشوی موبایل
const { sections } = useRequestSummary()
const { estimate } = usePricing()
</script>

<template>
  <div class="sum">
    <p class="sum__title">خلاصه‌ی درخواست</p>

    <ul class="sum__list">
      <li v-for="s in sections" :key="s.step" class="sum__row">
        <span class="sum__icon"><AIcon :name="s.icon" :size="15" /></span>
        <span class="sum__body">
          <span class="sum__label">{{ s.title }}</span>
          <span v-for="(l, i) in s.lines.slice(0, 2)" :key="i" class="sum__line" :class="{ 'sum__line--muted': i > 0 }">{{ l }}</span>
          <span v-if="s.swatches" class="sum__sw">
            <i v-for="(c, i) in s.swatches" :key="i" :style="{ background: c }" />
          </span>
        </span>
      </li>
    </ul>

    <div v-if="estimate.total > 0" class="sum__est">
      <span>برآورد تقریبی</span>
      <strong>{{ formatTomanCompact(estimate.total) }}</strong>
    </div>
  </div>
</template>

<style scoped>
.sum__title {
  font-family: var(--font-latin);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 600;
  margin-bottom: 0.9rem;
}

.sum__list { display: grid; gap: 0.75rem; }
.sum__row { display: flex; gap: 0.6rem; align-items: flex-start; }
.sum__icon {
  width: 1.9rem; height: 1.9rem;
  display: grid; place-items: center;
  border-radius: var(--r-xs);
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.sum__body { display: grid; gap: 0.05rem; min-width: 0; }
.sum__label { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.sum__line { font-size: var(--fs-caption); color: var(--ink); line-height: 1.7; overflow-wrap: anywhere; }
.sum__line--muted { color: var(--faint); }

.sum__sw { display: flex; gap: 0.25rem; margin-top: 0.2rem; }
.sum__sw i { width: 0.95rem; height: 0.95rem; border-radius: 99px; border: 1px solid rgba(33, 28, 21, 0.12); }

.sum__est {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1.1rem;
  padding-top: 0.9rem;
  border-top: 1px dashed var(--line-strong);
}
.sum__est span { font-size: var(--fs-caption); color: var(--muted); font-weight: 700; }
.sum__est strong { font-size: 1.1rem; font-weight: 900; color: var(--coral-deep); }
</style>
