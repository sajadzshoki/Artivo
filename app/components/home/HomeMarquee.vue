<script setup lang="ts">
// نوار متحرک خدمات — لمسی از دنیای مطبوعات
const items = ['پوستر', 'لوگو', 'برندینگ', 'منوی کافه', 'سوشال مدیا', 'بسته‌بندی', 'عکاسی محصول', 'ادیت عکس', 'رابط کاربری']
</script>

<template>
  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <template v-for="n in 2" :key="n">
        <span v-for="it in items" :key="`${n}-${it}`" class="marquee__item">
          {{ it }} <i>✦</i>
        </span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  background: var(--ink);
  color: var(--bg);
  overflow: hidden;
  transform: rotate(-1.2deg) scale(1.02);
  margin-block: var(--sp-8);
  border-block: 1px solid var(--ink);
}
.marquee__track {
  display: flex;
  width: max-content;
  animation: slide 36s linear infinite;
}
.marquee__item {
  display: inline-flex;
  align-items: center;
  gap: 1.4rem;
  padding: 0.85rem 0.7rem 0.85rem 1.4rem;
  font-size: var(--fs-md);
  font-weight: 800;
  white-space: nowrap;
}
.marquee__item i {
  font-style: normal;
  color: var(--coral);
  font-size: 0.8rem;
}
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
</style>
