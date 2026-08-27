# Artivo · آرتیوو

پلتفرم خلاقیت — مارکت‌پلیس اتصال کارفرماها به طراحان گرافیک و عکاسان.
**Nuxt 4 · Vue 3 · TypeScript · Mobile-first · Persian RTL · Light only**

## اجرا

```bash
npm install         # نصب وابستگی‌ها
npm run dev         # توسعه روی http://localhost:3000
npm run build       # بیلد پرواکشن
npm run typecheck   # چک کامل TypeScript
```

> نکته: در این محیط `npm` به `--legacy-peer-deps` نیاز دارد؛ `yarn install` هم کار می‌کند.

## معماری

```
shared/                    ← کد مشترک اپ و سرور (در فازهای بعد: API)
  types/                   ← تایپ‌های دامنه (تک منبع حقیقت تایپ‌ها)
  config/                  ← کانفیگ‌های محصول
    project-types.ts       ←   انواع پروژه + پریست سایز/فرمت هر نوع
    palettes.ts            ←   پالت‌های رنگی «جهت بصری»
    font-pairings.ts       ←   زوج‌فونت‌های فارسی + لاتین
    pricing.ts             ←   ⚙️ کانفیگ مرکزی قیمت‌گذاری (آماده‌ی پنل ادمین)
  services/
    pricing.ts             ← موتور برآورد قیمت — تنها نقطه‌ی محاسبه‌ی قیمت
  data/content.ts          ← دیتای ماک (خلاق‌ها، پروژه‌ها، لوکیشن‌ها)
  utils/format.ts          ← فرمت فارسی (عدد، تومان، تاریخ، اعتبارسنجی موبایل)

app/
  assets/css/main.css      ← توکن‌های سیستم طراحی + ریست + کلاس‌های پایه
  components/
    ui/                    ← کیت طراحی: AButton, AInput, ASelect, ASegmented,
                             AChip, ATag, ACheck, ACard, AHeader, ABottomNav,
                             AStepProgress, AEmptyState, ASkeleton, AToaster,
                             AModal, ADrawer, AFilterChips, AIcon, ...
    home/  cards/  create/ ← بخش‌های صفحه‌ها (create = گام‌های ویزارد)
  composables/             ← useProjectRequest (وضعیت ویزارد)، usePricing،
                             useRequestSummary، useMyRequests، useToast
  pages/                   ← / · /create · /jobs · /creatives · /spots · /profile
  layouts/default.vue      ← هدر/فوتر/ناوبری — مسیرهای /create بدون کروم
  plugins/reveal.ts        ← دایرکتیو v-reveal (ظاهر شدن با اسکرول)
```

## اصول

- **موبایل اول**: همه‌چیز برای ۳۶۰px طراحی و بعد برای دسکتاپ گسترش می‌یابد؛ ناوبری اصلی موبایل، نوار پایین است.
- **زبان بصری ادیتوریال**: پایه‌ی عاجی گرم (`#FAF6EF`)، جوهر تیره، تأکیدهای کورال/ایندیگو/سبز، سرخط درشت، خطوط ظریف — بدون کارت‌های داشبوردی.
- **قیمت هرگز هاردکد نیست**: کامپوننت‌ها فقط `usePricing()` را می‌خوانند. قواعد در `shared/config/pricing.ts` است و `shared/services/pricing.ts` محاسبه می‌کند؛ شکل دیتا برای انتقال به پنل ادمین/دیتابیس آماده است (قیمت پایه، ضریب اندازه، پیچیدگی، فوریت، سرویس‌های اختیاری، حداقل مبلغ).
- **ویزارد تک‌گامی**: هر گام تمامِ صفحه است؛ پیش‌نویس در localStorage؛ خلاصه‌ی زنده در ریل دسکتاپ و کشوی موبایل؛ ویرایش هر بخش از صفحه‌ی بازبینی.
- **دسترس‌پذیری**: RTL بومی با خواص منطقی (`inset-inline`, `margin-inline`)، فوکوس‌رینگ، `aria`، احترام به `prefers-reduced-motion`.
- فقط حالت روشن. بدون پرداخت، چت یا احراز هویت (فاز ۱).

## افزودن آیتم جدید

| می‌خواهی... | کجا |
|---|---|
| نوع پروژه‌ی جدید | `shared/config/project-types.ts` → `projectTypes` + `sizeConfigs` |
| پالت رنگی جدید | `shared/config/palettes.ts` |
| زوج‌فونت جدید | `shared/config/font-pairings.ts` (+ لینک فونت در `nuxt.config.ts`) |
| قانون قیمت جدید | `shared/config/pricing.ts` → در `services/pricing.ts` مصرف کن |
| سرویس اختیاری جدید | `shared/config/pricing.ts` → `addOns` |

## فاز ۱ — وضعیت

✅ سیستم طراحی کامل · صفحه‌های عمومی · ویزارد ۸ گامی درخواست پروژه · برآورد قیمت مرکزی · ثبت شبیه‌سازی‌شده با کد پیگیری (localStorage)

⏭ فازهای بعد: بک‌اند و احراز هویت، پنل ادمین قیمت‌گذاری، چت، پرداخت، پنل خلاق‌ها.
