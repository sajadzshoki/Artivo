import type { ThreadPayload } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, store } from '../../../utils/store'

const TYPING_WINDOW_MS = 4000

// GET /api/conversations/[id] — thread + پیام‌ها + وضعیت تایین
// خواندن = علامت‌گذاری پیام‌های طرف مقابل به‌عنوان خوانده‌شده
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const thread = store.data.threads.find(t => t.id === getRouterParam(event, 'id'))
  if (!thread) throw createError({ statusCode: 404, message: 'گفتگو پیدا نشد.' })
  if (!thread.members.includes(user.id) && !user.roles.includes('admin')) {
    throw createError({ statusCode: 403, message: 'این گفتگو در دسترس تو نیست.' })
  }

  // read receipts — پیام‌های دیگران خوانده شد
  const now = store.now()
  let changed = false
  for (const m of thread.messages) {
    if (m.from !== user.id && !m.readAt) {
      m.readAt = now
      changed = true
    }
  }

  // وضعیت تایپ هم‌صحبت
  const peerId = thread.members.find(m => m !== user.id) ?? ''
  const peerTypingAt = thread.typing[peerId] ?? 0
  const peerTyping = Date.now() - peerTypingAt < TYPING_WINDOW_MS

  if (changed || Object.keys(thread.typing).length) {
    // پاکسازی وضعیت تایپ قدیمی
    for (const [k, v] of Object.entries(thread.typing)) {
      if (Date.now() - v >= TYPING_WINDOW_MS) delete thread.typing[k]
    }
    store.save()
  }

  const project = thread.projectId ? findProject(thread.projectId) : undefined
  const peers = thread.members
    .filter(m => m !== user.id)
    .map(m => ({ id: m, name: store.data.users.find(u => u.id === m)?.name ?? 'کاربر' }))

  const payload: ThreadPayload = {
    id: thread.id,
    projectId: thread.projectId,
    projectTitle: project?.title ?? null,
    projectStatus: project?.status ?? null,
    peers,
    messages: thread.messages,
    peerTyping,
  }
  return payload
})
