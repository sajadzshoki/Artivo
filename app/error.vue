<script setup lang="ts">
// صفحه‌ی خطای ۴۰۴ با همان زبان ادیتوریال
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="err">
    <p class="err__code latin">{{ error?.statusCode ?? 500 }}</p>
    <h1 class="err__title">
      {{ is404 ? 'این صفحه در گالری ما نیست.' : 'یک‌جا چیزی به‌هم ریخت.' }}
    </h1>
    <p class="err__desc">
      {{ is404
        ? 'آدرسی که دنبالش بودید پیدا نشد؛ شاید جابه‌جا شده یا هرگز وجود نداشته است.'
        : 'خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.' }}
    </p>
    <AButton size="lg" icon-end="arrow-left" @click="goHome">بازگشت به خانه</AButton>
  </div>
</template>

<style scoped>
.err {
  min-height: 100dvh;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  gap: 0.8rem;
  padding: 2rem;
  background: var(--bg);
}
.err__code {
  font-size: clamp(5rem, 20vw, 9rem);
  font-weight: 700;
  font-style: italic;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--line-strong);
}
.err__title { font-size: var(--fs-2xl); font-weight: 900; }
.err__desc { max-width: 24rem; color: var(--muted); font-size: var(--fs-body); margin-bottom: 1.2rem; }
</style>
