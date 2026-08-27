// فقط کاربران وارد‌شده — بقیه به صفحه‌ی ورود با مقصد برمی‌گردند
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  if (!user.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
})
