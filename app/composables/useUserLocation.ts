// ─────────────────────────────────────────────────────────────
// useUserLocation · موقعیت کاربر برای «نزدیک‌ترین لوکیشن‌ها»
// با اجازه‌ی کاربر؛ در رد شدن، خطای ملایم و ادامه‌ی مسیر عادی
// ─────────────────────────────────────────────────────────────
import type { LatLng } from '#shared/utils/geo'

export function useUserLocation() {
  const pos = useState<LatLng | null>('artivo-user-pos', () => null)
  const status = useState<'idle' | 'locating' | 'ready' | 'error'>('artivo-user-pos-status', () => 'idle')

  function locate(): Promise<LatLng | null> {
    if (import.meta.server || !navigator.geolocation) {
      status.value = 'error'
      return Promise.resolve(null)
    }
    status.value = 'locating'
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          pos.value = { lat: p.coords.latitude, lng: p.coords.longitude }
          status.value = 'ready'
          resolve(pos.value)
        },
        () => {
          status.value = 'error'
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
      )
    })
  }

  return { pos, status, locate }
}
