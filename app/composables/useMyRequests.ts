import type { SubmittedRequest } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useMyRequests · درخواست‌های ثبت‌شده‌ی کاربر (Phase 1: localStorage)
// در فاز بعد با API جایگزین می‌شود؛ امضای تابع‌ها ثابت می‌ماند.
// ─────────────────────────────────────────────────────────────
const KEY = 'artivo:requests:v1'

export function useMyRequests() {
  const requests = useState<SubmittedRequest[]>('artivo-my-requests', () => [])
  const ready = useState<boolean>('artivo-my-requests-ready', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (ready.value) return
      ready.value = true
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) requests.value = JSON.parse(raw)
      }
      catch { /* نادیده */ }
    })
    watch(requests, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) }
      catch { /* نادیده */ }
    }, { deep: true })
  }

  function add(r: SubmittedRequest) {
    requests.value = [r, ...requests.value]
  }

  return { requests, ready, add }
}
