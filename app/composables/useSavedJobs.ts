// ─────────────────────────────────────────────────────────────
// useSavedJobs · ذخیره‌کردن پروژه‌ها (Phase 3: localStorage)
// امضا برای فاز بعد ثابت می‌ماند؛ فقط منبع داده عوض می‌شود.
// ─────────────────────────────────────────────────────────────
const KEY = 'artivo:saved-jobs:v1'

export function useSavedJobs() {
  const ids = useState<string[]>('artivo-saved-jobs', () => [])
  const ready = useState<boolean>('artivo-saved-jobs-ready', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (ready.value) return
      ready.value = true
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) ids.value = JSON.parse(raw)
      }
      catch { /* نادیده */ }
    })
    watch(ids, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) }
      catch { /* نادیده */ }
    }, { deep: true })
  }

  function isSaved(id: string): boolean {
    return ids.value.includes(id)
  }

  function toggle(id: string): boolean {
    const nowSaved = !isSaved(id)
    ids.value = nowSaved ? [...ids.value, id] : ids.value.filter(x => x !== id)
    return nowSaved
  }

  return { ids, ready, isSaved, toggle }
}
