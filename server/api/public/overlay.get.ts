import { publicOverlay } from '../../utils/store'

// GET /api/public/overlay — هم‌پوشانی عمومی داده‌ی استاتیک
// (وضعیت پروژه‌ها/لوکیشن‌ها/سرویس‌ها + خلاق‌های جامعه + تاکسونومی‌ها)
export default defineEventHandler(() => {
  return publicOverlay()
})
