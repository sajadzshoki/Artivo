// ─────────────────────────────────────────────────────────────
// ابزارهای جغرافیایی — فاصله‌ی هاورساین و فرمت فارسی
// ─────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number
  lng: number
}

/** فاصله به کیلومتر */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function toRad(d: number): number {
  return (d * Math.PI) / 180
}

/** «۸۵۰ متر» / «۳٫۲ کیلومتر» */
export function formatDistance(km: number): string {
  const fa = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 })
  if (km < 1) return `${fa.format(Math.round(km * 1000 / 50) * 50)} متر`
  return `${fa.format(km)} کیلومتر`
}
