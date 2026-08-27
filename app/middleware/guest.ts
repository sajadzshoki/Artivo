// صفحات ورود/ثبت‌نام برای کاربر وارد‌شده معنا ندارند
export default defineNuxtRouteMiddleware(() => {
  const { user } = useAuth()
  if (user.value) {
    return navigateTo('/profile')
  }
})
