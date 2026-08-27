import { requireUser } from '../../utils/auth'
import { store } from '../../utils/store'

// GET /api/notifications — اعلان‌های من + شمار خوانده‌نشده
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const items = store.data.notifications.filter(n => n.userId === user.id).slice(0, 60)
  return {
    items,
    unread: store.data.notifications.filter(n => n.userId === user.id && !n.readAt).length,
  }
})
