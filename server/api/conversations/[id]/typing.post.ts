import { requireUser } from '../../../utils/auth'
import { store } from '../../../utils/store'

// POST /api/conversations/[id]/typing — «دارم می‌نویسم»
// سبک و ارزان؛ در فاز WebSocket با کانال دائم جایگزین می‌شود.
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const thread = store.data.threads.find(t => t.id === getRouterParam(event, 'id'))
  if (!thread || !thread.members.includes(user.id)) {
    throw createError({ statusCode: 404, message: 'گفتگو پیدا نشد.' })
  }
  thread.typing[user.id] = Date.now()
  store.save()
  return { ok: true }
})
