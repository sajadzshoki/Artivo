export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },

  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  // ── تنظیمات زمان اجرا ──
  // کلیدها فقط از متغیرهای محیطی می‌آیند (.env) — هرگز هاردکد نمی‌شوند.
  // NUXT_NESHAN_API_KEY          → فقط سمت سرور (REST API نشان)
  // NUXT_PUBLIC_NESHAN_MAP_KEY   → کلید وب SDK نقشه
  // NUXT_KAVENEGAR_API_KEY       → فقط سمت سرور (ارسال OTP در production)
  // NUXT_KAVENEGAR_OTP_TEMPLATE  → نام قالب تأییدشده در کاوه‌نگار
  // NUXT_KAVENEGAR_SENDER        → اختیاری (خط ارسال)
  // NUXT_PUBLIC_AUTH_DEV_MODE    → نمایش راهنمای حالت توسعه (OTP 1111)
  runtimeConfig: {
    neshanApiKey: '',
    kavenegarApiKey: '',
    kavenegarOtpTemplate: '',
    kavenegarSender: '',
    public: {
      neshanMapKey: '',
      neshanProvider: 'neshan',
      neshanSdkUrl: 'https://static.neshan.org/maps/neshan-map-v1.1.0.js',
      neshanSdkCss: 'https://static.neshan.org/maps/neshan-map-v1.1.0.css',
      // ⚠️ فقط توسعه — با nuxt build خودکار false می‌شود
      authDevMode: process.env.NODE_ENV !== 'production',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' },
      title: 'آرتیوو — استودیوی آنلاین طراحی و عکاسی',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'آرتیوو پلتفرم خلاقیت است؛ پروژه‌ی طراحی و عکاسی‌ات را در چند دقیقه بریف کن و به بهترین طراحان و عکاسان وصل شو.' },
        { name: 'theme-color', content: '#FAF6EF' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100..900&family=Lalezar&family=Markazi+Text:wght@400..700&family=Noto+Naskh+Arabic:wght@400..700&family=Rubik:wght@300..700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400..700&family=Space+Grotesk:wght@400..700&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=DM+Sans:opsz,wght@9..40,400..700&display=swap',
        },
      ],
    },
  },
})
