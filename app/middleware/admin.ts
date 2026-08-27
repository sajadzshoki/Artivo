// فقط مدیرها
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  if (!user.value) {
    return navigateTo({ path: '/auth/login', query: { redirect: to.fullPath } })
  }
  if (!user.value.roles.includes('admin')) {
    return navigateTo('/')
  }
})
