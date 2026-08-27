import { requireUser } from '../../../utils/auth'
import { hashPassword, verifyPassword } from '../../../utils/crypto'
import { store } from '../../../utils/store'
import { bad, passwordError, readJson, str } from '../../../utils/validate'

// POST /api/auth/password/change — تغییر رمز (کاربر وارد‌شده)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const body = await readJson(event)
  const current = str(body.currentPassword)
  const next = str(body.newPassword)

  // کاربرِ بدون رمز (ورود OTP) می‌تواند بی‌رمزِ فعلی ست کند
  if (user.passwordHash && !verifyPassword(current, user.passwordHash)) {
    bad('رمز فعلی درست نیست.', 'currentPassword')
  }
  const pwErr = passwordError(next)
  if (pwErr) bad(pwErr, 'newPassword')
  if (user.passwordHash && verifyPassword(next, user.passwordHash)) {
    bad('رمز جدید نباید با رمز فعلی یکسان باشد.', 'newPassword')
  }

  user.passwordHash = hashPassword(next)
  store.save()
  return { ok: true }
})
