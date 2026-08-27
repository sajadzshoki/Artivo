import { getAdminCollection } from '#shared/config/admin-collections'
import { requireAdmin } from '../../../../utils/auth'
import { collectionItems, store } from '../../../../utils/store'
import { bad } from '../../../../utils/validate'

// DELETE /api/admin/collections/[name]/[id]
// store-mode → حذف از آرایه · override-mode → افزودن به حذف‌شده‌ها
export default defineEventHandler((event) => {
  const admin = requireAdmin(event)
  const name = getRouterParam(event, 'name') ?? ''
  const id = getRouterParam(event, 'id') ?? ''
  const def = getAdminCollection(name)
  if (!def) throw createError({ statusCode: 404, message: 'کالکشن ناشناس است.' })
  if (!def.canDelete) bad('برای این کالکشن حذف ممکن نیست.')

  if (name === 'users') {
    if (id === admin.id) bad('نمی‌توانی حساب خودت را حذف کنی.')
    const i = store.data.users.findIndex(u => u.id === id)
    if (i === -1) throw createError({ statusCode: 404, message: 'کاربر پیدا نشد.' })
    store.data.users.splice(i, 1)
    for (const [token, s] of Object.entries(store.data.sessions)) {
      if (s.userId === id) delete store.data.sessions[token]
    }
    store.save()
    return { ok: true }
  }

  if (name === 'jobs' || name === 'spots' || name === 'services') {
    if (!store.data.deleted[name].includes(id)) store.data.deleted[name].push(id)
    store.save()
    return { ok: true }
  }

  const items = collectionItems(name)
  const i = items.findIndex(x => x.id === id)
  if (i === -1) throw createError({ statusCode: 404, message: 'آیتم پیدا نشد.' })
  items.splice(i, 1)
  store.save()
  return { ok: true }
})
