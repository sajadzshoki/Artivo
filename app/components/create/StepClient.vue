<script setup lang="ts">
import { isValidMobile, isValidEmail, normalizeMobile } from '#shared/utils/format'

// گام ۷ — اطلاعات تماس (یک صفحه، بدون تقسیم به گام‌های جدا)
const { state } = useProjectRequest()

const nameError = computed(() => {
  const n = state.value.client.fullName.trim()
  if (n && n.length < 3) return 'نام کوتاه به نظر می‌رسد.'
  return ''
})
const mobileError = computed(() => {
  const m = state.value.client.mobile.trim()
  if (m && !isValidMobile(m)) return 'شماره موبایل معتبر نیست (مثلاً ۰۹۱۲۳۴۵۶۷۸۹).'
  return ''
})
const emailError = computed(() => {
  const e = state.value.client.email.trim()
  if (e && !isValidEmail(e)) return 'فرمت ایمیل درست نیست.'
  return ''
})
</script>

<template>
  <div class="client">
    <header class="s-head">
      <h2 class="t-h1">چطور به شما خبر بدهیم؟</h2>
      <p class="t-body">اطلاعات تماس در همین یک صفحه؛ خلاق‌ها و تیم آرتیوو فقط برای همین پروژه از آن استفاده می‌کنند.</p>
    </header>

    <AInput
      v-model="state.client.fullName"
      label="نام و نام خانوادگی"
      required
      icon="user"
      placeholder="مثلاً: نیلوفر رحیمی"
      :error="nameError"
    />

    <AInput
      v-model="state.client.mobile"
      label="شماره موبایل"
      required
      icon="at"
      dir="ltr"
      inputmode="tel"
      placeholder="0912 345 6789"
      hint="کد تایید و پیام‌های پروژه به این شماره می‌آید."
      :error="mobileError"
      @blur="state.client.mobile = normalizeMobile(state.client.mobile)"
    />

    <AInput
      v-model="state.client.email"
      label="ایمیل"
      dir="ltr"
      icon="send"
      inputmode="email"
      placeholder="you@example.com"
      hint="اختیاری — برای ارسال فایل‌های نهایی."
      :error="emailError"
    />

    <AInput
      v-model="state.client.telegram"
      label="آیدی تلگرام"
      dir="ltr"
      icon="send"
      placeholder="@username"
      hint="اختیاری — برای هماهنگی سریع‌تر."
    >
      <template #end>
        <span v-if="state.client.telegram && !state.client.telegram.startsWith('@')" class="client__at latin">@</span>
      </template>
    </AInput>

    <p class="client__privacy">
      <AIcon name="shield" :size="15" />
      اطلاعات شما نزد آرتیوو محفوظ است و فقط برای همین پروژه استفاده می‌شود.
    </p>
  </div>
</template>

<style scoped>
.client { display: grid; gap: 1.1rem; }
.s-head { display: grid; gap: 0.4rem; margin-bottom: 0.3rem; }

.client__at { color: var(--muted); font-size: var(--fs-small); }

.client__privacy {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  background: var(--green-soft);
  color: #1F7A4D;
  border-radius: var(--r-sm);
  padding: 0.7rem 0.85rem;
  font-size: var(--fs-caption);
  line-height: 1.85;
  margin-top: 0.3rem;
}
.client__privacy svg { flex-shrink: 0; margin-top: 0.2rem; }
</style>
