<script setup lang="ts">
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// تنظیمات حساب — اطلاعات پایه، رمز عبور، نقش‌ها
// ─────────────────────────────────────────────────────────────
useHead({ title: 'تنظیمات حساب — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const { user, patchProfile, logout } = useAuth()
const toast = useToast()

// ── اطلاعات پایه ──
const name = ref('')
const email = ref('')
const mobile = ref('')
const roles = ref<string[]>([])
const fieldErrors = ref<Record<string, string>>({})
const savingInfo = ref(false)
const infoDirty = ref(false)

watch(() => user.value, (u) => {
  if (u && !infoDirty.value) {
    name.value = u.name
    email.value = u.email
    mobile.value = u.mobile
    roles.value = u.roles.filter(r => r !== 'admin')
  }
}, { immediate: true })

function markDirty() { infoDirty.value = true }

function toggleRole(r: string) {
  markDirty()
  roles.value = roles.value.includes(r)
    ? roles.value.filter(x => x !== r)
    : [...roles.value, r]
}

async function saveInfo() {
  fieldErrors.value = {}
  if (name.value.trim().length < 3) { fieldErrors.value.name = 'نام کوتاه است.'; return }
  if (email.value && !isValidEmail(email.value)) { fieldErrors.value.email = 'ایمیل معتبر نیست.'; return }
  if (!isValidMobile(normalizeMobile(mobile.value))) { fieldErrors.value.mobile = 'شماره معتبر نیست.'; return }
  if (!roles.value.length) { fieldErrors.value.roles = 'حداقل یک نقش.'; return }

  savingInfo.value = true
  try {
    await patchProfile({
      name: name.value.trim(),
      email: email.value.trim(),
      mobile: normalizeMobile(mobile.value),
      roles: roles.value,
    })
    infoDirty.value = false
    toast.success('ذخیره شد', 'اطلاعات حساب به‌روز شد.')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    if (e?.data?.data?.field) fieldErrors.value[e.data.data.field] = e?.data?.message ?? ''
    else toast.error('ذخیره نشد', e?.data?.message)
  }
  finally {
    savingInfo.value = false
  }
}

// ── رمز عبور ──
const currentPassword = ref('')
const newPassword = ref('')
const confirm2 = ref('')
const pwErrors = ref<Record<string, string>>({})
const savingPw = ref(false)

async function savePassword() {
  pwErrors.value = {}
  if (user.value?.hasPassword && !currentPassword.value) {
    pwErrors.value.currentPassword = 'رمز فعلی را وارد کن.'
    return
  }
  if (newPassword.value.length < 8 || !/[A-Za-z]/.test(newPassword.value) || !/\d/.test(newPassword.value)) {
    pwErrors.value.newPassword = 'رمز حداقل ۸ کاراکتر با حرف و رقم.'
    return
  }
  if (newPassword.value !== confirm2.value) {
    pwErrors.value.confirm = 'تکرار مطابق نیست.'
    return
  }
  savingPw.value = true
  try {
    await $fetch('/api/auth/password/change', {
      method: 'POST',
      body: { currentPassword: currentPassword.value, newPassword: newPassword.value },
    })
    currentPassword.value = newPassword.value = confirm2.value = ''
    toast.success('رمز عوض شد')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    if (e?.data?.data?.field) pwErrors.value[e.data.data.field] = e?.data?.message ?? ''
    else toast.error('تغییر رمز ناموفق بود', e?.data?.message)
  }
  finally {
    savingPw.value = false
  }
}

// ── تأیید شماره ──
const sendingCode = ref(false)
async function verifyMobile() {
  sendingCode.value = true
  try {
    await $fetch('/api/auth/otp/request', {
      method: 'POST',
      body: { mobile: user.value?.mobile, purpose: 'verify' },
    })
    await navigateTo({ path: '/auth/verify', query: { mobile: user.value?.mobile, purpose: 'verify' } })
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    toast.error('ارسال کد ناموفق بود', e?.data?.message)
  }
  finally {
    sendingCode.value = false
  }
}
</script>

<template>
  <div class="container settings" v-if="user">
    <header class="page-head" v-reveal>
      <NuxtLink to="/profile" class="crumbs">
        <AIcon name="arrow-right" :size="14" />
        پروفایل
      </NuxtLink>
      <h1 class="t-h1 page-head__title">تنظیمات حساب</h1>
    </header>

    <!-- اطلاعات پایه -->
    <section class="panel block" v-reveal>
      <h2 class="block__h">اطلاعات پایه</h2>
      <div class="block__grid">
        <AInput v-model="name" label="نام" :error="fieldErrors.name" @update:model-value="markDirty" />
        <AInput v-model="mobile" label="شماره موبایل" dir="ltr" inputmode="tel" icon="phone" :error="fieldErrors.mobile" @update:model-value="markDirty">
          <template v-if="!user.mobileVerified" #end>
            <button type="button" class="verify-chip" :disabled="sendingCode" @click="verifyMobile">تأیید</button>
          </template>
        </AInput>
        <AInput v-model="email" label="ایمیل" dir="ltr" type="email" icon="mail" :error="fieldErrors.email" @update:model-value="markDirty" />
      </div>

      <p v-if="!user.mobileVerified" class="unverified">
        <AIcon name="info" :size="14" />
        شماره‌ات تأیید نشده؛ برای اعتماد بیشتر تأییدش کن.
      </p>

      <div class="roles-row">
        <span class="roles-row__label">نقش‌ها</span>
        <div class="roles-chips" :class="{ 'roles-chips--error': fieldErrors.roles }">
          <button type="button" class="rchip" :class="{ 'rchip--on': roles.includes('client') }" @click="toggleRole('client')">
            <AIcon name="briefcase" :size="14" /> کارفرما
          </button>
          <button type="button" class="rchip" :class="{ 'rchip--on': roles.includes('creative') }" @click="toggleRole('creative')">
            <AIcon name="aperture" :size="14" /> خلاق
          </button>
          <span v-if="user.roles.includes('admin')" class="rchip rchip--on rchip--fixed">
            <AIcon name="shield" :size="14" /> مدیر
          </span>
        </div>
        <p v-if="fieldErrors.roles" class="err">{{ fieldErrors.roles }}</p>
      </div>

      <div class="block__actions">
        <AButton :loading="savingInfo" :disabled="!infoDirty" @click="saveInfo">ذخیره‌ی تغییرها</AButton>
      </div>
    </section>

    <!-- رمز عبور -->
    <section class="panel block" v-reveal>
      <h2 class="block__h">رمز عبور</h2>
      <p v-if="!user.hasPassword" class="t-caption block__note">
        حساب تو با کد پیامکی ساخته شده و رمز ندارد؛ یک رمز ست کن تا ورود با رمز هم فعال شود.
      </p>
      <div class="block__grid">
        <AInput
          v-if="user.hasPassword"
          v-model="currentPassword"
          label="رمز فعلی"
          type="password"
          icon="lock"
          :error="pwErrors.currentPassword"
        />
        <AInput v-model="newPassword" label="رمز جدید" type="password" icon="key" :error="pwErrors.newPassword" />
        <AInput v-model="confirm2" label="تکرار رمز جدید" type="password" icon="lock" :error="pwErrors.confirm" />
      </div>
      <div class="block__actions">
        <AButton variant="outline" :loading="savingPw" @click="savePassword">
          {{ user.hasPassword ? 'تغییر رمز' : 'ست کردن رمز' }}
        </AButton>
      </div>
    </section>

    <!-- خروج -->
    <section class="panel block block--danger" v-reveal>
      <h2 class="block__h">نشست</h2>
      <p class="t-caption block__note">از این دستگاه خارج می‌شوی؛ داده‌های محلی (پیشنهادها و درخواست‌ها) می‌مانند.</p>
      <div class="block__actions">
        <AButton variant="outline" icon="logout" @click="logout()">خروج از حساب</AButton>
      </div>
    </section>
  </div>
</template>

<style scoped>
.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--muted);
}
.crumbs:hover { color: var(--ink); }
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.5rem; }

.block { display: grid; gap: 1rem; padding: 1.3rem; margin-bottom: 1rem; }
.block__h { font-size: var(--fs-md); font-weight: 900; }
.block__note { color: var(--muted); }
.block__grid { display: grid; gap: 0.9rem; }
@media (min-width: 640px) { .block__grid { grid-template-columns: repeat(2, 1fr); } }
.block__actions { display: flex; justify-content: flex-end; }

.verify-chip {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--indigo-deep);
  background: var(--indigo-soft);
  border-radius: 99px;
  padding: 0.2rem 0.55rem;
}
.unverified {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-caption);
  color: var(--amber);
  font-weight: 700;
}

.roles-row { display: grid; gap: 0.45rem; }
.roles-row__label { font-size: var(--fs-small); font-weight: 800; }
.roles-chips { display: flex; gap: 0.45rem; flex-wrap: wrap; }
.rchip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1.5px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.85rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink-soft);
  transition: all 0.15s;
}
.rchip--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.rchip--fixed { opacity: 0.85; cursor: default; }
.roles-chips--error { outline: 1.5px solid var(--coral); outline-offset: 3px; border-radius: var(--r-sm); }
.err { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
</style>
