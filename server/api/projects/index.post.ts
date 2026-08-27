import type { Project } from '#shared/types'
import { requireUser } from '../../utils/auth'
import { newId } from '../../utils/crypto'
import { pushNotification, store, toProjectSummary } from '../../utils/store'
import { bad, num, readJson, str } from '../../utils/validate'

// POST /api/projects — ساخت پروژه (کارفرما)
// مسیرها: فرم /projects/new یا تبدیل بریف ویزارد به پروژه
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const body = await readJson(event)

  const title = str(body.title)
  if (title.length < 4) bad('عنوان پروژه حداقل ۴ کاراکتر باشد.', 'title')

  const typeId = str(body.typeId)
  const typeLabel = str(body.typeLabel) || 'پروژه'
  if (!typeId) bad('نوع پروژه را انتخاب کن.', 'typeId')

  const description = str(body.description)
  if (description.length < 30) bad('توضیحات حداقل ۳۰ کاراکتر باشد تا خلاق‌ها بفهمند چه می‌خواهی.', 'description')

  const budgetMin = body.budgetMin == null || body.budgetMin === '' ? null : num(body.budgetMin)
  const budgetMax = body.budgetMax == null || body.budgetMax === '' ? null : num(body.budgetMax)
  if (budgetMin !== null && (!Number.isFinite(budgetMin) || budgetMin < 0)) bad('بودجه‌ی حداقل نامعتبر است.', 'budgetMin')
  if (budgetMax !== null && (!Number.isFinite(budgetMax) || budgetMax < 0)) bad('بودجه‌ی حداکثر نامعتبر است.', 'budgetMax')
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) bad('حداقل بودجه نمی‌تواند از حداکثر بیشتر باشد.', 'budgetMin')

  const deadlineDays = body.deadlineDays == null || body.deadlineDays === '' ? null : Math.round(num(body.deadlineDays))
  if (deadlineDays !== null && (!Number.isFinite(deadlineDays) || deadlineDays < 1 || deadlineDays > 365)) {
    bad('مهلت باید بین ۱ تا ۳۶۵ روز باشد.', 'deadlineDays')
  }

  const project: Project = {
    id: newId('prj'),
    title,
    typeId,
    typeLabel,
    description,
    budgetMin: budgetMin !== null && Number.isFinite(budgetMin) ? budgetMin : null,
    budgetMax: budgetMax !== null && Number.isFinite(budgetMax) ? budgetMax : null,
    deadlineDays,
    status: 'draft',
    clientId: user.id,
    clientName: user.name,
    creativeId: null,
    creativeName: null,
    proposals: [],
    deliverables: [],
    revisionCount: 0,
    code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: store.now(),
    updatedAt: store.now(),
  }
  store.data.projects.unshift(project)
  store.save()
  return { project, summary: toProjectSummary(project, user.id) }
})
