// نشست کاربر در SSR خوانده می‌شود تا گاردها و هدر بدون پرش رندر شوند
export default defineNuxtPlugin(async () => {
  if (import.meta.server) {
    const { refresh } = useAuth()
    await refresh(useRequestFetch() as typeof $fetch)
  }
})
