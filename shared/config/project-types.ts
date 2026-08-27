import type { ProjectType, ProjectTypeId, SizeConfig } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// انواع پروژه + پریست‌های سایز/فرمت هر نوع
// افزودن نوع جدید = افزودن یک آیتم به این فایل (UI به‌صورت خودکار
// از روی کانفیگ رندر می‌شود).
// ─────────────────────────────────────────────────────────────

export const projectTypes: ProjectType[] = [
  { id: 'poster', label: 'پوستر', tagline: 'رویداد، جشنواره، دیواری', icon: 'image' },
  { id: 'social', label: 'طراحی سوشال', tagline: 'پست، استوری، کاور', icon: 'instagram' },
  { id: 'menu', label: 'منوی کافه و رستوران', tagline: 'تک‌برگه، تی‌بت، تخته‌منو', icon: 'coffee' },
  { id: 'ad', label: 'تبلیغات', tagline: 'بنر، استند، کمپین', icon: 'megaphone' },
  { id: 'logo', label: 'لوگو', tagline: 'نشان کسب‌وکار شما', icon: 'pen' },
  { id: 'branding', label: 'برندینگ', tagline: 'هویت بصری کامل', icon: 'layers' },
  { id: 'packaging', label: 'بسته‌بندی', tagline: 'جعبه، لیبل، دایلاین', icon: 'package' },
  { id: 'ui', label: 'رابط کاربری', tagline: 'اپلیکیشن و وب‌سایت', icon: 'smartphone' },
  { id: 'photoEdit', label: 'ادیت عکس', tagline: 'رتوش و کالورگریدینگ', icon: 'camera' },
  { id: 'other', label: 'سایر', tagline: 'هر ایده‌ی دیگری', icon: 'sparkles' },
]

export const projectTypeMap: Record<ProjectTypeId, ProjectType> = Object.fromEntries(
  projectTypes.map(t => [t.id, t]),
) as Record<ProjectTypeId, ProjectType>

