import type { Project, ProjectSummary } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useProjects · لایه‌ی پروژه‌ها — در فاز بک‌اند فقط بدنه‌ی این
// composable عوض می‌شود؛ UI دست‌نخورده می‌ماند.
// ─────────────────────────────────────────────────────────────
export function useProjects() {
  const asClient = useState<ProjectSummary[]>('prj-as-client', () => [])
  const asCreative = useState<ProjectSummary[]>('prj-as-creative', () => [])
  const ready = useState<boolean>('prj-ready', () => false)
  const loading = useState<boolean>('prj-loading', () => false)
  const error = useState<boolean>('prj-error', () => false)

  async function refresh() {
    if (!import.meta.client) return
    loading.value = true
    try {
      const res = await $fetch<{ asClient: ProjectSummary[]; asCreative: ProjectSummary[] }>('/api/projects')
      asClient.value = res.asClient
      asCreative.value = res.asCreative
      ready.value = true
      error.value = false
    }
    catch {
      if (!ready.value) error.value = true
    }
    finally {
      loading.value = false
    }
  }

  async function get(id: string): Promise<{ project: Project; myRole: 'client' | 'creative'; threadId: string | null } | null> {
    try {
      type Res = { project: Project; myRole: 'client' | 'creative'; threadId: string | null }
      return await ($fetch as unknown as (url: string) => Promise<Res>)(`/api/projects/${id}`)
    }
    catch {
      return null
    }
  }

  async function open(): Promise<ProjectSummary[]> {
    const res = await $fetch<{ items: ProjectSummary[] }>('/api/projects/open')
    return res.items
  }

  return { asClient, asCreative, ready, loading, error, refresh, get, open }
}
