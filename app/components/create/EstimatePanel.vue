<script setup lang="ts">
// پنل برآورد قیمت — فقط خروجی سرویس مرکزی را نمایش می‌دهد
const { estimate, config } = usePricing()
</script>

<template>
  <div class="est" :class="{ 'est--empty': estimate.total === 0 }">
    <template v-if="estimate.total > 0">
      <ul class="est__lines">
        <li v-for="l in estimate.lines" :key="l.id" class="est__line" :class="`est__line--${l.kind}`">
          <span class="est__label">
            {{ l.label }}
            <em v-if="l.detail">{{ l.detail }}</em>
          </span>
          <span v-if="l.factor" class="est__factor latin">×{{ new Intl.NumberFormat('fa-IR').format(l.factor) }}</span>
          <span v-else-if="l.amount != null" class="est__amount" :class="{ 'est__amount--neg': l.kind === 'minimum' }">
            {{ l.kind === 'minimum' ? '+' : '' }}{{ formatToman(l.amount) }}
          </span>
        </li>
      </ul>

      <div class="est__total">
        <span>برآورد کل</span>
        <strong>{{ formatToman(estimate.total) }}</strong>
      </div>

      <p class="est__note">
        <AIcon name="info" :size="15" />
        این عدد یک <strong>برآورد خودکار و تقریبی</strong> است، نه قیمت قطعی؛ قیمت نهایی پس از بررسی بریف شما
        توسط خلاق‌ها و بر اساس جزئیات واقعی پروژه اعلام می‌شود.
      </p>
    </template>

    <p v-else class="est__empty">
      <AIcon name="wallet" :size="20" />
      با انتخاب نوع پروژه، برآورد قیمت همین‌جا و به‌صورت لحظه‌ای نمایش داده می‌شود.
    </p>
  </div>
</template>

<style scoped>
.est {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 1.2rem 1.3rem;
}

.est__lines { display: grid; gap: 0.6rem; }
.est__line {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  font-size: var(--fs-small);
}
.est__label { color: var(--ink-soft); display: grid; }
.est__label em { font-style: normal; font-size: var(--fs-caption); color: var(--faint); }
.est__factor {
  margin-inline-start: auto;
  font-size: var(--fs-caption);
  font-weight: 600;
  color: var(--indigo-deep);
  background: var(--indigo-soft);
  border-radius: var(--r-pill);
  padding: 0.05rem 0.5rem;
}
.est__amount { margin-inline-start: auto; font-weight: 700; color: var(--ink); font-size: var(--fs-caption); white-space: nowrap; }
.est__amount--neg { color: var(--muted); }

.est__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--line-strong);
}
.est__total span { font-size: var(--fs-small); font-weight: 800; color: var(--muted); }
.est__total strong { font-size: var(--fs-xl); font-weight: 900; }

.est__note {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-top: 0.9rem;
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  border-radius: var(--r-sm);
  padding: 0.7rem 0.8rem;
  font-size: var(--fs-caption);
  line-height: 1.85;
}
.est__note svg { flex-shrink: 0; margin-top: 0.2rem; }

.est__empty {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  text-align: center;
  color: var(--faint);
  font-size: var(--fs-small);
  padding: 1.4rem 1rem;
}
.est__empty svg { opacity: 0.5; }
</style>
