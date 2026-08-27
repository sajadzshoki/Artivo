import type { FileAttachment, ProjectDeliverable } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, pushNotification, store } from '../../../utils/store'
import { bad, num, readJson, str } from '../../../utils/validate'

const MAX_FILES = 4
const MAX_FILE_BYTES = 500 * 1024

/** اعتبارسنجی پیوست‌ها — DataURL با سقف حجم */
function parseFiles(raw: unknown, label: string): FileAttachment[] {
  if (!Array.isArray(raw)) return []
  if (raw.length > MAX_FILES) bad(`حداکثر ${MAX_FILES} فایل در هر ${label}.`)
  return raw.map((f) => {
    const o = (f ?? {}) as Record<string, unknown>
    const name = str(o.name).slice(0, 120) || 'فایل'
    const url = str(o.url)
    if (!url.startsWith('data:')) bad(`${label}: فایل نامعتبر است.`)
    const size = Math.floor((url.length * 3) / 4)
    if (size > MAX_FILE_BYTES) bad(`«${name}» بزرگ‌تر از ۵۰۰ کیلوبایت است.`)
    return { id: `f-${Math.random().toString(36).slice(2, 8)}`, name, url, size }
  })
}

// POST /api/projects/[id]/deliverable — ارسال کار توسط خلاق
// در حال انجام یا بعد از درخواست اصلاحیه → آماده‌ی تأیید
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const project = findProject(getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })

  if (project.creativeId !== user.id) bad('فقط خلاقِ منتخب می‌تواند کار را ارسال کند.')
  if (project.status !== 'in_progress' && project.status !== 'revision_requested') {
    bad('ارسال کار در این وضعیت ممکن نیست.')
  }

  const body = await readJson(event)
  const note = str(body.note)
  if (note.length < 10) bad('توضیح کوتاهی درباره‌ی کار بنویس (حداقل ۱۰ کاراکتر).', 'note')
  const files = parseFiles(body.files, 'تحویل')
  if (!files.length) bad('حداقل یک فایل خروجی پیوست کن.', 'files')

  const deliverable: ProjectDeliverable = {
    id: `dl-${Math.random().toString(36).slice(2, 10)}`,
    authorId: user.id,
    authorName: user.name,
    note,
    files,
    revisionNo: project.revisionCount,
    createdAt: store.now(),
  }
  project.deliverables.unshift(deliverable)
  project.status = 'ready_for_approval'
  project.updatedAt = store.now()
  pushNotification(
    project.clientId,
    'work-submitted',
    'کار آماده‌ی بررسی است',
    `${user.name} نسخه‌ی ${project.revisionCount === 0 ? 'اول' : 'جدید'} «${project.title}» را فرستاد.`,
    `/projects/${project.id}`,
  )
  store.save()
  return { deliverable, project }
})
