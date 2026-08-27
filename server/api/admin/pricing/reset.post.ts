import { requireAdmin } from '../../../utils/auth'
import { store } from '../../../utils/store'

// POST /api/admin/pricing/reset — بازگشت به مقادیر پیش‌فرض repo
export default defineEventHandler((event) => {
  requireAdmin(event)
  store.data.adminPricing = null
  store.save()
  return { ok: true }
})
