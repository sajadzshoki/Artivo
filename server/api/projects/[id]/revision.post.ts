import type { ProjectDeliverable } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, pushNotification, store } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

// POST /api/projects/[id]/revision — درخواست اصلاحیه توسط کارفرما
// آماده‌ی تأیید → نیازمند اصلاح
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const project = findProject(getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })

  if (project.clientId !== user.id && !user.roles.includes('admin')) {
    bad('فقط کارفرما می‌تواند اصلاحیه درخواست کند.')
  }
  if (project.status !== 'ready_for_approval') bad('در این وضعیت اصلاحیه معنا ندارد.')
  if (!project.creativeId) bad('خلاقِ پروژه مشخص نیست.')

  const body = await readJson(event)
  const note = str(body.note)
  if (note.length < 10) bad('نظرت را دقیق بنویس؛ حداقل ۱۰ کاراکتر.', 'note')

  project.revisionCount += 1
  project.updatedAt = store.now()

  // ثبت به‌عنوان تحویلِ ویژه تا تاریخچه‌ی بازنگری‌ها در پروژه دیده شود
  const entry: ProjectDeliverable = {
    id: `rv-${Math.random().toString(36).slice(2, 10)}`,
    authorId: user.id,
    authorName: user.name,
    note: `درخواست اصلاحیه ${project.revisionCount}: ${note}`,
    files: [],
    revisionNo: project.revisionCount,
    createdAt: store.now(),
  }
  project.deliverables.unshift(entry)

  project.status = 'revision_requested'
  pushNotification(
    project.creativeId,
    'revision-requested',
    `درخواست اصلاحیه ${project.revisionCount}`,
    `برای «${project.title}» بازخورد جدید داری.`,
    `/projects/${project.id}`,
  )
  store.save()
  return { project }
})
