import type { ColorPalette, PaletteCategory } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// پالت‌های رنگی آماده — گزینه‌های «جهت بصری» در ویزارد پروژه
// ─────────────────────────────────────────────────────────────

export const paletteCategories: PaletteCategory[] = [
  { id: 'editorial', label: 'ادیتوریال' },
  { id: 'minimal', label: 'مینیمال' },
  { id: 'luxury', label: 'لوکس' },
  { id: 'warm', label: 'گرم' },
  { id: 'corporate', label: 'اداری' },
  { id: 'playful', label: 'بازیگوش' },
  { id: 'neon', label: 'نئون' },
  { id: 'earthy', label: 'خاکی' },
  { id: 'monochrome', label: 'مونوکروم' },
]

export const colorPalettes: ColorPalette[] = [
  {
    id: 'paper-ink',
    name: 'کاغذ و جوهر',
    category: 'editorial',
    description: 'شبیه صفحه‌ی یک مجله‌ی خوب؛ سفید گرم، جوهر و یک ضربه‌ی کورال.',
    colors: ['#FAF6EF', '#F0E7D8', '#FF5A3C', '#211C15'],
  },
  {
    id: 'indigo-mag',
    name: 'مجله‌ی ایندیگو',
    category: 'editorial',
    description: 'کلاسیکِ مدرن؛ آبی نفتی روی کاغذ روشن با تأکید فرانسوی.',
    colors: ['#F3F3FA', '#E2E5F6', '#4B44DC', '#191734'],
  },
  {
    id: 'quiet-minimal',
    name: 'سکوت مینیمال',
    category: 'minimal',
    description: 'بدون سر و صدا. تن‌های نزدیک به هم و مرزی نرم.',
    colors: ['#F6F5F1', '#E8E6DF', '#A39C8B', '#26241F'],
  },
  {
    id: 'gallery-white',
    name: 'گالری سفید',
    category: 'minimal',
    description: 'مثل دیوار گالری؛ نور، فضای خالی و یک نقطه‌ی کانونی.',
    colors: ['#FBFBF9', '#EFEFEA', '#8C8578', '#1D1D1B'],
  },
  {
    id: 'velvet-night',
    name: 'شب مخملی',
    category: 'luxury',
    description: 'سرمه‌ای عمیق با طلایی مات؛ برای برندهایی که سکوتشان لوکس است.',
    colors: ['#171430', '#2B2650', '#C9A45C', '#F4EEE2'],
  },
  {
    id: 'cream-gold',
    name: 'کرم و طلایی',
    category: 'luxury',
    description: 'گرمای کلاسیک؛ کرم کاغذی با لمسه‌ی طلایی و قهوه‌ای تیره.',
    colors: ['#F8F3E9', '#EFE2C6', '#B98A2F', '#2A2415'],
  },
  {
    id: 'coral-sunset',
    name: 'غروب کورال',
    category: 'warm',
    description: 'پر از انرژی؛ نارنجی‌های آفتابی روی زمینه‌ی شیری.',
    colors: ['#FFF3EA', '#FFD9C4', '#FF5A3C', '#4A2519'],
  },
  {
    id: 'cafe-warm',
    name: 'بوی کافه',
    category: 'warm',
    description: 'قهوه، چوب و نور؛ گرم و صمیمی برای منو و بسته‌بندی.',
    colors: ['#F7F1E8', '#E8D5BC', '#8C5A3C', '#2E2016'],
  },
  {
    id: 'trust-blue',
    name: 'آبی مطمئن',
    category: 'corporate',
    description: 'قابل‌اتکا و شفاف؛ آبی سرد روی خاکستری روشن.',
    colors: ['#F2F5FA', '#DCE5F2', '#3B5BDB', '#16233B'],
  },
  {
    id: 'sage-office',
    name: 'اداری‌ی سبز',
    category: 'corporate',
    description: 'حس تازگی و مسئولیت؛ سبز ملایم با خاکستری سنگی.',
    colors: ['#F1F5F2', '#DCE9DF', '#3E7C5B', '#1B2A21'],
  },
  {
    id: 'candy-pop',
    name: 'آب‌نبات',
    category: 'playful',
    description: 'شیرین و پرسر و صدا؛ صورتی، فیروزه‌ای و بنفش.',
    colors: ['#FFF7FB', '#C9F2EA', '#FF6FA5', '#33202E'],
  },
  {
    id: 'lemon-soda',
    name: 'لیموناد',
    category: 'playful',
    description: 'ترش و تازه؛ زرد آفتابی با آبی چشم‌گیر.',
    colors: ['#FFFBEA', '#FFEBB0', '#FFB020', '#1F2A44'],
  },
  {
    id: 'neon-night',
    name: 'شب نئون',
    category: 'neon',
    description: 'تیره و درخشان؛ سبز نئونی و صورتی روی بنفش عمیق.',
    colors: ['#150A24', '#2E1A52', '#00E5A0', '#F3EFFF'],
  },
  {
    id: 'clay-field',
    name: 'کویر و گِل',
    category: 'earthy',
    description: 'خاک، آفتاب و سفال؛ تراکوتا با سبز زیتونی.',
    colors: ['#F2EDE3', '#D9C9AF', '#C4693B', '#33302A'],
  },
  {
    id: 'olive-grove',
    name: 'باغ زیتون',
    category: 'earthy',
    description: 'سبزهای گیاهی و کرم غلات؛ آرام و طبیعی.',
    colors: ['#F4F1E8', '#E3DDC8', '#7C8B5F', '#2E2E24'],
  },
  {
    id: 'charcoal',
    name: 'ذغال',
    category: 'monochrome',
    description: 'فقط سیاه و سفید؛ قدرت از کنتراست، نه رنگ.',
    colors: ['#F4F4F4', '#DEDEDE', '#5A5A5A', '#111111'],
  },
  {
    id: 'paper-grey',
    name: 'خاکستری خبری',
    category: 'monochrome',
    description: 'خونسرد و روزنامه‌ای؛ برای برندهای جدی و مینیمال.',
    colors: ['#FAFAF8', '#E7E7E4', '#9A9A96', '#232323'],
  },
]
