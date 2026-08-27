import type { FontPairing } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// فونت‌پیرینگ‌های آماده (فارسی + لاتین)
// افزودن ترکیب جدید = یک آیتم اینجا؛ خانواده‌ی فونت باید در
// nuxt.config (لینک Google Fonts) بارگذاری شده باشد.
// ─────────────────────────────────────────────────────────────

export const fontPairings: FontPairing[] = [
  {
    id: 'vazirmatn-inter',
    name: 'وزیرمتن × اینتر',
    latinName: 'Vazirmatn × Inter',
    tone: 'مدرن',
    description: 'خوانا و امروزی؛ انتخاب امن برای استارتاپ‌ها، اپلیکیشن و رابط کاربری.',
    headingFamily: "'Vazirmatn', sans-serif",
    headingWeight: 800,
    bodyFamily: "'Vazirmatn', sans-serif",
    latinFamily: "'Inter', sans-serif",
  },
  {
    id: 'markazi-fraunces',
    name: 'مرکزی × فرانسس',
    latinName: 'Markazi × Fraunces',
    tone: 'ادیتوریال',
    description: 'حس مجله‌ای با سرخط‌های کشیده و سریف نمایشی؛ برای برندهای قصه‌گو.',
    headingFamily: "'Markazi Text', serif",
    headingWeight: 700,
    bodyFamily: "'Vazirmatn', sans-serif",
    latinFamily: "'Fraunces', serif",
  },
  {
    id: 'lalezar-grotesk',
    name: 'لاله‌زار × اسپیس‌گروتسک',
    latinName: 'Lalezar × Space Grotesk',
    tone: 'پرانرژی',
    description: 'سرخط‌های چاق و پرحال‌وحوصله؛ عالی برای پوستر رویداد و کمپین.',
    headingFamily: "'Lalezar', display",
    headingWeight: 400,
    bodyFamily: "'Vazirmatn', sans-serif",
    latinFamily: "'Space Grotesk', sans-serif",
  },
  {
    id: 'naskh-playfair',
    name: 'نسخ × پلی‌فیر',
    latinName: 'Naskh × Playfair',
    tone: 'لوکس',
    description: 'کلاسیک و باشکوه؛ برای برندهای سنتی، عطر، جواهر و رستوران.',
    headingFamily: "'Noto Naskh Arabic', serif",
    headingWeight: 700,
    bodyFamily: "'Vazirmatn', sans-serif",
    latinFamily: "'Playfair Display', serif",
  },
  {
    id: 'vazirmatn-grotesk',
    name: 'وزیرمتن × اسپیس‌گروتسک',
    latinName: 'Vazirmatn × Space Grotesk',
    tone: 'مینیمال',
    description: 'تمیز و فنی؛ فاصله‌ها مهم‌تر از تزئینات است.',
    headingFamily: "'Vazirmatn', sans-serif",
    headingWeight: 600,
    bodyFamily: "'Vazirmatn', sans-serif",
    latinFamily: "'Space Grotesk', sans-serif",
  },
  {
    id: 'rubik-dmsans',
    name: 'روبیک × دی‌ام‌سنس',
    latinName: 'Rubik × DM Sans',
    tone: 'دوستانه',
    description: 'گوشه‌های گرد و لحن صمیمی؛ برای برندهای مصرفی و کوچک.',
    headingFamily: "'Rubik', sans-serif",
    headingWeight: 700,
    bodyFamily: "'Rubik', sans-serif",
    latinFamily: "'DM Sans', sans-serif",
  },
]
