import { normalizeMobile, isValidMobile, isValidEmail } from '#shared/utils/format'
import { createSession, findUserByEmail, findUserByMobile, toPublicUser } from '../../utils/auth'
import { hashPassword, newId } from '../../utils/crypto'
import { store } from '../../utils/store'
import { bad, passwordError, readJson, str, strArray } from '../../utils/validate'

// POST /api/auth/register — ثبت‌نام با موبایل/ایمیل + رمز
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const name = str(body.name)
  const mobileRaw = str(body.mobile)
  const email = str(body.email).toLowerCase()
  const password = str(body.password)
  const roles = strArray(body.roles, 3).filter(r => r === 'client' || r === 'creative')

  if (name.length < 3) bad('نام باید حداقل ۳ کاراکتر باشد.', 'name')
  const mobile = normalizeMobile(mobileRaw)
  if (!isValidMobile(mobile)) bad('شماره موبایل معتبر نیست (مثال: 09123456789).', 'mobile')
  const pwErr = passwordError(password)
  if (pwErr) bad(pwErr, 'password')
  if (email && !isValidEmail(email)) bad('ایمیل معتبر نیست.', 'email')
  if (!roles.length) bad('حداقل یک نقش انتخاب کن.', 'roles')

  if (findUserByMobile(mobile)) bad('این شماره قبلاً ثبت شده؛ وارد شو یا رمز را بازیابی کن.', 'mobile')
  if (email && findUserByEmail(email)) bad('این ایمیل قبلاً ثبت شده است.', 'email')

  const user = {
    id: newId('u'),
    name,
    email,
    mobile,
    passwordHash: hashPassword(password),
    roles: roles as ('client' | 'creative')[],
    mobileVerified: false,
    active: true,
    clientProfile: { brandName: '', city: '', website: '', bio: '', preferredCategories: [] },
    creativeId: null,
    createdAt: store.now(),
  }
  store.data.users.push(user)
  createSession(event, user.id)
  store.save()
  return { user: toPublicUser(user) }
})
