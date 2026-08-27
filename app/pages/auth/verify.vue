<script setup lang="ts">
import { faDigits } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// تأیید کد یک‌بارمصرف — ورود / بازیابی رمز / تأیید شماره
// ⚠️ در حالت توسعه کد همیشه 1111 است (نمایش راهنما فقط dev).
// ─────────────────────────────────────────────────────────────
useHead({ title: 'تأیید کد — آرتیوو' })
definePageMeta({ middleware: 'guest' })

const route = useRoute()
const { setUser } = useAuth()
const toast = useToast()
const config = useRuntimeConfig()
const devMode = computed(() => !!config.public.authDevMode)

const mobile = computed(() => String(route.query.mobile ?? ''))
const purpose = computed(() => {
  const p = String(route.query.purpose ?? 'login')
  return ['login', 'reset', 'verify'].includes(p) ? p as 'login' | 'reset' | 'verify' : 'login'
})
const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/profile'
})

const code = ref('')
const error = ref('')
const verifying = ref(false)
const resendIn = ref(45)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (resendIn.value > 0) resendIn.value--
    else if (timer) clearInterval(timer)
  }, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })

const purposeTitle = computed(() => ({
  login: 'ورود با کد پیامکی',
  reset: 'بازیابی رمز عبور',
  verify: 'تأیید شماره موبایل',
})[purpose.value])

async function submit() {
  error.value = ''
  if (code.value.length !== 4) {
    error.value = 'کد ۴ رقمی را کامل وارد کن.'
    return
  }
  verifying.value = true
  try {
    const res = await $fetch<{ user?: import('#shared/types').PublicUser; resetToken?: string }>(
      '/api/auth/otp/verify',
      { method: 'POST', body: { mobile: mobile.value, code: code.value, purpose: purpose.value } },
    )

    if (purpose.value === 'login' && res.user) {
      setUser(res.user)
      toast.success(`خوش برگشتی، ${res.user.name}!`)
      await navigateTo(redirect.value)
    }
    else if (purpose.value === 'reset' && res.resetToken) {
      sessionStorage.setItem('artivo:reset-token', res.resetToken)
      await navigateTo('/auth/reset')
    }
    else if (purpose.value === 'verify') {
      if (res.user) setUser(res.user)
      toast.success('شماره موبایلت تأیید شد.')
      await navigateTo('/profile/settings')
    }
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    error.value = e?.data?.message ?? 'بررسی کد ناموفق بود.'
    code.value = ''
  }
  finally {
    verifying.value = false
  }
}

async function resend() {
  if (resendIn.value > 0) return
  error.value = ''
  try {
    await $fetch('/api/auth/otp/request', { method: 'POST', body: { mobile: mobile.value, purpose: purpose.value } })
    resendIn.value = 45
    toast.success('کد جدید ارسال شد.')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    error.value = e?.data?.message ?? 'ارسال مجدد ناموفق بود.'
  }
}
</script>

<template>
  <div class="container auth">
    <div class="auth__card panel" v-reveal>
      <header class="auth__head">
        <p class="overline">Verify</p>
        <h1 class="t-h1">{{ purposeTitle }}</h1>
        <p class="t-small auth__sub">
          کد ۴ رقمی به شماره‌ی <b class="latin" dir="ltr">{{ faDigits(mobile) }}</b> پیامک شد.
        </p>
      </header>

      <form novalidate @submit.prevent="submit">
        <OtpInput v-model="code" />

        <p v-if="error" class="auth__error" role="alert">{{ error }}</p>

        <!-- ⚠️ فقط حالت توسعه -->
        <p v-if="devMode" class="auth__devcode">
          <AIcon name="info" :size="14" />
          حالت توسعه — کد: <b class="latin">1111</b>
        </p>

        <AButton type="submit" block size="lg" :loading="verifying" icon-end="check">
          تأیید
        </AButton>
      </form>

      <div class="auth__links auth__links--center">
        <button type="button" class="auth__link" :disabled="resendIn > 0" @click="resend">
          <template v-if="resendIn > 0">ارسال مجدد تا {{ faDigits(resendIn) }} ثانیه</template>
          <template v-else>ارسال مجدد کد</template>
        </button>
        <NuxtLink to="/auth/login" class="auth__link auth__link--strong">تغییر شماره / روش ورود</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; place-items: center; padding-block: clamp(2rem, 7vw, 5rem); }
.auth__card { width: min(26rem, 100%); padding: clamp(1.4rem, 5vw, 2.2rem); display: grid; gap: 1.3rem; }
.auth__head { display: grid; gap: 0.3rem; }
.auth__sub { color: var(--muted); line-height: 1.9; }
.auth__sub b { color: var(--ink); }
.auth__error {
  background: var(--coral-soft);
  color: var(--coral-deep);
  border-radius: var(--r-sm);
  padding: 0.6rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  margin-block: 0.9rem;
}
.auth__devcode {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  background: var(--amber-soft);
  color: var(--ink-soft);
  border-radius: var(--r-sm);
  padding: 0.45rem 0.7rem;
  font-size: var(--fs-caption);
  margin-block: 0.9rem 0;
}
.auth__devcode b { color: var(--coral-deep); }
.auth__links--center { display: grid; justify-items: center; gap: 0.4rem; }
.auth__link { font-size: var(--fs-caption); font-weight: 700; color: var(--muted); background: none; padding: 0; }
.auth__link:hover:not(:disabled) { color: var(--ink); }
.auth__link:disabled { opacity: 0.55; }
.auth__link--strong { color: var(--coral-deep); }
</style>
