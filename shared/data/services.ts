import type { CreativeService } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// سرویس‌های خلاق‌ها — خدمات قابل‌سفارش با قیمت شروع مشخص
// قیمت‌ها «شروع از» است و برآورد نهایی در ویزارد محاسبه می‌شود.
// ─────────────────────────────────────────────────────────────

export const creativeServices: CreativeService[] = [
  // ── سارا محمدی ──
  {
    id: 'sv-sara-poster',
    creativeId: 'sara-mohammadi',
    title: 'طراحی پوستر رویداد',
    description: 'پوستر رویداد، جشنواره یا نمایشگاه شما با تایپوگرافی فارسی دست‌ساز؛ از ایده تا فایل آماده‌ی چاپ در قطع دلخواه.',
    category: 'poster',
    startingPrice: 2_500_000,
    deliveryDays: 5,
    revisions: 3,
    features: [
      '۳ کانسپت اولیه برای انتخاب',
      'فایل نهایی در دو نسخه‌ی چاپ و دیجیتال',
      'آماده‌سازی CMYK و خط برش',
      'برش‌های استوری و پست به‌صورت رایگان',
    ],
    portfolioItemIds: ['pf-sara-rahamusic', 'pf-sara-film', 'pf-sara-theatre'],
    popular: true,
  },
  {
    id: 'sv-sara-cover',
    creativeId: 'sara-mohammadi',
    title: 'طراحی کاور موسیقی و پادکست',
    description: 'کاور تک‌آهنگ یا آلبوم با زبان بصری مخصوص فضای موسیقی؛ قابل‌استفاده در اسپاتیفای، کاست‌باکس و یوتیوب.',
    category: 'poster',
    startingPrice: 1_800_000,
    deliveryDays: 4,
    revisions: 2,
    features: [
      '۲ کانسپت + یک دور اصلاحیه‌ی اضافه',
      'خروجی مربعی ۳۰۰۰px و بنر یوتیوب',
    ],
    portfolioItemIds: ['pf-sara-rahamusic'],
  },

  // ── نگار رستمی ──
  {
    id: 'sv-negar-branding',
    creativeId: 'negar-rostami',
    title: 'هویت بصری کامل برند',
    description: 'از استراتژی تا برندبوک؛ پکیج کامل راه‌اندازی هویت برای کسب‌وکارهای تازه‌تأسیس یا ری‌برندینگ.',
    category: 'branding',
    startingPrice: 12_000_000,
    deliveryDays: 21,
    revisions: 4,
    features: [
      'کارگاه استراتژی و جایگاه‌یابی برند',
      'لوگو + سیستم رنگ و تایپوگرافی',
      'ست اداری و کاور شبکه‌های اجتماعی',
      'برندبوک ۲۰ صفحه‌ای',
    ],
    portfolioItemIds: ['pf-negar-cafe7', 'pf-negar-noghte'],
    popular: true,
  },
  {
    id: 'sv-negar-logo',
    creativeId: 'negar-rostami',
    title: 'طراحی لوگو',
    description: 'لوگوی حرفه‌ای با ۳ مسیر متفاوت؛ تحویل فایل باز و نسخه‌های سیاه‌سفید و تک‌رنگ.',
    category: 'logo',
    startingPrice: 6_000_000,
    deliveryDays: 10,
    revisions: 3,
    features: [
      '۳ کانسپت متفاوت',
      'فایل باز (AI + SVG + PNG)',
      'مینی‌راهنمای کاربرد لوگو',
    ],
    portfolioItemIds: ['pf-negar-cafe7'],
  },

  // ── پرهام صالحی ──
  {
    id: 'sv-parham-app',
    creativeId: 'parham-salehi',
    title: 'طراحی رابط کاربری اپلیکیشن',
    description: 'طراحی UI/UX کامل اپلیکیشن موبایل؛ از فلوی کاربری و وایرفریم تا رابط نهایی و پروتوتایپ قابل‌تست.',
    category: 'ui',
    startingPrice: 18_000_000,
    deliveryDays: 30,
    revisions: 5,
    features: [
      'کشف و فلوی کاربری کامل',
      'طراحی تا ۱۰ صفحه‌ی کلیدی',
      'دیزاین سیستم پایه + پروتوتایپ Figma',
      'همراهی تا اولین تست کاربر',
    ],
    portfolioItemIds: ['pf-parham-payvan', 'pf-parham-safarnameh'],
    popular: true,
  },
  {
    id: 'sv-parham-landing',
    creativeId: 'parham-salehi',
    title: 'طراحی لندینگ‌پیج محصول',
    description: 'لندینگ با تمرکز بر تبدیل؛ ساختار متقاعدکننده، ریسپانسیو کامل و آماده‌ی تحویل به تیم فرانت.',
    category: 'ui',
    startingPrice: 8_000_000,
    deliveryDays: 7,
    revisions: 3,
    features: ['دسکتاپ + موبایل', 'نسخه‌ی A/B برای بخش قهرمان', 'فایل Figma مرتب'],
    portfolioItemIds: ['pf-parham-payvan'],
  },

  // ── درسا احمدی ──
  {
    id: 'sv-dorsa-packaging',
    creativeId: 'dorsa-ahmadi',
    title: 'طراحی بسته‌بندی محصول',
    description: 'بسته‌بندی کامل از دایلاین تا فایل چاپ؛ با مشاوره‌ی متریال و هماهنگی با چاپخانه.',
    category: 'packaging',
    startingPrice: 9_000_000,
    deliveryDays: 18,
    revisions: 4,
    features: [
      'دایلاین دقیق + ماکاپ رندر شده',
      'مشاوره‌ی متریال و جنس چاپ',
      'پیگیری اصلاح فایل با چاپخانه',
    ],
    portfolioItemIds: ['pf-dorsa-tea', 'pf-dorsa-organic'],
    popular: true,
  },

  // ── متین قنبری ──
  {
    id: 'sv-matin-menu',
    creativeId: 'matin-ghanbari',
    title: 'طراحی منوی کافه و رستوران',
    description: 'منویی که می‌فروشد؛ چیدمان روانشناسانه، خوانایی روی میز و فایل آماده‌ی چاپ در هر قطعی.',
    category: 'menu',
    startingPrice: 1_800_000,
    deliveryDays: 5,
    revisions: 3,
    features: [
      'مشاوره رایگان قیمت‌گذاری منو',
      'طراحی تک‌برگه / تی‌بت / تخته‌منو',
      'به‌روزرسانی فصلی با تخفیف همیشگی',
    ],
    portfolioItemIds: ['pf-matin-milano', 'pf-matin-den'],
  },

  // ── لیلا فرهمند ──
  {
    id: 'sv-leila-retouch',
    creativeId: 'leila-farhmand',
    title: 'رتوش تجاری عکس',
    description: 'رتوش پوست طبیعی و اصلاح جزئیات برای کمپین‌ها؛ تحویل ۷۲ ساعته برای هر بسته‌ی ۱۰ فریمی.',
    category: 'photoEdit',
    startingPrice: 800_000,
    deliveryDays: 3,
    revisions: 2,
    features: [
      'رتوش پوست با حفظ بافت',
      'یکدست‌سازی تن و ترمیم رنگ',
      'تحویل TIFF + JPG با فرمت دلخواه',
    ],
    portfolioItemIds: ['pf-leila-beauty'],
    popular: true,
  },
  {
    id: 'sv-leila-color',
    creativeId: 'leila-farhmand',
    title: 'کالورگریدینگ مجموعه عکس',
    description: 'پرست شخصی‌سازی‌شده برای برند یا عکاس؛ اعمال روی کل مجموعه با یکدستی کامل.',
    category: 'photoEdit',
    startingPrice: 600_000,
    deliveryDays: 2,
    revisions: 2,
    features: ['پرست اختصاصی', 'اعمال روی بسته‌ی ۵۰ فریمی', 'فایل XMP قابل‌استفاده مجدد'],
    portfolioItemIds: ['pf-leila-editorial'],
  },

  // ── امیرحسین کاظمی ──
  {
    id: 'sv-amir-portrait',
    creativeId: 'amir-kazemi',
    title: 'جلسه‌ی پرتره استودیویی',
    description: 'جلسه‌ی یک‌ساعته در استودیوی تهران؛ مناسب پروفایل کاری، مجله و شخصی‌برندینگ.',
    category: 'portrait',
    startingPrice: 4_000_000,
    deliveryDays: 7,
    revisions: 2,
    features: [
      '۱ ساعت عکاسی + ۲ لباس',
      '۱۰ فریم ویرایش‌شده‌ی نهایی',
      'همراهی در ژست و انتخاب نور',
    ],
    portfolioItemIds: ['pf-amir-portrait'],
  },
  {
    id: 'sv-amir-product',
    creativeId: 'amir-kazemi',
    title: 'عکاسی محصول برای فروشگاه آنلاین',
    description: 'عکاسی محصول روی زمینه‌ی سفید و لایف‌استایل؛ خروجی آماده‌ی دیجی‌کالا و سایت.',
    category: 'product',
    startingPrice: 5_000_000,
    deliveryDays: 5,
    revisions: 2,
    features: [
      'تا ۱۰ محصول در هر جلسه',
      'زمینه سفید + ۲ صحنه‌ی لایف‌استایل',
      '۵ فریم ویرایش پیشرفته',
    ],
    portfolioItemIds: ['pf-amir-perfume', 'pf-amir-food'],
  },

  // ── کیان مرادی ──
  {
    id: 'sv-kian-social',
    creativeId: 'kian-moradi',
    title: 'پکیج پست و استوری اینستاگرام',
    description: '۱۲ پست + ۸ استوری با سیستم بصری یکدست؛ برای برندهایی که می‌خواهند فیدشان مثل مجله شود.',
    category: 'social',
    startingPrice: 4_500_000,
    deliveryDays: 7,
    revisions: 3,
    features: [
      'سیستم ماژولار قابل‌توسعه',
      'تقویم محتوایی یک‌ماهه',
      'فایل‌های خروجی بهینه‌ی اینستاگرام',
    ],
    portfolioItemIds: ['pf-kian-senka'],
  },

  // ── هلیا صابری ──
  {
    id: 'sv-helia-wedding',
    creativeId: 'helia-saberi',
    title: 'عکاسی عروسی',
    description: 'روایت کامل روز عروسی از آرایشگاه تا آخرین رقص؛ بدون چیدن صحنه‌های ساختگی.',
    category: 'event',
    startingPrice: 25_000_000,
    deliveryDays: 21,
    revisions: 3,
    features: [
      '۸ ساعت پوشش کامل مراسم',
      '۸۰۰+ فریم ویرایش‌شده',
      'آلبوم چاپی ۳۰×۳۰ با جلد کتانی',
      'گالری آنلاین خصوصی برای خانواده',
    ],
    portfolioItemIds: ['pf-helia-wedding'],
    popular: true,
  },
  {
    id: 'sv-helia-event',
    creativeId: 'helia-saberi',
    title: 'عکاسی مراسم و رویداد سازمانی',
    description: 'کنفرانس، افتتاحیه و جشنواره؛ تحویل سریع فریم‌های انتخابی برای پوشش خبری همان روز.',
    category: 'event',
    startingPrice: 12_000_000,
    deliveryDays: 5,
    revisions: 2,
    features: [
      '۴ ساعت پوشش + ۲۰۰ فریم',
      'تحویل ۱۵ فریم منتخب در همان روز',
      'خروجی آماده‌ی رسانه‌ها',
    ],
    portfolioItemIds: ['pf-helia-festival'],
  },

  // ── آرش نیک‌نژاد ──
  {
    id: 'sv-arash-architecture',
    creativeId: 'arash-niknejad',
    title: 'عکاسی معماری و دکوراسیون داخلی',
    description: 'عکاسی حرفه‌ای ساختمان، هتل و کافه برای معماران و کسب‌وکارها؛ با نورپردازی مکمل در صورت نیاز.',
    category: 'architecture',
    startingPrice: 5_000_000,
    deliveryDays: 7,
    revisions: 2,
    features: [
      'جلسه در بهترین ساعت نور فضا',
      '۱۵ فریم نهایی اصلاح‌شده',
      'تصحیح پرسپکتیو و خطوط عمودی',
    ],
    portfolioItemIds: ['pf-arash-modern', 'pf-arash-rooftop'],
  },
  {
    id: 'sv-arash-space',
    creativeId: 'arash-niknejad',
    title: 'عکاسی فضای کافه و رستوران',
    description: 'مجموعه‌ی کامل فضای داخلی برای منو، گوگل‌مپ و شبکه‌های اجتماعی؛ نیم‌روز عکاسی.',
    category: 'architecture',
    startingPrice: 7_500_000,
    deliveryDays: 5,
    revisions: 2,
    features: ['نیم‌روز عکاسی', '۲۵ فریم نهایی', 'خروجی مخصوص نقشه‌ها و شبکه‌ها'],
    portfolioItemIds: ['pf-arash-bazaar'],
  },
]

// ── Lookup helpers ──

export function getService(id: string): CreativeService | undefined {
  return creativeServices.find(s => s.id === id)
}

export function servicesOf(creativeId: string): CreativeService[] {
  return creativeServices.filter(s => s.creativeId === creativeId)
}
