<script setup lang="ts">
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// ورود — رمز عبور (ایمیل یا موبایل) یا کد یک‌بارمصرف
// ─────────────────────────────────────────────────────────────
useHead({ title: 'ورود — آرتیوو' })
definePageMeta({ middleware: 'guest' })

const route = useRoute()
const { login } = useAuth()
const toast = useToast()
const config = useRuntimeConfig()
const devMode = computed(() => !!config.public.authDevMode)

const mode = ref<'password' | 'otp'>('password')
const identifier = ref('')
const password = ref('')
const otpMobile = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const loading = ref(false)
const sending = ref(false)

const redirect = computed(() => {
  const r = route.query.redirect
  return typeof r === 'string' && r.startsWith('/') ? r : '/profile'
})

function clearErrors() {
  fieldErrors.value = {}
  formError.value = ''
}

async function submitPassword() {
  clearErrors()
  const id = identifier.value.trim()
  if (!id) {
    fieldErrors.value.identifier = 'ایمیل یا شماره موبایل را وارد کن.'
    return
  }
  if (!password.value) {
    fieldErrors.value.password = 'رمز عبور را وارد کن.'
    return
  }
  loading.value = true
  try {
    const user = await login(id, password.value)
    toast.success(`خوش برگشتی، ${user.name}!`)
    await navigateTo(redirect.value)
  }
  catch (err: unknown) {
    formError.value = extractError(err, 'ورود ناموفق بود.')
  }
  finally {
    loading.value = false
  }
}

async function submitOtp() {
  clearErrors()
  const mobile = normalizeMobile(otpMobile.value)
  if (!isValidMobile(mobile)) {
    fieldErrors.value.otpMobile = 'شماره موبایل معتبر نیست (مثال: 09123456789).'
    return
  }
  sending.value = true
  try {
    await $fetch('/api/auth/otp/request', {
      method: 'POST',
      body: { mobile, purpose: 'login' },
    })
    await navigateTo({
      path: '/auth/verify',
      query: { mobile, purpose: 'login', redirect: redirect.value },
    })
  }
  catch (err: unknown) {
    formError.value = extractError(err, 'ارسال کد ناموفق بود.')
  }
  finally {
    sending.value = false
  }
}

function extractError(err: unknown, fallback: string): string {
  const e = err as { data?: { message?: string; data?: { field?: string; wait?: number } } }
  const field = e?.data?.data?.field
  if (field) fieldErrors.value[field === 'otpMobile' ? 'otpMobile' : field] = e?.data?.message ?? ''
  return e?.data?.message ?? fallback
}
</script>

<template>
  <div class="container auth">
    <div class="auth__card panel" v-reveal>
      <header class="auth__head">
        <p class="overline">Account</p>
        <h1 class="t-h1">ورود به آرتیوو</h1>
        <p class="t-small auth__sub">با رمز عبور یا کد پیامکی وارد شو.</p>
      </header>

      <ASegmented
        v-model="mode"
        :options="[
          { value: 'password', label: 'رمز عبور' },
          { value: 'otp', label: 'کد پیامکی' },
        ]"
        class="auth__mode"
      />

      <!-- رمز عبور -->
      <form v-if="mode === 'password'" novalidate @submit.prevent="submitPassword">
        <div class="auth__fields">
          <AInput
            v-model="identifier"
            label="ایمیل یا شماره موبایل"
            placeholder="you@example.com یا 09123456789"
            icon="user"
            :error="fieldErrors.identifier"
            @keyup.enter="submitPassword"
          />
          <AInput
            v-model="password"
            label="رمز عبور"
            type="password"
            placeholder="••••••••"
            icon="lock"
            :error="fieldErrors.password"
          />
        </div>

        <p v-if="formError" class="auth__error" role="alert">{{ formError }}</p>

        <AButton type="submit" block size="lg" :loading="loading" icon-end="arrow-left">
          ورود
        </AButton>
        <div class="auth__links">
          <NuxtLink to="/auth/forgot" class="auth__link">رمزت را فراموش کرده‌ای؟</NuxtLink>
          <NuxtLink to="/auth/register" class="auth__link auth__link--strong">ساخت حساب</NuxtLink>
        </div>
      </form>

      <!-- کد پیامکی -->
      <form v-else novalidate @submit.prevent="submitOtp">
        <div class="auth__fields">
          <AInput
            v-model="otpMobile"
            label="شماره موبایل"
            placeholder="09123456789"
            icon="phone"
            dir="ltr"
            inputmode="tel"
            :error="fieldErrors.otpMobile"
          />
        </div>

        <p v-if="formError" class="auth__error" role="alert">{{ formError }}</p>

        <AButton type="submit" block size="lg" :loading="sending" icon-end="arrow-left">
          ارسال کد تأیید
        </AButton>
        <p class="auth__hint t-caption">
          اگر با این شماره حساب نداشته باشی، همین‌جا حساب جدید ساخته می‌شود.
        </p>
      </form>

      <!-- ⚠️ فقط حالت توسعه -->
      <div v-if="devMode" class="auth__dev">
        <AIcon name="info" :size="15" />
        <div>
          <strong>حالت توسعه</strong>
          <p>
            کد OTP همیشه <b class="latin">1111</b> است.
            حساب‌های نمونه: <span class="latin">admin@artivo.ir</span> ·
            <span class="latin">client@artivo.ir</span> ·
            <span class="latin">leila@artivo.ir</span> — رمز همه: <b class="latin">artivo1234</b>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; place-items: center; padding-block: clamp(2rem, 7vw, 5rem); }
.auth__card { width: min(26rem, 100%); padding: clamp(1.4rem, 5vw, 2.2rem); display: grid; gap: 1.2rem; }
.auth__head { display: grid; gap: 0.3rem; }
.auth__sub { color: var(--muted); }
.auth__mode { margin-bottom: 0.2rem; }
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
.auth__links { display: flex; justify-content: space-between; margin-top: 0.9rem; }
.auth__link { font-size: var(--fs-caption); font-weight: 700; color: var(--muted); }
.auth__link:hover { color: var(--ink); }
.auth__link--strong { color: var(--coral-deep); }
.auth__hint { color: var(--faint); margin-top: 0.7rem; }

.auth__dev {
  display: flex;
  gap: 0.6rem;
  background: var(--amber-soft);
  border-radius: var(--r-md);
  padding: 0.75rem 0.9rem;
  font-size: var(--fs-caption);
  color: var(--ink-soft);
}
.auth__dev svg { flex-shrink: 0; color: var(--amber); margin-top: 0.15rem; }
.auth__dev strong { font-size: var(--fs-caption); }
.auth__dev p { margin-top: 0.15rem; line-height: 1.9; }
.auth__dev b { color: var(--coral-deep); }
</style>
