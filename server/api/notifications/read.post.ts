import { requireUser } from '../../utils/auth'
import { store } from '../../utils/store'
import { readJson, str } from '../../utils/validate'

// POST /api/notifications/read — خواندن یکی یا همه
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const body = await readJson(event)
  const id = str(body.id)

  for (const n of store.data.notifications) {
    if (n.userId !== user.id || n.readAt) continue
    if (!id || n.id === id) n.readAt = store.now()
  }
  store.save()
  return { ok: true }
})
