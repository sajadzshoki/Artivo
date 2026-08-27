<script setup lang="ts">
// آرتیوو چطور کار می‌کند — چهار گام
const steps = [
  { n: '01', title: 'بریف بنویس', desc: 'نوع پروژه، اندازه، سلیقه‌ی رنگی و فونت را در ۸ گام کوتاه انتخاب کن.' },
  { n: '02', title: 'قیمت را همان‌جا ببین', desc: 'برآورد شفاف و لحظه‌ای؛ قبل از هر تعهدی می‌دانی چقدر می‌شود.' },
  { n: '03', title: 'خلاق مناسب را انتخاب کن', desc: 'خلاق‌های تأییدشده بریف تو را می‌بینند و پیشنهاد می‌دهند.' },
  { n: '04', title: 'اثر را تحویل بگیر', desc: 'با نوبت‌های اصلاحیه‌ی مشخص، تا رضایت کامل کنار تو هستیم.' },
]
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">چطور کار می‌کند</span>
          <h2 class="t-h1">از ایده تا تحویل، چهار گام</h2>
        </div>
      </div>

      <ol class="how">
        <li v-for="s in steps" :key="s.n" class="how__item">
          <span class="how__num latin">{{ s.n }}</span>
          <h3 class="how__title">{{ s.title }}</h3>
          <p class="how__desc">{{ s.desc }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.how {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--sp-5);
  counter-reset: none;
}
@media (min-width: 768px) {
  .how { grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); }
}

.how__item {
  position: relative;
  display: grid;
  gap: 0.3rem;
  align-content: start;
  padding-top: 1.1rem;
  border-top: 2px solid var(--ink);
}
.how__item::before {
  content: '';
  position: absolute;
  top: -2px;
  inset-inline-start: 0;
  width: 2.6rem;
  height: 2px;
  background: var(--coral);
}

.how__num {
  font-size: 2.6rem;
  font-weight: 600;
  font-style: italic;
  line-height: 1.15;
  color: var(--line-strong);
  -webkit-text-stroke: 1px var(--muted);
  margin-bottom: 0.4rem;
}

.how__title { font-size: var(--fs-md); font-weight: 900; }
.how__desc { font-size: var(--fs-small); color: var(--muted); line-height: 1.85; }
</style>
