<script setup lang="ts">
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// ثبت‌نام — موبایل + رمز؛ نقش: کارفرما، خلاق یا هر دو
// ─────────────────────────────────────────────────────────────
useHead({ title: 'ساخت حساب — آرتیوو' })
definePageMeta({ middleware: 'guest' })

const { register } = useAuth()
const toast = useToast()

const form = reactive({
  name: '',
  mobile: '',
  email: '',
  password: '',
})
const roles = ref<string[]>(['client'])
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const loading = ref(false)

const passwordStrength = computed(() => {
  const p = form.password
  let score = 0
  if (p.length >= 8) score++
  if (/[A-Za-z]/.test(p) && /\d/.test(p)) score++
  if (p.length >= 12 || /[^A-Za-z0-9]/.test(p)) score++
  return score
})

function toggleRole(role: string) {
  roles.value = roles.value.includes(role)
    ? roles.value.filter(r => r !== role)
    : [...roles.value, role]
}

function clientFieldError(err: unknown, fallback: string): string {
  const e = err as { data?: { message?: string; data?: { field?: string } } }
  const field = e?.data?.data?.field
  if (field) {
    fieldErrors.value[field] = e?.data?.message ?? ''
    return ''
  }
  return e?.data?.message ?? fallback
}

async function submit() {
  fieldErrors.value = {}
  formError.value = ''

  if (form.name.trim().length < 3) fieldErrors.value.name = 'نام باید حداقل ۳ کاراکتر باشد.'
  if (!isValidMobile(normalizeMobile(form.mobile))) fieldErrors.value.mobile = 'شماره موبایل معتبر نیست.'
  if (form.email && !isValidEmail(form.email)) fieldErrors.value.email = 'ایمیل معتبر نیست.'
  if (form.password.length < 8) fieldErrors.value.password = 'رمز حداقل ۸ کاراکتر باشد.'
  else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) fieldErrors.value.password = 'رمز باید هم حرف و هم رقم داشته باشد.'
  if (!roles.value.length) fieldErrors.value.roles = 'حداقل یک نقش انتخاب کن.'
  if (Object.keys(fieldErrors.value).length) return

  loading.value = true
  try {
    const user = await register({
      name: form.name.trim(),
      mobile: normalizeMobile(form.mobile),
      email: form.email.trim(),
      password: form.password,
      roles: roles.value,
    })
    toast.success('حسابت ساخته شد', `خوش آمدی، ${user.name}!`)
    await navigateTo('/profile')
  }
  catch (err: unknown) {
    formError.value = clientFieldError(err, 'ثبت‌نام ناموفق بود.')
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container auth">
    <div class="auth__card panel" v-reveal>
      <header class="auth__head">
        <p class="overline">Join</p>
        <h1 class="t-h1">ساخت حساب</h1>
        <p class="t-small auth__sub">می‌توانی هم‌زمان کارفرما و خلاق باشی؛ بعداً هم می‌شود اضافه کرد.</p>
      </header>

      <form novalidate @submit.prevent="submit">
        <div class="auth__fields">
          <AInput v-model="form.name" label="نام و نام‌خانوادگی" placeholder="مثلاً سارا محمدی" :error="fieldErrors.name" required />
          <AInput v-model="form.mobile" label="شماره موبایل" placeholder="09123456789" dir="ltr" inputmode="tel" icon="phone" :error="fieldErrors.mobile" required />
          <AInput v-model="form.email" label="ایمیل (اختیاری)" placeholder="you@example.com" dir="ltr" type="email" icon="mail" :error="fieldErrors.email" />
          <div>
            <AInput v-model="form.password" label="رمز عبور" type="password" placeholder="حداقل ۸ کاراکتر، حرف + رقم" icon="lock" :error="fieldErrors.password" required />
            <div v-if="form.password" class="strength" aria-hidden="true">
              <i v-for="i in 3" :key="i" :class="{ 'strength__on': passwordStrength >= i }" class="strength__bar" />
            </div>
          </div>
        </div>

        <!-- نقش‌ها -->
        <div class="roles" :class="{ 'roles--error': fieldErrors.roles }">
          <button type="button" class="role" :class="{ 'role--on': roles.includes('client') }" :aria-pressed="roles.includes('client')" @click="toggleRole('client')">
            <AIcon name="briefcase" :size="17" />
            <span>
              <strong>کارفرما</strong>
              <small>پروژه می‌دهم و خلاق استخدام می‌کنم</small>
            </span>
          </button>
          <button type="button" class="role" :class="{ 'role--on': roles.includes('creative') }" :aria-pressed="roles.includes('creative')" @click="toggleRole('creative')">
            <AIcon name="aperture" :size="17" />
            <span>
              <strong>خلاق</strong>
              <small>طراح یا عکاس؛ پروژه می‌گیرم</small>
            </span>
          </button>
        </div>
        <p v-if="fieldErrors.roles" class="auth__field-error">{{ fieldErrors.roles }}</p>

        <p v-if="formError" class="auth__error" role="alert">{{ formError }}</p>

        <AButton type="submit" block size="lg" :loading="loading" icon-end="arrow-left">
          ساخت حساب
        </AButton>
        <p class="auth__hint t-caption">
          حساب داری؟ <NuxtLink to="/auth/login" class="auth__link auth__link--strong">وارد شو</NuxtLink>
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth { display: grid; place-items: center; padding-block: clamp(2rem, 7vw, 5rem); }
.auth__card { width: min(26rem, 100%); padding: clamp(1.4rem, 5vw, 2.2rem); display: grid; gap: 1.2rem; }
.auth__head { display: grid; gap: 0.3rem; }
.auth__sub { color: var(--muted); }
.auth__fields { display: grid; gap: 0.9rem; margin-bottom: 0.9rem; }

.strength { display: flex; gap: 0.3rem; margin-top: 0.4rem; }
.strength__bar { height: 3px; flex: 1; border-radius: 2px; background: var(--line); transition: background 0.2s; }
.strength__on { background: var(--green); }

.roles { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.3rem; }
.role {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  text-align: start;
  border: 1.5px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-md);
  padding: 0.7rem 0.8rem;
  transition: all 0.15s;
}
.role svg { margin-top: 0.15rem; color: var(--muted); }
.role strong { display: block; font-size: var(--fs-small); font-weight: 900; }
.role small { display: block; font-size: 0.66rem; color: var(--muted); line-height: 1.7; margin-top: 0.1rem; }
.role--on { border-color: var(--ink); background: var(--ink); }
.role--on strong { color: var(--bg); }
.role--on small { color: color-mix(in srgb, var(--bg) 70%, transparent); }
.role--on svg { color: var(--coral); }
.roles--error { outline: 1.5px solid var(--coral); outline-offset: 3px; border-radius: var(--r-sm); }
.auth__field-error { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); margin-top: 0.4rem; }

.auth__error {
  background: var(--coral-soft);
  color: var(--coral-deep);
  border-radius: var(--r-sm);
  padding: 0.6rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  margin-bottom: 0.9rem;
}
.auth__hint { color: var(--faint); margin-top: 0.9rem; text-align: center; }
.auth__link:hover { color: var(--ink); }
.auth__link--strong { color: var(--coral-deep); }
</style>
