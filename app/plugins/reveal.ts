// ─────────────────────────────────────────────────────────────
// پلاگین v-reveal · ظاهر شدن نرم بخش‌ها هنگام اسکرول
// ─────────────────────────────────────────────────────────────
export default defineNuxtPlugin((nuxtApp) => {
  let observer: IntersectionObserver | null = null

  function getObserver() {
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            observer?.unobserve(e.target)
          }
        }
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' })
    }
    return observer
  }

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),
    mounted(el: HTMLElement, binding) {
      if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      el.classList.add('reveal')
      if (typeof binding.value === 'number') el.style.transitionDelay = `${binding.value}ms`
      getObserver().observe(el)
    },
    unmounted(el: HTMLElement) {
      observer?.unobserve(el)
    },
  })
})
