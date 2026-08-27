<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// رمز جدید — با توکن بازیابی (بعد از تأیید OTP یا لینک ایمیل)
// ─────────────────────────────────────────────────────────────
useHead({ title: 'رمز جدید — آرتیوو' })
definePageMeta({ middleware: 'guest' })

const route = useRoute()
const toast = useToast()
const { login } = useAuth()

const token = ref('')
const password = ref('')
const confirm = ref('')
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const loading = ref(false)

onMounted(() => {
  token.value = String(route.query.token ?? '') || sessionStorage.getItem('artivo:reset-token') || ''
  sessionStorage.removeItem('artivo:reset-token')
})

async function submit() {
  fieldErrors.value = {}
  formError.value = ''
  if (!token.value) {
    formError.value = 'توکن بازیابی پیدا نشد؛ دوباره شروع کن.'
    return
  }
  if (password.value.length < 8 || !/[A-Za-z]/.test(password.value) || !/\d/.test(password.value)) {
    fieldErrors.value.password = 'رمز حداقل ۸ کاراکتر با حرف و رقم.'
    return
  }
  if (password.value !== confirm.value) {
    fieldErrors.value.confirm = 'تکرار رمز مطابق نیست.'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/password/reset', {
      method: 'POST',
      body: { token: token.value, password: password.value },
    })
    toast.success('رمز عوض شد', 'حالا با رمز جدید وارد شو.')
    await navigateTo('/auth/login')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    if (e?.data?.data?.field) fieldErrors.value[e.data.data.field] = e?.data?.message ?? ''
    else formError.value = e?.data?.message ?? 'ثبت رمز ناموفق بود.'
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
        <p class="overline">New password</p>
        <h1 class="t-h1">رمز جدید</h1>
        <p class="t-small auth__sub">یک رمز قوی انتخاب کن؛ حداقل ۸ کاراکتر با حرف و رقم.</p>
      </header>

      <form novalidate @submit.prevent="submit">
        <div class="auth__fields">
          <AInput v-model="password" label="رمز جدید" type="password" placeholder="••••••••" icon="lock" :error="fieldErrors.password" required />
          <AInput v-model="confirm" label="تکرار رمز جدید" type="password" placeholder="••••••••" icon="lock" :error="fieldErrors.confirm" required />
        </div>

        <p v-if="formError" class="auth__error" role="alert">{{ formError }}</p>

        <AButton type="submit" block size="lg" :loading="loading" icon-end="check">
          ثبت رمز جدید
        </AButton>
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
.auth__error {
  background: var(--coral-soft);
  color: var(--coral-deep);
  border-radius: var(--r-sm);
  padding: 0.6rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  margin-bottom: 0.9rem;
}
</style>
