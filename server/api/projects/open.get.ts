import { requireUser } from '../../utils/auth'
import { store, toProjectSummary } from '../../utils/store'

// GET /api/projects/open — فرصت‌های باز برای خلاق‌ها
// (منتشرشده + در حال دریافت پیشنهاد، بدون پروژه‌های خود کاربر)
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const open = store.data.projects.filter(
    p => (p.status === 'published' || p.status === 'receiving') && p.clientId !== user.id,
  )
  return { items: open.map(p => toProjectSummary(p, user.id)) }
})
