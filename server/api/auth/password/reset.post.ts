import { passwordError, readJson, str, bad } from '../../../utils/validate'
import { hashPassword } from '../../../utils/crypto'
import { store } from '../../../utils/store'

// POST /api/auth/password/reset — ست کردن رمز با توکن بازیابی
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const token = str(body.token)
  const password = str(body.password)

  if (!token) bad('توکن بازیابی نامعتبر است.')
  const record = store.data.resets[token]
  if (!record || record.exp < Date.now()) bad('لینک/توکن بازیابی منقضی شده؛ دوباره شروع کن.')

  const pwErr = passwordError(password)
  if (pwErr) bad(pwErr, 'password')

  const user = store.data.users.find(u => u.id === record.userId)
  if (!user) bad('کاربر پیدا نشد.')

  user.passwordHash = hashPassword(password)
  delete store.data.resets[token]
  store.save()
  return { ok: true }
})
