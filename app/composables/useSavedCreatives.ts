// ─────────────────────────────────────────────────────────────
// useSavedCreatives · خلاق‌های ذخیره‌شده (localStorage)
// هم‌خانواده‌ی useSavedJobs و useSavedSpots
// ─────────────────────────────────────────────────────────────
const KEY = 'artivo:saved-creatives:v1'

export function useSavedCreatives() {
  const ids = useState<string[]>('saved-creatives', () => [])
  const ready = useState<boolean>('saved-creatives-ready', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (ready.value) return
      ready.value = true
      try {
        const raw = localStorage.getItem(KEY)
        if (raw) ids.value = JSON.parse(raw)
      }
      catch { /* خراب — نادیده */ }
    })
    watch(ids, (v) => {
      try { localStorage.setItem(KEY, JSON.stringify(v)) }
      catch { /* حافظه پر */ }
    }, { deep: true })
  }

  function isSaved(id: string): boolean {
    return ids.value.includes(id)
  }

  function toggle(id: string): boolean {
    if (ids.value.includes(id)) {
      ids.value = ids.value.filter(x => x !== id)
      return false
    }
    ids.value = [id, ...ids.value]
    return true
  }

  return { ids, ready, isSaved, toggle }
}
