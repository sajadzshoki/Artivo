import type { JobProposal } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useJobProposals · پیشنهادهای ثبت‌شده‌ی خلاق (Phase 3: localStorage)
// در فاز بعد با API جایگزین می‌شود؛ امضای تابع‌ها ثابت می‌ماند.
// ─────────────────────────────────────────────────────────────
const KEY = 'artivo:proposals:v1'

export function useJobProposals() {
  const proposals = useState<JobProposal[]>('artivo-job-proposals', () => [])
  const ready = useState<boolean>('artivo-job-proposals-ready', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (ready.value) return
      ready.value = true
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) proposals.value = JSON.parse(raw)
      }
      catch { /* نادیده */ }
    })
    watch(proposals, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) }
      catch { /* نادیده */ }
    }, { deep: true })
  }

  function hasProposed(jobId: string): JobProposal | undefined {
    return proposals.value.find(p => p.jobId === jobId)
  }

  function upsert(p: JobProposal) {
    const i = proposals.value.findIndex(x => x.jobId === p.jobId)
    if (i >= 0) {
      const copy = [...proposals.value]
      copy[i] = p
      proposals.value = copy
    }
    else {
      proposals.value = [p, ...proposals.value]
    }
  }

  return { proposals, ready, hasProposed, upsert }
}
