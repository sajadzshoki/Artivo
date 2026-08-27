<script setup lang="ts">
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// فراموشی رمز — مسیر موبایل (کد پیامکی) یا ایمیل
// ایمیل: production پیام عمومی · توسعه توکن نمایشی
// ─────────────────────────────────────────────────────────────
useHead({ title: 'بازیابی رمز عبور — آرتیوو' })
definePageMeta({ middleware: 'guest' })

const toast = useToast()
const config = useRuntimeConfig()
const devMode = computed(() => !!config.public.authDevMode)

const via = ref<'mobile' | 'email'>('mobile')
const mobile = ref('')
const email = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const loading = ref(false)
const emailSent = ref(false)
const devToken = ref('')

async function submit() {
  fieldErrors.value = {}
  formError.value = ''

  if (via.value === 'mobile') {
    const m = normalizeMobile(mobile.value)
    if (!isValidMobile(m)) {
      fieldErrors.value.mobile = 'شماره موبایل معتبر نیست.'
      return
    }
    loading.value = true
    try {
      await $fetch('/api/auth/password/forgot', { method: 'POST', body: { mobile: m } })
      await navigateTo({ path: '/auth/verify', query: { mobile: m, purpose: 'reset' } })
    }
    catch (err: unknown) {
      const e = err as { data?: { message?: string; data?: { field?: string } } }
      if (e?.data?.data?.field) fieldErrors.value[e.data.data.field] = e?.data?.message ?? ''
      else formError.value = e?.data?.message ?? 'ارسال کد ناموفق بود.'
    }
    finally {
      loading.value = false
    }
  }
  else {
    if (!isValidEmail(email.value)) {
      fieldErrors.value.email = 'ایمیل معتبر نیست.'
      return
    }
    loading.value = true
    try {
      const res = await $fetch<{ ok: boolean; devToken?: string }>('/api/auth/password/forgot', {
        method: 'POST',
        body: { email: email.value.trim() },
      })
      if (res.devToken) {
        devToken.value = res.devToken
        emailSent.value = true
      }
      else {
        emailSent.value = true
        toast.info('بررسی ایمیل', 'اگر حسابی با این ایمیل باشد، راه بازیابی برایت ارسال می‌شود.')
      }
    }
    catch (err: unknown) {
      const e = err as { data?: { message?: string; data?: { field?: string } } }
      if (e?.data?.data?.field) fieldErrors.value[e.data.data.field] = e?.data?.message ?? ''
      else formError.value = e?.data?.message ?? 'ارسال ناموفق بود.'
    }
    finally {
      loading.value = false
    }
  }
}

function useDevToken() {
  sessionStorage.setItem('artivo:reset-token', devToken.value)
  navigateTo('/auth/reset')
}
</script>

<template>
  <div class="container auth">
    <div class="auth__card panel" v-reveal>
      <header class="auth__head">
        <p class="overline">Recover</p>
        <h1 class="t-h1">بازیابی رمز عبور</h1>
        <p class="t-small auth__sub">با شماره موبایل سریع‌ترین راه است؛ کد پیامکی می‌فرستیم.</p>
      </header>

      <template v-if="!emailSent">
        <ASegmented
          v-model="via"
          :options="[
            { value: 'mobile', label: 'موبایل' },
            { value: 'email', label: 'ایمیل' },
          ]"
          class="auth__mode"
        />

        <form novalidate @submit.prevent="submit">
          <div class="auth__fields">
            <AInput
              v-if="via === 'mobile'"
              v-model="mobile"
              label="شماره موبایل حساب"
              placeholder="09123456789"
              dir="ltr"
              inputmode="tel"
              icon="phone"
              :error="fieldErrors.mobile"
            />
            <AInput
              v-else
              v-model="email"
              label="ایمیل حساب"
              placeholder="you@example.com"
              dir="ltr"
              type="email"
              icon="mail"
              :error="fieldErrors.email"
            />
          </div>

          <p v-if="formError" class="auth__error" role="alert">{{ formError }}</p>

          <AButton type="submit" block size="lg" :loading="loading" icon-end="arrow-left">
            ادامه
          </AButton>
        </form>
      </template>

      <template v-else>
        <AEmptyState
          icon="mail"
          title="درخواست ثبت شد"
          :description="devMode && devToken
            ? 'حالت توسعه: سرویس ایمیل وصل نیست؛ با دکمه‌ی زیر مستقیم به مرحله‌ی رمز جدید برو.'
            : 'اگر حسابی با این ایمیل باشد، راه بازیابی برایت ارسال می‌شود.'"
        >
          <AButton v-if="devMode && devToken" size="sm" icon-end="arrow-left" @click="useDevToken">
            رمز جدید (لینک نمایشی)
          </AButton>
          <AButton v-else to="/auth/login" variant="outline" size="sm">بازگشت به ورود</AButton>
        </AEmptyState>
      </template>

      <p class="auth__hint t-caption">
        حساب یادت آمد؟ <NuxtLink to="/auth/login" class="auth__link auth__link--strong">وارد شو</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; place-items: center; padding-block: clamp(2rem, 7vw, 5rem); }
.auth__card { width: min(26rem, 100%); padding: clamp(1.4rem, 5vw, 2.2rem); display: grid; gap: 1.2rem; }
.auth__head { display: grid; gap: 0.3rem; }
.auth__sub { color: var(--muted); }
.auth__fields { display: grid; gap: 0.9rem; margin-bottom: 0.9rem; }
.auth__error {
  background: var(--coral-soft);
  color: var(--coral-deep);
  border-radius: var(--r-sm);
  padding: 0.6rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  margin-bottom: 0.9rem;
}
.auth__hint { color: var(--faint); text-align: center; }
.auth__link:hover { color: var(--ink); }
.auth__link--strong { color: var(--coral-deep); }
</style>
