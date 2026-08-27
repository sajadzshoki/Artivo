<script setup lang="ts">
// باند پایانی CTA — جوهری با دعوت به شروع
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="cta">
        <p class="cta__kicker latin">Your next move</p>
        <h2 class="cta__title">پروژه‌ی بعدی، امضای توست.</h2>
        <p class="cta__sub">
          بدون نیاز به ثبت‌نام؛ در حدود ۵ دقیقه بریف را کامل کن و برآورد قیمت را همان‌جا ببین.
        </p>
        <div class="cta__actions">
          <AButton to="/create" size="lg" icon-end="arrow-left">شروع پروژه</AButton>
          <AButton to="/jobs" size="lg" variant="ghost" class="cta__ghost">دیدن پروژه‌های باز</AButton>
        </div>
        <span class="cta__mark latin" aria-hidden="true">*</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--r-xl);
  padding: clamp(2.2rem, 6vw, 4.5rem);
  display: grid;
  justify-items: start;
  gap: 0.9rem;
}
.cta__kicker { color: var(--coral); font-style: italic; font-size: var(--fs-small); }
.cta__title { font-size: clamp(1.7rem, 5.5vw, 3rem); font-weight: 900; line-height: 1.3; }
.cta__sub { max-width: 30rem; color: color-mix(in srgb, var(--bg) 72%, transparent); font-size: var(--fs-body); }
.cta__actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 0.7rem; }
.cta__ghost { color: var(--bg); border: 1px solid rgba(250, 246, 239, 0.3); }
.cta__ghost:hover { background: rgba(250, 246, 239, 0.08); }

.cta__mark {
  position: absolute;
  inset-inline-end: -1rem;
  bottom: -3.4rem;
  font-size: 16rem;
  font-weight: 700;
  font-style: italic;
  color: var(--coral);
  opacity: 0.16;
  line-height: 1;
  pointer-events: none;
}
</style>
