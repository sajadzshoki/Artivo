import type { ChatMessage, FileAttachment } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, pushNotification, store } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

const MAX_FILES = 4
const MAX_FILE_BYTES = 500 * 1024

// POST /api/conversations/[id]/message — ارسال پیام + پیوست
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const thread = store.data.threads.find(t => t.id === getRouterParam(event, 'id'))
  if (!thread) throw createError({ statusCode: 404, message: 'گفتگو پیدا نشد.' })
  if (!thread.members.includes(user.id)) {
    throw createError({ statusCode: 403, message: 'این گفتگو در دسترس تو نیست.' })
  }

  const body = await readJson(event)
  const text = str(body.body).slice(0, 2000)

  const rawFiles = Array.isArray(body.files) ? body.files : []
  if (rawFiles.length > MAX_FILES) bad(`حداکثر ${MAX_FILES} فایل در هر پیام.`)
  const files: FileAttachment[] = rawFiles.map((f) => {
    const o = (f ?? {}) as Record<string, unknown>
    const name = str(o.name).slice(0, 120) || 'فایل'
    const url = str(o.url)
    if (!url.startsWith('data:')) bad('فایل نامعتبر است.')
    const size = Math.floor((url.length * 3) / 4)
    if (size > MAX_FILE_BYTES) bad(`«${name}» بزرگ‌تر از ۵۰۰ کیلوبایت است.`)
    return { id: `f-${Math.random().toString(36).slice(2, 8)}`, name, url, size }
  })

  if (!text && !files.length) bad('پیام خالی است.')

  const message: ChatMessage = {
    id: `m-${Math.random().toString(36).slice(2, 10)}`,
    from: user.id,
    fromName: user.name,
    body: text,
    files,
    at: store.now(),
    readAt: null,
  }
  thread.messages.push(message)
  delete thread.typing[user.id]

  // اطلاع‌رسانی برای هم‌صحبت
  const peerId = thread.members.find(m => m !== user.id)
  if (peerId) {
    const project = thread.projectId ? findProject(thread.projectId) : undefined
    pushNotification(
      peerId,
      'message',
      `پیام جدید از ${user.name}`,
      project ? `درباره‌ی «${project.title}»` : (text.slice(0, 60) || '📎 فایل'),
      `/messages/${thread.id}`,
    )
  }

  store.save()
  return { message }
})
