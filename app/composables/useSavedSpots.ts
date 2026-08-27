// ─────────────────────────────────────────────────────────────
// useSavedSpots · علاقه‌مندی لوکیشن‌ها (Phase 4: localStorage)
// ─────────────────────────────────────────────────────────────
const KEY = 'artivo:saved-spots:v1'

export function useSavedSpots() {
  const ids = useState<string[]>('artivo-saved-spots', () => [])
  const ready = useState<boolean>('artivo-saved-spots-ready', () => false)

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
    const now = !isSaved(id)
    ids.value = now ? [...ids.value, id] : ids.value.filter(x => x !== id)
    return now
  }

  return { ids, ready, isSaved, toggle }
}
