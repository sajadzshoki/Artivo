import { requireUser } from '../../utils/auth'
import { store, toProjectSummary } from '../../utils/store'

// GET /api/projects — پروژه‌های من (هر دو نقش)
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const mine = store.data.projects.filter(
    p => p.clientId === user.id || p.creativeId === user.id,
  )
  return {
    asClient: mine.filter(p => p.clientId === user.id).map(p => toProjectSummary(p, user.id)),
    asCreative: mine.filter(p => p.creativeId === user.id).map(p => toProjectSummary(p, user.id)),
  }
})
