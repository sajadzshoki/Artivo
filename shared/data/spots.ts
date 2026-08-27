import type { PhotoSpot, SpotPhoto } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// لوکیشن‌های عکاسی — با مختصات واقعی تقریبی برای نقشه‌ی نشان
// عکس‌های کاربران و امتیازهای آن‌ها در Phase 4 به‌صورت محلی
// (localStorage) به این دیتا اضافه می‌شود؛ در فاز بعد از API.
// ─────────────────────────────────────────────────────────────

const p = (id: string, url: string, author: string): SpotPhoto => ({ id, url, author })

export const photoSpots: PhotoSpot[] = [
  {
    id: 'spot-kandovan-stairs',
    name: 'پله‌های رنگی کندوان',
    city: 'اصفهان · جلفا',
    address: 'اصفهان، جلفا، کوچه‌های پلکان‌دار محله‌ی کندوان',
    description:
      'پله‌های رنگ‌شده‌ی محله‌ی ارمنی‌نشین جلفا، با دیوارهای گِلی و سایه‌ی درخت‌های توت؛ ترکیبی از بافت قدیم و رنگ‌های شاد محله که هر فریم را شبیه یک نقاشی می‌کند.',
    tip: 'نیم ساعت قبل از غروب برسید تا نور از پشت تپه‌ها روی پله‌ها بارد؛ لنز ۳۵ میلی‌متری کافی است. صبح‌ها محله خلوت‌تر است.',
    bestTime: 'ساعت طلایی غروب',
    location: { lat: 32.6339, lng: 51.6620 },
    categories: ['street', 'architecture', 'portrait'],
    tags: ['پلکان رنگی', 'بافت قدیم', 'دیوار گِلی'],
    photos: [
      p('sp1-1', '/images/spot-stairs.jpg', 'تیم آرتیوو'),
      p('sp1-2', '/images/portfolio/poster-music.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.8,
    ratingsCount: 64,
    accent: '#FF5A3C',
    image: '/images/spot-stairs.jpg',
    featured: true,
  },
  {
    id: 'spot-naseri-cafe',
    name: 'کافه‌کتاب ناصری',
    city: 'تهران · کریمخان',
    address: 'تهران، خیابان کریمخان زند، کافه‌کتاب ناصری',
    description:
      'قفسه‌های چوبی سرِ‌تا‌سقف، نور جنوبی از پنجره‌ی بزرگ و بوی قهوه؛ برای عکاسی دکور داخلی، پرتره‌ی محیطی و عکس‌های «لایف‌استایل کتاب‌خوان» بهترین نقطه‌ی مرکز تهران است.',
    tip: 'ساعت ۹ تا ۱۱ صبح نور از پنجره‌ی جنوبی می‌تابد و کافه خلوت است؛ با مدیر صحبت کنید تا اجازه‌ی سه‌پایه بگیرید.',
    bestTime: 'صبح زود',
    location: { lat: 35.7221, lng: 51.4126 },
    categories: ['portrait', 'product'],
    tags: ['دکور داخلی', 'کتاب', 'نور پنجره'],
    photos: [
      p('sp2-1', '/images/spot-cafe.jpg', 'تیم آرتیوو'),
      p('sp2-2', '/images/portfolio/food-cafe.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.6,
    ratingsCount: 41,
    accent: '#8C5A3C',
    image: '/images/spot-cafe.jpg',
    featured: true,
  },
  {
    id: 'spot-darband-bam',
    name: 'بام‌شهر · بالای دربند',
    city: 'تهران · دربند',
    address: 'تهران، انتهای خیابان دربند، مسیر سنگی بالاتر از سرو',
    description:
      'از بالای مسیر سنگی دربند، شهر با خط افق کوه‌های توچال قاب می‌شود؛ نمای پانورامای تهران در روز و دریای چراغ‌ها در ابتدای شب.',
    tip: 'از بالای مسیر سنگی، شهر را با خط افق کنار کوه قاب بگیرید؛ سه‌پایه فراموش نشود. برای blue hour سی دقیقه بعد از غروب بمانید.',
    bestTime: 'ساعت طلایی غروب',
    location: { lat: 35.8305, lng: 51.4347 },
    categories: ['landscape', 'sunset', 'night'],
    tags: ['نمای شهر', 'پانوراما', 'کوه'],
    photos: [
      p('sp3-1', '/images/spot-rooftop.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.9,
    ratingsCount: 88,
    accent: '#4B44DC',
    image: '/images/spot-rooftop.jpg',
    featured: true,
  },
  {
    id: 'spot-badgeir-alley',
    name: 'کوچه‌ی بادگیرها',
    city: 'بندر لنگه',
    address: 'هرمزگان، بندر لنگه، بافت قدیم، کوچه‌ی بادگیرها',
    description:
      'دیوارهای آبی و سفید با سایه‌های هندسی بادگیرها؛ مینیمال‌ترین قاب‌های جنوب ایران. رنگ آبی locally «سیرُخ» نامیده می‌شود و در آفتاب شدید جنوب می‌درخشد.',
    tip: 'دیوارهای آبی و سفید با سایه‌ی بادگیرها ترکیب مینیمال می‌سازد؛ ساعت ۷ صبح بهترین نور است و کوچه خلوت است.',
    bestTime: 'صبح زود',
    location: { lat: 26.5530, lng: 54.8810 },
    categories: ['architecture', 'street', 'portrait'],
    tags: ['مینیمال', 'بادگیر', 'جنوب'],
    photos: [],
    rating: 4.7,
    ratingsCount: 29,
    accent: '#00A388',
  },
  {
    id: 'spot-abgineh-museum',
    name: 'حیاط موزه‌ی آبگینه',
    city: 'تهران · کارگر شمالی',
    address: 'تهران، خیابان کارگر شمالی، موزه‌ی آبگینه',
    description:
      'خانه‌ی قوام‌السلطنه با حیاط باغچه‌ای و کاشی‌های فیروزه‌ای؛ انعکاس نور شیشه‌های رنگی روی کف حیاط، سوژه‌ی ثابت عکاسان پورتره است.',
    tip: 'انعکاس نور شیشه‌های رنگی روی کف حیاط ساعت ۴ تا ۶ عصر قشنگ‌ترین است؛ عکاسی حرفه‌ای داخل موزه نیاز به هماهنگی دارد.',
    bestTime: 'غروب',
    location: { lat: 35.6850, lng: 51.4060 },
    categories: ['architecture', 'portrait', 'night'],
    tags: ['حیاط', 'کاشی', 'سایه‌ونور'],
    photos: [],
    rating: 4.5,
    ratingsCount: 33,
    accent: '#C9A45C',
  },
  {
    id: 'spot-naqsh-jahan',
    name: 'میدان نقش جهان',
    city: 'اصفهان · مرکز',
    address: 'اصفهان، میدان نقش جهان (میدان امام)',
    description:
      'یکی از بزرگ‌ترین میدان‌های جهان با کاشی‌های فیروزه‌ای مسجد شیخ لطف‌الله؛ قبل از شلوغی، کاشی‌ها در نور صورتی سپیده‌دم از خودشان عکس می‌گیرند.',
    tip: 'قبل از شلوغی، کاشی‌های آبی در نور صورتی سپیده‌دم از خودشان عکس می‌گیرند؛ کالسکه‌ها هنوز نیستند و قاب میدان خالی است.',
    bestTime: 'ساعت طلایی صبح',
    location: { lat: 32.6573, lng: 51.6777 },
    categories: ['architecture', 'street', 'landscape', 'sunset'],
    tags: ['تاریخی', 'کاشی', 'یونسکو'],
    photos: [],
    rating: 4.9,
    ratingsCount: 120,
    accent: '#3B5BDB',
    featured: true,
  },
  {
    id: 'spot-khaju-bridge',
    name: 'پل خواجو در شب',
    city: 'اصفهان · زاینده‌رود',
    address: 'اصفهان، شرق میدان نقش جهان، پل خواجو',
    description:
      'طاق‌های آجری پل خواجو با نورپردازی گرم و بازتاب روی آب؛ برای عکاسی شب با اکسپوژر بلند و پرتره‌ی شبانه، قابلی‌ترین نقطه‌ی اصفهان است.',
    tip: 'ساعت آبی (۲۰ تا ۳۵ دقیقه بعد از غروب) بازتاب طاق‌ها روی آب کامل می‌شود؛ تراول‌انگ ثابت و ISO پایین را فراموش نکنید.',
    bestTime: 'شب',
    location: { lat: 32.6478, lng: 51.6674 },
    categories: ['night', 'architecture', 'landscape'],
    tags: ['اکسپوژر بلند', 'بازتاب آب', 'پل تاریخی'],
    photos: [
      p('sp7-1', '/images/spot-stairs.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.8,
    ratingsCount: 57,
    accent: '#2E5EAA',
  },
  {
    id: 'spot-erm-garden',
    name: 'باغ ارم',
    city: 'شیراز',
    address: 'شیراز، خیابان ارم، باغ ارم',
    description:
      'سروهای کهنسال، جوی‌های آب و عمارت قاجاری با ستون‌های بلند؛ پس‌زمینه‌ی ایده‌آل برای عکاسی عروسی، فشن و پرتره در فضای سبز کلاسیک.',
    tip: 'برای عکاسی عروسی و فشن، روزهای میانی هفته ساعت ۸ تا ۱۰ صبح هم خلوت است هم نور باغ ملایم؛ بلیت عکاسی از روبه‌رو تهیه کنید.',
    bestTime: 'ساعت طلایی صبح',
    location: { lat: 29.9400, lng: 52.5430 },
    categories: ['nature', 'wedding', 'fashion'],
    tags: ['باغ ایرانی', 'عروسی', 'سبز'],
    photos: [
      p('sp8-1', '/images/portfolio/wedding-garden.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.7,
    ratingsCount: 49,
    accent: '#2E9E66',
  },
  {
    id: 'spot-grand-bazaar',
    name: 'بازار بزرگ تهران',
    city: 'تهران · پانزده‌خرداد',
    address: 'تهران، خیابان ۱۵ خرداد، ورودی بازار بزرگ',
    description:
      'نور تاشوی حوض‌خانه‌ها، رنگ بارهای ادویه و رفت‌وآمد بی‌وقفه؛ جایی که عکاسی خیابانی ایران در غلیظ‌ترین حالت خودش است. هر قاب یک روایت دارد.',
    tip: 'صبح‌های شنبه تا سه‌شنبه بازار زنده و خلوت‌تر از جمعه است؛ با لنز ۲۸–۳۵ راه بروید و قبل از عکس آدم‌ها، سلام کنید.',
    bestTime: 'صبح زود',
    location: { lat: 35.6730, lng: 51.4190 },
    categories: ['street', 'portrait'],
    tags: ['خیابانی', 'مستند', 'بازار'],
    photos: [
      p('sp9-1', '/images/portfolio/poster-film.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.6,
    ratingsCount: 72,
    accent: '#C4693B',
  },
  {
    id: 'spot-lalehzar-rooftop',
    name: 'بام استودیویی لاله‌زار',
    city: 'تهران · لاله‌زار',
    address: 'تهران، خیابان لاله‌زار نو، بام ساختمان استودیو ۷',
    description:
      'بام با نمای کامل برج‌های شمال شهر و کابل‌های برق افقی؛ برای عکاسی فشن ادیتوریال و عکس محصول با پس‌زمینه‌ی شهری، استودیویی باز‌هوایی.',
    tip: 'نور سخت ظهر برای سایه‌های گرافیکی عالی است؛ برای فشن، دو ساعت قبل غروب با رفلکتور طلایی بروید. رزرو بام با استودیو.',
    bestTime: 'غروب',
    location: { lat: 35.6990, lng: 51.4210 },
    categories: ['fashion', 'product', 'portrait', 'sunset'],
    tags: ['استودیو', 'بام', 'ادیتوریال'],
    photos: [
      p('sp10-1', '/images/portfolio/product-perfume.jpg', 'تیم آرتیوو'),
      p('sp10-2', '/images/portfolio/portrait-editorial.jpg', 'تیم آرتیوو'),
    ],
    rating: 4.4,
    ratingsCount: 21,
    accent: '#FF7A5C',
  },
]

export function getSpot(id: string): PhotoSpot | undefined {
  return photoSpots.find(s => s.id === id)
}

/** مراکز شهرها برای قاب اولیه‌ی نقشه */
export const spotCityCenters: Record<string, { lat: number; lng: number }> = {
  'تهران': { lat: 35.7219, lng: 51.3890 },
  'اصفهان': { lat: 32.6546, lng: 51.6680 },
  'شیراز': { lat: 29.9400, lng: 52.5430 },
  'بندر لنگه': { lat: 26.5530, lng: 54.8810 },
}
