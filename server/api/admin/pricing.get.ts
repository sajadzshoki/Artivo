import { requireAdmin } from '../../utils/auth'
import { getAdminPricingRules } from '../../utils/store'

// GET /api/admin/pricing — قواعد قیمت‌گذاری (شکل دوستانه‌ی ادمین)
export default defineEventHandler((event) => {
  requireAdmin(event)
  return { rules: getAdminPricingRules() }
})
