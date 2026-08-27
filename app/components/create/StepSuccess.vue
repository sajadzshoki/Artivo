<script setup lang="ts">
// صفحه‌ی موفقیت — پس از ثبت درخواست
const emit = defineEmits<{ new: [] }>()
const lastCode = useState<string | null>('artivo-last-code', () => null)

onMounted(() => window.scrollTo({ top: 0 }))

function copyCode() {
  if (lastCode.value) window.navigator.clipboard?.writeText(lastCode.value).catch(() => {})
}
</script>

<template>
  <div class="done">
    <span class="done__badge" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="72" height="72" fill="none">
        <circle cx="32" cy="32" r="29" stroke="var(--coral)" stroke-width="3" class="done__ring" />
        <path d="M20 33.5 28.5 42 44 24" stroke="var(--ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="done__tick" />
      </svg>
    </span>

    <h2 class="t-h1 done__title">درخواستت ثبت شد!</h2>
    <p class="t-body-lg done__desc">
      بریف تو برای خلاق‌های مناسب ارسال شد. تا ۲۴ ساعت آینده پیشنهادها را برایت می‌فرستیم.
    </p>

    <div class="done__code">
      <span>کد پیگیری</span>
      <strong class="latin">{{ lastCode ?? 'ART-0000' }}</strong>
      <button
        type="button"
        class="done__copy"
        aria-label="کپی کد پیگیری"
        @click="copyCode"
      >
        <AIcon name="file" :size="14" />
      </button>
    </div>

    <div class="done__actions">
      <AButton to="/" size="lg" variant="secondary">بازگشت به خانه</AButton>
      <AButton to="/profile" size="lg" variant="outline">درخواست‌های من</AButton>
      <AButton size="lg" variant="ghost" @click="emit('new')">ثبت درخواست جدید</AButton>
    </div>

    <p class="done__note t-caption">
      یادآوری: مبلغ نمایش‌داده‌شده صرفاً برآورد خودکار بود؛ قیمت نهایی پس از بررسی بریف اعلام می‌شود.
    </p>
  </div>
</template>

<style scoped>
.done {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 0.8rem;
  padding-block: 3rem 2rem;
  animation: pop-in 0.5s var(--ease-out) both;
}

.done__ring {
  stroke-dasharray: 190;
  stroke-dashoffset: 190;
  animation: draw 0.9s var(--ease-out) 0.15s forwards;
}
.done__tick {
  stroke-dasharray: 42;
  stroke-dashoffset: 42;
  animation: draw 0.5s var(--ease-out) 0.75s forwards;
}
@keyframes draw { to { stroke-dashoffset: 0; } }

.done__title { margin-top: 0.5rem; }
.done__desc { max-width: 24rem; }

.done__code {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--paper);
  border: 1px dashed var(--line-strong);
  border-radius: var(--r-md);
  padding: 0.6rem 1rem;
  margin-top: 0.6rem;
}
.done__code span { font-size: var(--fs-caption); color: var(--muted); }
.done__code strong { font-size: 1.05rem; font-weight: 700; letter-spacing: 0.08em; color: var(--coral-deep); }
.done__copy {
  display: grid; place-items: center;
  color: var(--muted);
  transition: color 0.2s;
}
.done__copy:hover { color: var(--ink); }

.done__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
}
.done__note { margin-top: 1.2rem; max-width: 22rem; }
</style>
