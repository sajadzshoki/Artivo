import type { ProjectProposal } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, pushNotification, store } from '../../../utils/store'
import { bad, num, readJson, str } from '../../../utils/validate'

// POST /api/projects/[id]/proposal — ارسال پیشنهاد توسط خلاق
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const project = findProject(getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })

  if (project.clientId === user.id) bad('به پروژه‌ی خودت نمی‌توانی پیشنهاد بدهی.')
  if (project.status !== 'receiving') bad('این پروژه در فاز دریافت پیشنهاد نیست.')
  if (project.proposals.some(p => p.creativeId === user.id)) bad('قبلاً برای این پروژه پیشنهاد فرستاده‌ای.')

  const body = await readJson(event)
  const price = num(body.price)
  if (!Number.isFinite(price) || price < 100_000) bad('قیمت پیشنهادی حداقل ۱۰۰٬۰۰۰ تومان است.', 'price')
  const deliveryDays = Math.round(num(body.deliveryDays))
  if (!Number.isFinite(deliveryDays) || deliveryDays < 1 || deliveryDays > 365) bad('مهلت تحویل بین ۱ تا ۳۶۵ روز.', 'deliveryDays')
  const message = str(body.message)
  if (message.length < 20) bad('توضیح پیشنهاد حداقل ۲۰ کاراکتر باشد.', 'message')

  const proposal: ProjectProposal = {
    id: `pp-${Math.random().toString(36).slice(2, 10)}`,
    creativeId: user.id,
    creativeName: user.name,
    price: Math.round(price),
    deliveryDays,
    message,
    status: 'pending',
    createdAt: store.now(),
  }
  project.proposals.push(proposal)
  project.updatedAt = store.now()
  pushNotification(
    project.clientId,
    'proposal',
    'پیشنهاد جدید دریافت کردی',
    `${user.name} برای «${project.title}» پیشنهاد فرستاد.`,
    `/projects/${project.id}`,
  )
  store.save()
  return { proposal }
})
