import type { PhotoSpot, SpotPhoto } from '#shared/types'
import { photoSpots } from '#shared/data/spots'
import { useOverlay } from './useOverlay'
import { haversineKm, type LatLng } from '#shared/utils/geo'

// ─────────────────────────────────────────────────────────────
// useSpots · منبع لوکیشن‌ها
// داده‌ی استاتیک + هم‌پوشانی محلی کاربران (localStorage):
//  - لوکیشن‌های افزوده (artivo:user-spots)
//  - عکس‌های افزوده به لوکیشن‌های موجود (artivo:spot-photos)
//  - امتیاز کاربر (artivo:spot-ratings)
// در فاز بعد فقط این composable به API وصل می‌شود؛ UI دست‌نخورده.
// ─────────────────────────────────────────────────────────────

const USER_SPOTS_KEY = 'artivo:user-spots:v1'
const USER_PHOTOS_KEY = 'artivo:spot-photos:v1'
const RATINGS_KEY = 'artivo:spot-ratings:v1'

export interface NewSpotInput {
  name: string
  city: string
  address: string
  description: string
  tip: string
  bestTime: string
  location: LatLng
  categories: PhotoSpot['categories']
  tags: string[]
  photos: { url: string; author: string }[]
}

export function useSpots() {
  const userSpots = useState<PhotoSpot[]>('artivo-user-spots', () => [])
  const userPhotos = useState<Record<string, SpotPhoto[]>>('artivo-spot-photos-map', () => ({}))
  const userRatings = useState<Record<string, number>>('artivo-spot-ratings', () => ({}))
  const ready = useState<boolean>('artivo-spots-ready', () => false)

  if (import.meta.client) {
    onMounted(() => {
      if (ready.value) return
      ready.value = true
      try {
        const a = localStorage.getItem(USER_SPOTS_KEY)
        if (a) userSpots.value = JSON.parse(a)
        const b = localStorage.getItem(USER_PHOTOS_KEY)
        if (b) userPhotos.value = JSON.parse(b)
        const c = localStorage.getItem(RATINGS_KEY)
        if (c) userRatings.value = JSON.parse(c)
      }
      catch { /* نادیده */ }
    })
    watch([userSpots, userPhotos, userRatings], () => {
      try {
        localStorage.setItem(USER_SPOTS_KEY, JSON.stringify(userSpots.value))
        localStorage.setItem(USER_PHOTOS_KEY, JSON.stringify(userPhotos.value))
        localStorage.setItem(RATINGS_KEY, JSON.stringify(userRatings.value))
      }
      catch { /* پر شدن حافظه — عکس‌های داده‌ای بزرگ */ }
    }, { deep: true })
  }

  // هم‌پوشانی ادمین: مخفی‌ها حذف، وصله‌های نام/شهر/زمان، ویژه‌ها اول
  const { overlay } = useOverlay()

  /** همه‌ی لوکیشن‌ها — افزوده‌های کاربر اول؛ قبل از mount فقط استاتیک (بدون mismatch) */
  const all = computed<PhotoSpot[]>(() => {
    const base = ready.value ? [...userSpots.value, ...photoSpots] : [...photoSpots]
    const o = overlay.value
    const patched = base
      .filter(s => !o.hiddenSpotIds.includes(s.id))
      .map(s => ({ ...s, ...(o.spotOverrides[s.id] ?? {}) }))
    patched.sort((a, b) =>
      Number(o.featuredSpotIds.includes(b.id)) - Number(o.featuredSpotIds.includes(a.id)))
    return patched
  })

  function getById(id: string): PhotoSpot | undefined {
    return all.value.find(s => s.id === id)
  }

  /** امتیاز نمایشی: میانگین پایه + امتیاز کاربر (در صورت وجود) */
  function displayRating(spot: PhotoSpot): { rating: number; count: number; mine?: number } {
    const mine = userRatings.value[spot.id]
    if (mine == null) return { rating: spot.rating, count: spot.ratingsCount }
    const rating = Number(((spot.rating * spot.ratingsCount + mine) / (spot.ratingsCount + 1)).toFixed(1))
    return { rating, count: spot.ratingsCount + 1, mine }
  }

  function rate(spotId: string, stars: number) {
    userRatings.value = { ...userRatings.value, [spotId]: Math.min(5, Math.max(1, Math.round(stars))) }
  }

  function addPhoto(spotId: string, photo: { url: string; author: string }) {
    const current = userPhotos.value[spotId] ?? []
    userPhotos.value = {
      ...userPhotos.value,
      [spotId]: [...current, { id: `up-${Math.random().toString(36).slice(2, 9)}`, url: photo.url, author: photo.author || 'مهمان', user: true }],
    }
  }

  function userPhotosOf(spotId: string): SpotPhoto[] {
    return userPhotos.value[spotId] ?? []
  }

  /** عکس‌های نهایی یک لوکیشن: عکس‌های پایه + عکس‌های کاربران */
  function photosOf(spot: PhotoSpot): SpotPhoto[] {
    return [...spot.photos, ...userPhotosOf(spot.id)]
  }

  function addSpot(input: NewSpotInput): PhotoSpot {
    const spot: PhotoSpot = {
      id: `us-${Math.random().toString(36).slice(2, 9)}`,
      name: input.name.trim(),
      city: input.city.trim() || 'نامشخص',
      address: input.address.trim(),
      description: input.description.trim(),
      tip: input.tip.trim(),
      bestTime: input.bestTime || 'ساعت طلایی',
      location: { ...input.location },
      categories: input.categories,
      tags: input.tags,
      photos: input.photos.map((ph, i) => ({
        id: `usp-${i}-${Math.random().toString(36).slice(2, 6)}`,
        url: ph.url,
        author: ph.author || 'مهمان',
        user: true,
      })),
      rating: input.photos.length ? 5 : 0,
      ratingsCount: 1,
      accent: '#4B44DC',
      userAdded: true,
    }
    userSpots.value = [spot, ...userSpots.value]
    return spot
  }

  function distanceFrom(spot: PhotoSpot, p: LatLng): number {
    return haversineKm(p, spot.location)
  }

  return { all, ready, getById, displayRating, rate, addPhoto, userPhotosOf, photosOf, addSpot, distanceFrom }
}
