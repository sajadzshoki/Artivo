// ─────────────────────────────────────────────────────────────
// useMapProvider · لایه‌ی انتزاعی نقشه
//
// هدف: تعویض ارائه‌دهنده‌ی نقشه بدون تغییر UI.
// کامپوننت‌ها فقط با MapController کار می‌کنند.
//
// ارائه‌دهنده‌ها:
//  - 'neshan' → Neshan Web SDK (کلید: NUXT_PUBLIC_NESHAN_MAP_KEY)
//  - 'none'   → بدون کلید؛ کامپوننت‌ها placeholder کاربردی نشان می‌دهند
//
// افزودن ارائه‌دهنده‌ی جدید (Mapbox/OSM/...): یک شاخه در createMap
// باز کنید و MapController همان API را برگردانید.
// ─────────────────────────────────────────────────────────────

export interface MapPoint {
  lat: number
  lng: number
}

export interface MapMarkerInput {
  id: string
  lat: number
  lng: number
}

export interface MapController {
  setCenter(p: MapPoint, zoom?: number): void
  setMarkers(markers: MapMarkerInput[]): void
  onMarkerClick(cb: (id: string) => void): void
  onMapClick(cb: (p: MapPoint) => void): void
  destroy(): void
  provider: MapProviderName
}

export type MapProviderName = 'neshan' | 'none'

interface CreateOptions {
  center: MapPoint
  zoom: number
}

let loadPromise: Promise<void> | null = null
let loadedProvider: MapProviderName | null = null

