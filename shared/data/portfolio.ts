import type { Creative, PortfolioItem } from '#shared/types'
import { creatives } from './content'

// ─────────────────────────────────────────────────────────────
// نمونه‌کارها — تصاویر مستقیماً روی آرتیوو میزبانی می‌شوند
// (بدون نیاز به لینک خارجی). هر آیتم: کاور + گالری چند‌تصویری.
// NOTE: فعلاً از تصاویر فاز ۱ به‌عنوان کاور موقت استفاده شده؛
// در ادامه تصاویر اختصاصی هر پروژه تولید و جایگزین می‌شود.
// ─────────────────────────────────────────────────────────────

export const portfolioItems: PortfolioItem[] = [
  // ── سارا محمدی · پوستر ──
  {
    id: 'pf-sara-rahamusic',
    creativeId: 'sara-mohammadi',
    title: 'پوستر جشنواره موسیقی رها',
    description: 'پوستر اصلی و مجموعه سوشال سومین جشنواره موسیقی رها؛ تایپوگرافی فارسی دست‌ساز روی گرید رنگی کورال و جوهر.',
    category: 'poster',
    tags: ['تایپوگرافی', 'جشنواره', 'چاپ'],
    cover: '/images/portfolio/poster-music.jpg',
    images: ['/images/portfolio/poster-music.jpg'],
    year: '۱۴۰۴',
    client: 'بنیاد فرهنگی رودکی',
  },
  {
    id: 'pf-sara-film',
    creativeId: 'sara-mohammadi',
    title: 'پوستر سی‌امین جشنواره فیلم کوتاه',
    description: 'پوستر رسمی جشنواره با الهام از نور پروژکتور و فریم فیلم؛ چاپ افست در قطع A1 در ۳۰۰۰ نسخه.',
    category: 'poster',
    tags: ['سینما', 'چاپ افست'],
    cover: '/images/portfolio/poster-film.jpg',
    images: ['/images/portfolio/poster-film.jpg'],
    year: '۱۴۰۳',
  },
  {
    id: 'pf-sara-theatre',
    creativeId: 'sara-mohammadi',
    title: 'مجموعه پوسترهای تئاتر شهر',
    description: 'سری شش‌تایی پوستر فصل پاییز تئاتر شهر؛ زبان بصری مشترک با ترکیب متفاوت برای هر نمایش.',
    category: 'poster',
    tags: ['مجموعه', 'صحنه'],
    cover: '/images/hero.jpg',
    images: ['/images/hero.jpg', '/images/creative-poster.jpg'],
    year: '۱۴۰۳',
    client: 'تئاتر شهر',
  },

  // ── نگار رستمی · برند ──
  {
    id: 'pf-negar-cafe7',
    creativeId: 'negar-rostami',
    title: 'هویت بصری کافه هفتم',
    description: 'از نام و نشان تا منو، لیوان و بسته‌بندی؛ هویتی گرم برای کافه‌ای محله‌ای که می‌خواست «خانه‌ی دوم» باشد.',
    category: 'branding',
    tags: ['کافه', 'لوگو', 'ست اداری'],
    cover: '/images/portfolio/brand-cafe.jpg',
    images: ['/images/portfolio/brand-cafe.jpg', '/images/creative-brand.jpg'],
    year: '۱۴۰۴',
    client: 'کافه هفتم',
  },
  {
    id: 'pf-negar-noghte',
    creativeId: 'negar-rostami',
    title: 'ست اداری انتشارات نقطه',
    description: 'بازطراحی هویت ناشری مستقل؛ سرلوحه‌ی تایپوگرافیک، کارت، letterhead و مهر خشکی.',
    category: 'branding',
    tags: ['نشر', 'ست اداری'],
    cover: '/images/creative-brand.jpg',
    images: ['/images/creative-brand.jpg'],
    year: '۱۴۰۲',
  },

  // ── پرهام صالحی · UI ──
  {
    id: 'pf-parham-payvan',
    creativeId: 'parham-salehi',
    title: 'اپلیکیشن پرداخت پی‌وان',
    description: 'بازطراحی سفر پرداخت؛ کاهش سه‌مرحله‌ای مسیر و افزایش ۱۸ درصدی نرخ موفقیت تراکنش.',
    category: 'ui',
    tags: ['فین‌تک', 'موبایل'],
    cover: '/images/creative-ui.jpg',
    images: ['/images/creative-ui.jpg'],
    year: '۱۴۰۴',
    client: 'پی‌وان',
  },
  {
    id: 'pf-parham-safarnameh',
    creativeId: 'parham-salehi',
    title: 'اپلیکیشن سفرنامه',
    description: 'طراحی تجربه و رابط اپلیکیشن رزرو سفر؛ سیستم طراحی کامل با ۱۲۰ کامپوننت.',
    category: 'ui',
    tags: ['تراول', 'دیزاین سیستم'],
    cover: '/images/portfolio/ui-travel.jpg',
    images: ['/images/portfolio/ui-travel.jpg', '/images/creative-ui.jpg'],
    year: '۱۴۰۳',
    client: 'سفرنامه',
  },

  // ── درسا احمدی · بسته‌بندی ──
  {
    id: 'pf-dorsa-tea',
    creativeId: 'dorsa-ahmadi',
    title: 'بسته‌بندی چای کوهسار',
    description: 'خانواده‌ی ۵ محصولی چای؛ سیستم رنگ گیاهی، قوطی فلزی و جعبه‌ی مقوایی با لمسه‌ی سرد.',
    category: 'packaging',
    tags: ['چای', 'قوطی'],
    cover: '/images/portfolio/packaging-tea.jpg',
    images: ['/images/portfolio/packaging-tea.jpg', '/images/creative-packaging.jpg'],
    year: '۱۴۰۴',
    client: 'کوهسار',
  },
  {
    id: 'pf-dorsa-organic',
    creativeId: 'dorsa-ahmadi',
    title: 'خانواده محصول ارگانیک خورشید سبز',
    description: 'بسته‌بندی کرافت با چاپ سویا برای برند ارگانیک؛ طراحی برای دیده‌شدن در قفسه‌ی شلوغ ارگانیک‌فروشی‌ها.',
    category: 'packaging',
    tags: ['ارگانیک', 'کرافت'],
    cover: '/images/creative-packaging.jpg',
    images: ['/images/creative-packaging.jpg'],
    year: '۱۴۰۳',
  },

  // ── متین قنبری · منو ──
  {
    id: 'pf-matin-milano',
    creativeId: 'matin-ghanbari',
    title: 'منوی تی‌بت تراتوریا میلانو',
    description: 'منوی دوتایی رستوران ایتالیایی؛ خوانایی روی میز نور کم، با کاغذ کرافت و چاپ سیاه‌سفید.',
    category: 'menu',
    tags: ['رستوران', 'تی‌بت'],
    cover: '/images/creative-menu.jpg',
    images: ['/images/creative-menu.jpg'],
    year: '۱۴۰۴',
    client: 'تراتوریا میلانو',
  },
  {
    id: 'pf-matin-den',
    creativeId: 'matin-ghanbari',
    title: 'منوی تک‌برگه رستوران دن',
    description: 'منوی تک‌برگه با سیستم قیمت‌گذاری بصری؛ راهنمای چشم مهمان به سمت پرس‌های پرحاشیه.',
    category: 'menu',
    tags: ['تک‌برگه', 'قیمت‌گذاری'],
    cover: '/images/portfolio/menu-single.jpg',
    images: ['/images/portfolio/menu-single.jpg', '/images/creative-menu.jpg'],
    year: '۱۴۰۳',
  },

  // ── لیلا فرهمند · رتوش ──
  {
    id: 'pf-leila-beauty',
    creativeId: 'leila-farhmand',
    title: 'رتوش کمپین زیبایی گلرنگ',
    description: 'رتوش پوست طبیعی و یکدست‌سازی تن روی ۴۰ فریم کمپین؛ حفظ بافت واقعی پوست، حذف نویز رنگی.',
    category: 'photoEdit',
    tags: ['زیبایی', 'کمپین'],
    cover: '/images/portfolio/retouch-beauty.jpg',
    images: ['/images/portfolio/retouch-beauty.jpg'],
    year: '۱۴۰۴',
    client: 'گروه گلرنگ',
  },
  {
    id: 'pf-leila-editorial',
    creativeId: 'leila-farhmand',
    title: 'کالورگریدینگ مجموعه مد',
    description: 'کالورگریدینگ ادیتوریال مجموعه پاییز؛ هماهنگی کامل تن رنگی میان استودیو و لوکیشن.',
    category: 'photoEdit',
    tags: ['مد', 'کالورگریدینگ'],
    cover: '/images/spot-stairs.jpg',
    images: ['/images/spot-stairs.jpg', '/images/spot-rooftop.jpg'],
    year: '۱۴۰۳',
  },

  // ── امیرحسین کاظمی · عکاسی ──
  {
    id: 'pf-amir-portrait',
    creativeId: 'amir-kazemi',
    title: 'پرتره‌های ادیتوریال',
    description: 'سری پرتره استودیویی برای مجله سبک زندگی؛ نور سه‌نقطه‌ای کلاسیک با لهجه‌ی ملایم کورال.',
    category: 'portrait',
    tags: ['استودیو', 'ادیتوریال'],
    cover: '/images/spot-rooftop.jpg',
    images: ['/images/spot-rooftop.jpg', '/images/spot-stairs.jpg'],
    year: '۱۴۰۴',
    client: 'مجله زیبان',
  },
  {
    id: 'pf-amir-perfume',
    creativeId: 'amir-kazemi',
    title: 'عکاسی محصول عطر دنیز',
    description: 'کمپین محصول عطر با نور سخت و سایه‌های بلند؛ خروجی برای سایت و بنر کمپین نوروز.',
    category: 'product',
    tags: ['عطر', 'کمپین'],
    cover: '/images/portfolio/product-perfume.jpg',
    images: ['/images/portfolio/product-perfume.jpg'],
    year: '۱۴۰۴',
    client: 'دنیز پرفیوم',
  },
  {
    id: 'pf-amir-food',
    creativeId: 'amir-kazemi',
    title: 'عکاسی منوی کافه ماندا',
    description: 'عکاسی ۲۵ آیتم منو در یک روز کاری؛ نور طبیعی پنجره با بازتاب سفید برای بافت واقعی غذا.',
    category: 'product',
    tags: ['غذا', 'کافه'],
    cover: '/images/creative-menu.jpg',
    images: ['/images/creative-menu.jpg'],
    year: '۱۴۰۳',
    client: 'کافه ماندا',
  },

  // ── کیان مرادی · سوشال ──
  {
    id: 'pf-kian-senka',
    creativeId: 'kian-moradi',
    title: 'کمپین تابستانه نوشیدنی سنکا',
    description: '۱۲ پست و ۸ استوری کمپین تابستان؛ سیستم ماژولار که تولید هر اسلاید جدید را ۱۰ دقیقه‌ای می‌کند.',
    category: 'social',
    tags: ['کمپین', 'اینستاگرام'],
    cover: '/images/hero.jpg',
    images: ['/images/hero.jpg'],
    year: '۱۴۰۴',
    client: 'نوشیدنی سنکا',
  },
  {
    id: 'pf-kian-local',
    creativeId: 'kian-moradi',
    title: 'پوسترهای رویدادهای گیلان',
    description: 'سری پوستر رویدادهای فرهنگی شمال؛ رنگ‌های اشباع و ترکیب‌های ساده برای دیوارهای شهر.',
    category: 'poster',
    tags: ['رویداد', 'شهر'],
    cover: '/images/creative-poster.jpg',
    images: ['/images/creative-poster.jpg'],
    year: '۱۴۰۳',
  },

  // ── هلیا صابری · مراسم ──
  {
    id: 'pf-helia-wedding',
    creativeId: 'helia-saberi',
    title: 'عروسی در باغ انار',
    description: 'روایت کامل یک عروسی از صبح تا آخرین رقص؛ ۸۰۰ فریم تحویلی، آلبوم چاپی ۳۰×۳۰.',
    category: 'event',
    tags: ['عروسی', 'آلبوم'],
    cover: '/images/portfolio/wedding-garden.jpg',
    images: ['/images/portfolio/wedding-garden.jpg'],
    year: '۱۴۰۴',
  },
  {
    id: 'pf-helia-festival',
    creativeId: 'helia-saberi',
    title: 'جشنواره موسیقی رها — پشت صحنه',
    description: 'عکاسی گزارشی سه‌روزه‌ی جشنواره؛ از تست صدا تا لحظه‌ی آخرین کنسرت.',
    category: 'event',
    tags: ['کنسرت', 'گزارشی'],
    cover: '/images/spot-rooftop.jpg',
    images: ['/images/spot-rooftop.jpg'],
    year: '۱۴۰۴',
    client: 'بنیاد فرهنگی رودکی',
  },

  // ── آرش نیک‌نژاد · معماری ──
  {
    id: 'pf-arash-modern',
    creativeId: 'arash-niknejad',
    title: 'هندسه‌ی تهران معاصر',
    description: 'مجموعه‌ی عکاسی معماری ساختمان‌های اداری دهه‌ی اخیر؛ خطوط، تکرار و نور ساعت ۱۷.',
    category: 'architecture',
    tags: ['اداری', 'مینیمال'],
    cover: '/images/portfolio/architecture-modern.jpg',
    images: ['/images/portfolio/architecture-modern.jpg'],
    year: '۱۴۰۳',
  },
  {
    id: 'pf-arash-bazaar',
    creativeId: 'arash-niknejad',
    title: 'رنگ و نور بازار تهران',
    description: 'از مجموعه مستند «بازارهای ایران»؛ نور تاشوی حوض‌خانه‌ها و رنگ بارهای بازار بزرگ.',
    category: 'architecture',
    tags: ['مستند', 'شهری'],
    cover: '/images/spot-stairs.jpg',
    images: ['/images/spot-stairs.jpg'],
    year: '۱۴۰۲',
  },
  {
    id: 'pf-arash-rooftop',
    creativeId: 'arash-niknejad',
    title: 'تهران از بام',
    description: 'نمای شهری از بالای دربند در ساعت طلایی؛ بخشی از پروژه‌ی «شهرهای عمودی».',
    category: 'architecture',
    tags: ['نمای شهر', 'غروب'],
    cover: '/images/spot-rooftop.jpg',
    images: ['/images/spot-rooftop.jpg'],
    year: '۱۴۰۴',
  },
]

// ── Lookup helpers (در فاز بعد با API جایگزین می‌شود) ──

export function getPortfolioItem(id: string): PortfolioItem | undefined {
  return portfolioItems.find(p => p.id === id)
}

export function portfolioOf(creativeId: string): PortfolioItem[] {
  return portfolioItems.filter(p => p.creativeId === creativeId)
}

export function creativesById(): Map<string, Creative> {
  return new Map(creatives.map(c => [c.id, c]))
}