export const sizeConfigs: Record<ProjectTypeId, SizeConfig> = {
  poster: {
    hasMedium: true,
    supportsCustom: true,
    presets: [
      { id: 'a5', label: 'A5', dims: '۱۴٫۸ × ۲۱', multiplier: 0.8, medium: 'print' },
      { id: 'a4', label: 'A4', dims: '۲۱ × ۲۹٫۷', multiplier: 1, medium: 'print' },
      { id: 'a3', label: 'A3', dims: '۲۹٫۷ × ۴۲', multiplier: 1.25, medium: 'print' },
      { id: 'a2', label: 'A2', dims: '۴۲ × ۵۹٫۴', multiplier: 1.6, medium: 'print' },
      { id: 'a1', label: 'A1', dims: '۵۹٫۴ × ۸۴٫۱', multiplier: 2, medium: 'print' },
      { id: 'story', label: 'استوری', dims: '۱۰۸۰ × ۱۹۲۰ پیکسل', multiplier: 1, medium: 'digital' },
      { id: 'sq', label: 'مربع', dims: '۱۰۸۰ × ۱۰۸۰ پیکسل', multiplier: 1, medium: 'digital' },
      { id: 'land', label: 'افقی', dims: '۱۹۲۰ × ۱۰۸۰ پیکسل', multiplier: 1.15, medium: 'digital' },
    ],
  },
  social: {
    hasMedium: false,
    supportsCustom: true,
    presets: [
      { id: 'post', label: 'پست', dims: '۱۰۸۰ × ۱۰۸۰ پیکسل', multiplier: 1 },
      { id: 'story', label: 'استوری و ریلز', dims: '۱۰۸۰ × ۱۹۲۰ پیکسل', multiplier: 1 },
      { id: 'carousel', label: 'کروسل ۵ اسلاید', multiplier: 1.8 },
      { id: 'cover', label: 'کاور پروفایل', dims: '۱۰۸۰ × ۱۳۵۰ پیکسل', multiplier: 1.35 },
    ],
  },
  menu: {
    hasMedium: false,
    supportsCustom: true,
    presets: [
      { id: 'single', label: 'تک‌برگه', dims: '۲۱ × ۲۹٫۷', multiplier: 1 },
      { id: 'bi', label: 'تی‌بت (دو لت)', dims: '۲۹٫۷ × ۴۲ تاشده', multiplier: 1.5 },
      { id: 'board', label: 'تخته‌منو', dims: '۳۰ × ۶۰', multiplier: 1.8 },
      { id: 'trifold', label: 'سه‌تاب', dims: '۲۱ × ۲۹٫۷ تاشده', multiplier: 1.7 },
    ],
  },
  ad: {
    hasMedium: true,
    supportsCustom: true,
    presets: [
      { id: 'banner', label: 'بنر وب', dims: '۱۹۲۰ × ۶۰۰ پیکسل', multiplier: 0.9, medium: 'digital' },
      { id: 'insta-ad', label: 'تبلیغ اینستاگرام', dims: '۱۰۸۰ × ۱۰۸۰ پیکسل', multiplier: 1, medium: 'digital' },
      { id: 'billboard', label: 'بیلبورد شهری', dims: '۳۰۰ × ۱۴۰ سانتی‌متر', multiplier: 2.4, medium: 'print' },
      { id: 'stand', label: 'استند رول‌آپ', dims: '۸۵ × ۲۰۰', multiplier: 1.5, medium: 'print' },
    ],
  },
  logo: {
    hasMedium: false,
    supportsCustom: false,
    presets: [
      { id: 'mark', label: 'فقط لوگو', dims: '۳ کانسپت + فایل نهایی', multiplier: 1 },
      { id: 'mark-guide', label: 'لوگو + راهنمای کاربرد', dims: '۳ کانسپت + مینی‌برندبوک', multiplier: 1.45 },
    ],
  },
  branding: {
    hasMedium: false,
    supportsCustom: false,
    presets: [
      { id: 'starter', label: 'پایه', dims: 'لوگو + ست اداری', multiplier: 1 },
      { id: 'standard', label: 'استاندارد', dims: '+ الگو و کاور شبکه‌ها', multiplier: 1.6 },
      { id: 'full', label: 'کامل', dims: '+ برندبوک و بسته‌بندی', multiplier: 2.4 },
    ],
  },
  packaging: {
    hasMedium: false,
    supportsCustom: true,
    presets: [
      { id: 'single', label: 'تک محصول', dims: 'یک دی‌لاین + ماکاپ', multiplier: 1 },
      { id: 'family', label: 'خانواده محصول', dims: 'تا ۳ محصول', multiplier: 2.2 },
      { id: 'label', label: 'فقط لیبل', dims: 'طراحی لیبل', multiplier: 0.7 },
    ],
  },
  ui: {
    hasMedium: false,
    supportsCustom: false,
    presets: [
      { id: 'screen', label: 'تک‌صفحه', dims: 'یک اسکرین کلیدی', multiplier: 0.6 },
      { id: 'flow', label: '۳ تا ۵ صفحه', dims: 'یک فلوی کامل', multiplier: 1 },
      { id: 'web', label: 'وب‌سایت کامل', dims: 'تا ۱۰ صفحه', multiplier: 2.2 },
    ],
  },
  photoEdit: {
    hasMedium: false,
    supportsCustom: false,
    presets: [
      { id: 'one', label: 'تک‌عکس', dims: 'رتوش کامل', multiplier: 1 },
      { id: 'pack10', label: 'پکیج ۱۰ عکس', multiplier: 4 },
      { id: 'pack50', label: 'پکیج ۵۰ عکس', multiplier: 8 },
    ],
  },
  other: {
    hasMedium: true,
    supportsCustom: true,
    presets: [
      { id: 'standard', label: 'استاندارد', dims: 'طبق بریف توضیح داده می‌شود', multiplier: 1 },
    ],
  },
}