/** بارگیری یک‌باره‌ی SDK نشان (CSS + JS) */
function loadSdk(provider: MapProviderName): Promise<void> {
  if (provider === 'none') return Promise.resolve()
  if (loadPromise && loadedProvider === provider) return loadPromise

  const config = useRuntimeConfig()
  const url = config.public.neshanSdkUrl as string
  const css = config.public.neshanSdkCss as string

  loadPromise = new Promise((resolve, reject) => {
    if (css && !document.querySelector('link[data-neshan-css]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = css
      link.setAttribute('data-neshan-css', '1')
      document.head.appendChild(link)
    }

    if (document.querySelector('script[data-neshan-sdk]')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = url
    script.async = true
    script.setAttribute('data-neshan-sdk', '1')
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('neshan-sdk-load-failed'))
    document.head.appendChild(script)
    setTimeout(() => reject(new Error('neshan-sdk-timeout')), 12_000)
  })

  loadedProvider = provider
  return loadPromise
}

/** تشخیص آبجکت سراسری نقشه — پشتیبانی از نسخه‌های مختلف SDK نشان */
function detectNeshanGlobal(): { flavor: 'classic' | 'mapbox'; ns: any } | null {
  const w = window as any
  if (w.neshan?.maps?.Map) return { flavor: 'classic', ns: w.neshan }
  if (w.neshan_maps_plattform?.Map) return { flavor: 'mapbox', ns: w.neshan_maps_plattform }
  if (w.NeshanMap?.Map) return { flavor: 'mapbox', ns: w.NeshanMap }
  return null
}

export function useMapProvider() {
  const config = useRuntimeConfig()

  const provider = computed<MapProviderName>(() => {
    if ((config.public.neshanProvider ?? 'neshan') !== 'neshan') return 'none'
    return config.public.neshanMapKey ? 'neshan' : 'none'
  })

  /** ساخت نقشه؛ در نبود کلید یا خطای بارگیری، null → placeholder */
  async function createMap(el: HTMLElement, opts: CreateOptions): Promise<MapController | null> {
    if (import.meta.server) return null
    if (provider.value === 'none') return null

    try {
      await loadSdk('neshan')
      await new Promise(r => setTimeout(r, 80))
      const detected = detectNeshanGlobal()
      if (!detected) return null
      return buildNeshanController(el, detected.ns, detected.flavor, opts)
    }
    catch {
      return null
    }
  }

  return { provider, createMap }
}

// ─────────────────────────────────────────────────────────────
// آداپتور نشان — دو flavor پشتیبانی می‌شود:
//   classic (Leaflet-محور): new neshan.maps.Map(el, { map_key, center:[lat,lng], zoom })
//   mapbox  (MapboxGL-محور): new ns.Map({ mapKey, container, center:[lng,lat], zoom })
// همه‌ی متدها defensive نوشته شده‌اند تا اختلاف نسخه‌ها نشکند.
// ─────────────────────────────────────────────────────────────

function buildNeshanController(
  el: HTMLElement,
  ns: any,
  flavor: 'classic' | 'mapbox',
  opts: CreateOptions,
): MapController | null {
  const config = useRuntimeConfig()
  const key = config.public.neshanMapKey as string

  let map: any
  try {
    if (flavor === 'classic') {
      map = new ns.maps.Map(el, {
        map_key: key,
        center: [opts.center.lat, opts.center.lng],
        zoom: opts.zoom,
      })
    }
    else {
      map = new ns.Map({
        mapKey: key,
        container: el,
        center: [opts.center.lng, opts.center.lat],
        zoom: opts.zoom,
      })
    }
  }
  catch {
    return null
  }

  if (!map) return null

  let markerClickCb: ((id: string) => void) | null = null
  let mapClickCb: ((p: MapPoint) => void) | null = null
  let nativeMarkers: any[] = []

  function toPoint(e: any): MapPoint | null {
    const ll = e?.latlng ?? e?.lngLat ?? e?.lnglat
    if (!ll) return null
    const lat = ll.lat ?? ll[1]
    const lng = ll.lng ?? ll[0]
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng }
  }

  function bindClick(target: any, cb: (p: MapPoint) => void) {
    // Leaflet-سبک
    if (typeof target.on === 'function') {
      target.on('click', (e: any) => {
        const p = toPoint(e)
        if (p) cb(p)
      })
      return true
    }
    // SDKهای event-based
    const evt = ns.maps?.event
    if (typeof evt?.addListener === 'function') {
      evt.addListener(target, 'click', (e: any) => {
        const p = toPoint(e)
        if (p) cb(p)
      })
      return true
    }
    if (typeof target.addListener === 'function') {
      target.addListener('click', (e: any) => {
        const p = toPoint(e)
        if (p) cb(p)
      })
      return true
    }
    return false
  }

  function addMarker(m: MapMarkerInput) {
    try {
      let marker: any
      if (flavor === 'classic') {
        marker = new ns.maps.Marker({
          map,
          position: [m.lat, m.lng],
          title: m.id,
        })
      }
      else {
        marker = new ns.Marker()
          .setLngLat([m.lng, m.lat])
        if (typeof marker.addTo === 'function') marker = marker.addTo(map)
      }
      if (!marker) return
      nativeMarkers.push(marker)
      if (markerClickCb) bindClick(marker, () => markerClickCb?.(m.id))
    }
    catch { /* مارکر این نسخه پشتیبانی نشد — فهرست همچنان کار می‌کند */ }
  }

  function removeMarkers() {
    for (const mk of nativeMarkers) {
      try { mk.remove?.() } catch { try { mk.setMap?.(null) } catch { /* نادیده */ } }
    }
    nativeMarkers = []
  }

  bindClick(map, (p) => { mapClickCb?.(p) })

  const controller: MapController = {
    provider: 'neshan',

    setCenter(p: MapPoint, zoom?: number) {
      try {
        if (typeof map.setView === 'function') {
          map.setView([p.lat, p.lng], zoom)
        }
        else if (typeof map.flyTo === 'function') {
          map.flyTo({ center: [p.lng, p.lat], zoom: zoom ?? map.getZoom?.() ?? opts.zoom })
        }
        else if (map.options?.map) {
          map.options.map.center = [p.lat, p.lng]
        }
      }
      catch { /* نادیده */ }
    },

    setMarkers(markers: MapMarkerInput[]) {
      removeMarkers()
      for (const m of markers) addMarker(m)
    },

    onMarkerClick(cb: (id: string) => void) {
      markerClickCb = cb
    },

    onMapClick(cb: (p: MapPoint) => void) {
      mapClickCb = cb
    },

    destroy() {
      try { removeMarkers() } catch { /* نادیده */ }
      try { map.remove?.() } catch { try { map.destroy?.() } catch { /* نادیده */ } }
    },
  }

  return controller
}
