// ─────────────────────────────────────────────────────────────
// رجیستری کالکشن‌های ادمین — یک تعریف، هم اعتبارسنجی سرور هم UI
// mode:
//   'store'    → داده‌ی بومی سرور (CRUD کامل)
//   'override' → وصله روی داده‌ی استاتیک (ویرایش/مخفی/حذف)
// field.type: text | number | textarea | boolean | tags | select | colors | money
// ─────────────────────────────────────────────────────────────

export interface AdminFieldDef {
  key: string
  label: string
  type: 'text' | 'number' | 'textarea' | 'boolean' | 'tags' | 'select' | 'colors' | 'money'
  options?: { value: string; label: string }[]
  hint?: string
  required?: boolean
  /** برای money: حداقل معقول */
  min?: number
  max?: number
  step?: number
}

export interface AdminCollectionDef {
  id: string
  label: string
  icon: string
  description: string
  mode: 'store' | 'override'
  canCreate: boolean
  canDelete: boolean
  /** عنوان نمایشی هر آیتم از روی این فیلد */
  titleKey: string
  fields: AdminFieldDef[]
}

export const adminCollections: AdminCollectionDef[] = [
  {
    id: 'font-packs',
    label: 'پک‌های فونت',
    icon: 'type',
    description: 'ترکیب‌های تایپوگرافی گام چهارم ویزارد پروژه.',
    mode: 'store',
    canCreate: true,
    canDelete: true,
    titleKey: 'name',
    fields: [
      { key: 'name', label: 'نام ترکیب', type: 'text', required: true },
      { key: 'latinName', label: 'نام لاتین', type: 'text' },
      { key: 'tone', label: 'حال‌وهوا', type: 'text', hint: 'مثلاً مدرن، ادیتوریال' },
      { key: 'description', label: 'توضیح', type: 'textarea' },
      { key: 'headingFamily', label: 'فونت تیتر (CSS family)', type: 'text', hint: 'باید در nuxt.config لود شده باشد' },
      { key: 'bodyFamily', label: 'فونت متن (CSS family)', type: 'text' },
    ],
  },
  {
    id: 'color-palettes',
    label: 'پالت‌های رنگی',
    icon: 'palette',
    description: 'پالت‌های گام «جهت بصری» ویزارد پروژه.',
    mode: 'store',
    canCreate: true,
    canDelete: true,
    titleKey: 'name',
    fields: [
      { key: 'name', label: 'نام پالت', type: 'text', required: true },
      { key: 'category', label: 'دسته', type: 'select', options: [
        { value: 'editorial', label: 'ادیتوریال' },
        { value: 'minimal', label: 'مینیمال' },
        { value: 'luxury', label: 'لوکس' },
        { value: 'warm', label: 'گرم' },
        { value: 'corporate', label: 'اداری' },
        { value: 'playful', label: 'بازیگوش' },
        { value: 'neon', label: 'نئون' },
        { value: 'earthy', label: 'خاکی' },
        { value: 'monochrome', label: 'مونوکروم' },
      ] },
      { key: 'description', label: 'توضیح', type: 'textarea' },
      { key: 'colors', label: 'رنگ‌ها (Hex)', type: 'colors', hint: '۴ تا ۶ رنگ، اولی پس‌زمینه' },
    ],
  },
  {
    id: 'project-categories',
    label: 'دسته‌های پروژه',
    icon: 'layers',
    description: 'تاکسونومی مشترک سرویس‌ها، نمونه‌کارها و فیلتر خلاق‌ها.',
    mode: 'store',
    canCreate: true,
    canDelete: false,
    titleKey: 'label',
    fields: [
      { key: 'id', label: 'شناسه (لاتین)', type: 'text', required: true, hint: 'فقط در ساخت — یکتا' },
      { key: 'label', label: 'برچسب فارسی', type: 'text', required: true },
      { key: 'icon', label: 'آیکون', type: 'select', options: [
        { value: 'image', label: 'تصویر' },
        { value: 'pen', label: 'قلم' },
        { value: 'instagram', label: 'اینستاگرام' },
        { value: 'layers', label: 'لایه‌ها' },
        { value: 'package', label: 'بسته' },
        { value: 'coffee', label: 'کافه' },
        { value: 'smartphone', label: 'موبایل' },
        { value: 'sliders', label: 'اسلایدرها' },
        { value: 'camera', label: 'دوربین' },
        { value: 'aperture', label: 'دیافراگم' },
        { value: 'shape', label: 'فرم' },
      ] },
    ],
  },
  {
    id: 'creative-categories',
    label: 'دسته‌های خلاق',
    icon: 'users',
    description: 'انواع خلاق (طراح/عکاس) و برچسب آن‌ها در فیلترها.',
    mode: 'store',
    canCreate: false,
    canDelete: false,
    titleKey: 'label',
    fields: [
      { key: 'label', label: 'برچسب', type: 'text', required: true },
      { key: 'roleLabel', label: 'عنوان نقش', type: 'text', hint: 'مثلاً «طراح گرافیک ارشد»' },
    ],
  },
  {
    id: 'photography-categories',
    label: 'دسته‌های عکاسی',
    icon: 'camera',
    description: 'فیلترهای نوع عکاسی در صفحه‌ی لوکیشن‌ها.',
    mode: 'store',
    canCreate: true,
    canDelete: false,
    titleKey: 'label',
    fields: [
      { key: 'id', label: 'شناسه (لاتین)', type: 'text', required: true, hint: 'فقط در ساخت — یکتا' },
      { key: 'label', label: 'برچسب فارسی', type: 'text', required: true },
      { key: 'icon', label: 'آیکون', type: 'select', options: [
        { value: 'user', label: 'پرتره' },
        { value: 'map', label: 'منظره' },
        { value: 'compass', label: 'خیابانی' },
        { value: 'layers', label: 'معماری' },
        { value: 'sparkles', label: 'طبیعت' },
        { value: 'clock', label: 'غروب' },
        { value: 'eye', label: 'شب' },
        { value: 'package', label: 'محصول' },
        { value: 'palette', label: 'مد' },
        { value: 'heart', label: 'عروسی' },
      ] },
    ],
  },
  {
    id: 'services',
    label: 'سرویس‌ها',
    icon: 'bookmark',
    description: 'سرویس‌های خلاق‌ها؛ ویرایش قیمت، مخفی‌کردن یا افزودن سرویس تازه.',
    mode: 'override',
    canCreate: true,
    canDelete: true,
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'عنوان', type: 'text', required: true },
      { key: 'description', label: 'توضیح', type: 'textarea' },
      { key: 'startingPrice', label: 'قیمت شروع (تومان)', type: 'money', min: 0, required: true },
      { key: 'deliveryDays', label: 'مهلت تحویل (روز)', type: 'number', min: 1, max: 120 },
      { key: 'revisions', label: 'نوبت اصلاحیه', type: 'number', min: 0, max: 10 },
      { key: 'visible', label: 'نمایش در سایت', type: 'boolean' },
    ],
  },
  {
    id: 'users',
    label: 'کاربران',
    icon: 'user',
    description: 'نقش‌ها، وضعیت فعال بودن و اطلاعات پایه‌ی کاربران.',
    mode: 'store',
    canCreate: false,
    canDelete: true,
    titleKey: 'name',
    fields: [
      { key: 'name', label: 'نام', type: 'text', required: true },
      { key: 'email', label: 'ایمیل', type: 'text' },
      { key: 'mobile', label: 'موبایل', type: 'text' },
      { key: 'roleClient', label: 'کارفرما', type: 'boolean' },
      { key: 'roleCreative', label: 'خلاق', type: 'boolean' },
      { key: 'roleAdmin', label: 'مدیر', type: 'boolean' },
      { key: 'active', label: 'حساب فعال', type: 'boolean' },
    ],
  },
  {
    id: 'jobs',
    label: 'پروژه‌ها',
    icon: 'briefcase',
    description: 'آگهی‌های مارکت‌پلیس؛ توقف/بازگشایی، فوری و حذف.',
    mode: 'override',
    canCreate: false,
    canDelete: true,
    titleKey: 'title',
    fields: [
      { key: 'title', label: 'عنوان', type: 'text', required: true },
      { key: 'status', label: 'وضعیت', type: 'select', options: [
        { value: 'open', label: 'باز' },
        { value: 'paused', label: 'متوقف' },
        { value: 'closed', label: 'بسته' },
      ] },
      { key: 'urgent', label: 'فوری', type: 'boolean' },
    ],
  },
  {
    id: 'spots',
    label: 'لوکیشن‌های عکاسی',
    icon: 'map-pin',
    description: 'لوکیشن‌ها؛ مخفی/ویژه‌کردن، ویرایش نام و بهترین زمان.',
    mode: 'override',
    canCreate: false,
    canDelete: true,
    titleKey: 'name',
    fields: [
      { key: 'name', label: 'نام', type: 'text', required: true },
      { key: 'city', label: 'شهر', type: 'text' },
      { key: 'bestTime', label: 'بهترین زمان', type: 'text' },
      { key: 'hidden', label: 'مخفی از فهرست', type: 'boolean' },
      { key: 'featured', label: 'ویژه', type: 'boolean' },
    ],
  },
]

export function getAdminCollection(id: string): AdminCollectionDef | undefined {
  return adminCollections.find(c => c.id === id)
}
