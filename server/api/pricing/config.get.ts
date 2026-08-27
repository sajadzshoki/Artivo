import { getPricingBundle } from '../../utils/store'

// GET /api/pricing/config — بسته‌ی موتور قیمت + کاتالوگ ویزارد
// عمومی؛ تغییرات پنل ادمین بدون deploy از همین‌جا به UI می‌رسد.
export default defineEventHandler(() => {
  return getPricingBundle()
})
