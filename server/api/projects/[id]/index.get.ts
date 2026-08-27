import type { Project } from '#shared/types'
import { requireUser } from '../../../utils/auth'
import { findProject, findThreadForProject, isParticipant, store } from '../../../utils/store'

// GET /api/projects/[id] — جزئیات کامل (فقط طرف‌های پروژه یا ادمین)
export default defineEventHandler((event) => {
  const user = requireUser(event)
  const project = findProject(getRouterParam(event, 'id') ?? '')
  if (!project) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })

  const isAdmin = user.roles.includes('admin')
  const hasProposed = project.proposals.some(p => p.creativeId === user.id)
  if (!isAdmin && !isParticipant(project, user.id) && !hasProposed) {
    throw createError({ statusCode: 403, message: 'این پروژه در دسترس تو نیست.' })
  }

  // پیشنهادهای دیگران فقط برای کارفرما/ادمین دیده می‌شود
  const visible: Project = isAdmin || project.clientId === user.id
    ? project
    : { ...project, proposals: project.proposals.filter(p => p.creativeId === user.id) }

  const thread = isParticipant(project, user.id)
    ? findThreadForProject(project.id, project.clientId, project.creativeId ?? '')
    : undefined

  return {
    project: visible,
    myRole: project.clientId === user.id ? 'client' : 'creative',
    threadId: thread?.id ?? null,
  }
})
