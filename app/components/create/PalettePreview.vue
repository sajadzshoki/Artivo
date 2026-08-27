<script setup lang="ts">
// پیش‌نمایش انتزاعی پالت — پوستری مینیاتوری از رنگ‌های انتخابی
const props = defineProps<{
  bg: string
  sub: string
  accent: string
  ink: string
  small?: boolean
}>()
</script>

<template>
  <div class="pv" :class="{ 'pv--small': small }" :style="{ '--pv-bg': bg, '--pv-sub': sub, '--pv-accent': accent, '--pv-ink': ink }">
    <span class="pv__arc" aria-hidden="true" />
    <span class="pv__strip" aria-hidden="true" />
    <span class="pv__bar pv__bar--h" aria-hidden="true" />
    <span class="pv__bar pv__bar--b" aria-hidden="true" />
    <span class="pv__bar pv__bar--b2" aria-hidden="true" />
    <span class="pv__chip" aria-hidden="true" />
    <span class="pv__dot" aria-hidden="true" />
  </div>
</template>

<style scoped>
.pv {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  border-radius: var(--r-sm);
  background: var(--pv-bg);
  border: 1px solid rgba(33, 28, 21, 0.08);
}
.pv--small { aspect-ratio: 4 / 4.4; border-radius: 8px; }

.pv__arc {
  position: absolute;
  top: -55%;
  inset-inline-start: -25%;
  width: 130%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--pv-sub);
  opacity: 0.55;
}
.pv__strip {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 18%;
  background: var(--pv-accent);
}
.pv__bar {
  position: absolute;
  inset-inline-start: 12%;
  height: 7%;
  border-radius: 99px;
  background: var(--pv-ink);
}
.pv__bar--h { top: 52%; inline-size: 62%; }
.pv__bar--b { top: 63%; inline-size: 46%; opacity: 0.65; height: 5%; }
.pv__bar--b2 { top: 70.5%; inline-size: 34%; opacity: 0.4; height: 5%; }
.pv__chip {
  position: absolute;
  inset-inline-start: 12%;
  bottom: 24%;
  inline-size: 26%;
  height: 9%;
  border-radius: 99px;
  background: var(--pv-accent);
}
.pv__dot {
  position: absolute;
  top: 10%;
  inset-inline-end: 10%;
  width: 14%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--pv-accent);
  opacity: 0.9;
}
</style>
