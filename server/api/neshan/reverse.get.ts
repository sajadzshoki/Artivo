// ─────────────────────────────────────────────────────────────
// ژئوکد معکوس نشان — پروکسی سمت سرور
// کلید NUXT_NESHAN_API_KEY هرگز به کلاینت نمی‌رود؛ کلاینت فقط
// این endpoint را صدا می‌زند. بدون کلید: پاسخ graceful با ok:false
// ─────────────────────────────────────────────────────────────
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const q = getQuery(event)
  const lat = Number(q.lat)
  const lng = Number(q.lng)

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw createError({ statusCode: 400, message: 'مختصات نامعتبر است' })
  }

  const key = config.neshanApiKey
  if (!key) {
    return { ok: false, reason: 'neshan-not-configured' as const }
  }

  try {
    const res = await $fetch<{ formatted_address?: string; city?: string }>(
      'https://api.neshan.org/v5/reverse',
      {
        params: { lat, lng },
        headers: { 'Api-Key': key },
        timeout: 8000,
      },
    )
    return {
      ok: true as const,
      address: res.formatted_address ?? '',
      city: res.city ?? '',
    }
  }
  catch {
    return { ok: false, reason: 'neshan-unavailable' as const }
  }
})
