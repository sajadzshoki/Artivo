import type { StoredUser } from '../../utils/store'
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'
import { createSession, findUserByEmail, findUserByMobile, toPublicUser } from '../../utils/auth'
import { verifyPassword } from '../../utils/crypto'
import { store } from '../../utils/store'
import { bad, readJson, str } from '../../utils/validate'

// POST /api/auth/login — ورود با ایمیل یا موبایل + رمز
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const identifierRaw = str(body.identifier)
  const password = str(body.password)

  if (!identifierRaw) bad('ایمیل یا شماره موبایل را وارد کن.', 'identifier')
  if (!password) bad('رمز عبور را وارد کن.', 'password')

  // تشخیص موبایل در برابر ایمیل
  const looksMobile = isValidMobile(normalizeMobile(identifierRaw))
  let user: StoredUser | undefined
  if (looksMobile) {
    user = findUserByMobile(normalizeMobile(identifierRaw))
  }
  else if (isValidEmail(identifierRaw)) {
    user = findUserByEmail(identifierRaw)
  }
  else {
    bad('ایمیل یا شماره موبایل معتبر وارد کن.', 'identifier')
  }

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw createError({ statusCode: 401, message: 'اطلاعات ورود درست نیست.' })
  }
  if (!user.active) {
    throw createError({ statusCode: 403, message: 'این حساب غیرفعال شده؛ با پشتیبانی تماس بگیر.' })
  }

  createSession(event, user.id)
  return { user: toPublicUser(user) }
})
