import type { ProjectStatus } from '#shared/config/project-status'
import { canTransition } from '#shared/config/project-status'
import { requireUser } from '../../../utils/auth'
import { findProject, findThreadForProject, isParticipant, pushNotification, store } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

// POST /api/projects/[id]/status
// actions: publish | open | accept | reject | approve | cancel
// (submit-work و revision در endpoint های خودشان هستند)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const project = findProject(getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })

  const body = await readJson(event)
  const action = str(body.action)
  const isClient = project.clientId === user.id
  const isAdmin = user.roles.includes('admin')

  let threadId: string | null = null

  const setStatus = (next: ProjectStatus) => {
    if (!canTransition(project.status, next)) {
      bad(`گذار از «${project.status}» به «${next}» مجاز نیست.`)
    }
    project.status = next
    project.updatedAt = store.now()
  }

  switch (action) {
    case 'publish': {
      if (!isClient && !isAdmin) bad('فقط کارفرمای پروژه می‌تواند منتشر کند.')
      setStatus('published')
      break
    }
    case 'open': {
      if (!isClient && !isAdmin) bad('فقط کارفرمای پروژه می‌تواند دریافت پیشنهاد را باز کند.')
      setStatus('receiving')
      break
    }
    case 'accept': {
      if (!isClient && !isAdmin) bad('فقط کارفرما می‌تواند پیشنهاد را بپذیرد.')
      if (project.status !== 'receiving' && project.status !== 'published') {
        bad('پذیرش پیشنهاد فقط در فاز دریافت پیشنهاد ممکن است.')
      }
      const proposal = project.proposals.find(p => p.id === str(body.proposalId))
      if (!proposal) bad('پیشنهاد پیدا نشد.', 'proposalId')
      if (proposal.status !== 'pending') bad('این پیشنهاد قبلاً بررسی شده است.')
      proposal.status = 'accepted'
      // رد بقیه پیشنهادها
      for (const other of project.proposals) {
        if (other.id !== proposal.id && other.status === 'pending') other.status = 'rejected'
      }
      project.creativeId = proposal.creativeId
      project.creativeName = proposal.creativeName
      setStatus('in_progress')
      // گفتگوی پروژه‌محور — find-or-create
      const thread = findThreadForProject(project.id, project.clientId, project.creativeId)
        ?? {
          id: `th-${Math.random().toString(36).slice(2, 10)}`,
          projectId: project.id,
          members: [project.clientId, project.creativeId],
          messages: [],
          typing: {},
          createdAt: store.now(),
        }
      if (!store.data.threads.includes(thread)) store.data.threads.unshift(thread)
      threadId = thread.id
      pushNotification(
        proposal.creativeId,
        'proposal-accepted',
        'پیشنهادت پذیرفته شد 🎉',
        `پروژه‌ی «${project.title}» شروع شد. فضای گفتگو آماده است.`,
        `/messages/${thread.id}`,
      )
      break
    }
    case 'reject': {
      if (!isClient && !isAdmin) bad('فقط کارفرما می‌تواند پیشنهاد را رد کند.')
      const proposal = project.proposals.find(p => p.id === str(body.proposalId))
      if (!proposal) bad('پیشنهاد پیدا نشد.', 'proposalId')
      if (proposal.status !== 'pending') bad('این پیشنهاد قبلاً بررسی شده است.')
      proposal.status = 'rejected'
      project.updatedAt = store.now()
      pushNotification(
        proposal.creativeId,
        'proposal-rejected',
        'پیشنهادت بررسی شد',
        `پیشنهادت برای «${project.title}» این‌بار پذیرفته نشد؛ فرصت‌های دیگر در راه‌اند.`,
        '/dashboard',
      )
      break
    }
    case 'approve': {
      if (!isClient && !isAdmin) bad('فقط کارفرما می‌تواند کار نهایی را تأیید کند.')
      setStatus('completed')
      if (project.creativeId) {
        pushNotification(
          project.creativeId,
          'project-completed',
          'پروژه تکمیل شد ✅',
          `«${project.title}» با تأیید کارفرما بسته شد. پروژه‌ی بعدی منتظر است.`,
          `/projects/${project.id}`,
        )
      }
      break
    }
    case 'cancel': {
      if (!isClient && !isAdmin) bad('فقط کارفرما می‌تواند پروژه را لغو کند.')
      setStatus('cancelled')
      if (project.creativeId) {
        pushNotification(
          project.creativeId,
          'project-started',
          'پروژه لغو شد',
          `پروژه‌ی «${project.title}» توسط کارفرما لغو شد.`,
          `/projects/${project.id}`,
        )
      }
      break
    }
    default:
      bad('کنش نامعتبر است.')
  }

  store.save()
  return { project, threadId }
})
