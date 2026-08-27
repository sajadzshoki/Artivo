<script setup lang="ts">
// فوتر ادیتوریال — فقط دسکتاپ (موبایل ناوبری پایین دارد)
const year = new Intl.NumberFormat('fa-IR').format(new Date().getFullYear())
</script>

<template>
  <footer class="footer">
    <div class="container footer__in">
      <div class="footer__brand">
        <span class="footer__wordmark latin">Artivo<em>*</em></span>
        <p class="footer__about">
          استودیوی آنلاین طراحی و عکاسی؛ پلی میان ایده‌ی شما و خلاق‌هایی که آن را به اثر تبدیل می‌کنند.
        </p>
      </div>

      <nav class="footer__col" aria-label="مسیرها">
        <h3 class="footer__title">مسیرها</h3>
        <NuxtLink to="/create">شروع پروژه</NuxtLink>
        <NuxtLink to="/jobs">پروژه‌های باز</NuxtLink>
        <NuxtLink to="/creatives">خلاق‌ها</NuxtLink>
        <NuxtLink to="/spots">لوکیشن عکاسی</NuxtLink>
      </nav>

      <div class="footer__col">
        <h3 class="footer__title">به‌زودی</h3>
        <span class="footer__soon">چت با خلاق‌ها</span>
        <span class="footer__soon">پرداخت امن</span>
        <span class="footer__soon">پنل خلاق‌ها</span>
      </div>

      <div class="footer__col">
        <h3 class="footer__title">ارتباط</h3>
        <a href="mailto:hello@artivo.ir" class="latin footer__mail">hello@artivo.ir</a>
        <div class="footer__socials">
          <span class="footer__social"><AIcon name="instagram" :size="16" /></span>
          <span class="footer__social"><AIcon name="send" :size="16" /></span>
        </div>
      </div>
    </div>
    <div class="container footer__base">
      <span>© {{ year }} آرتیوو — ساخته‌شده با وسواس در تهران</span>
      <span class="latin footer__base-en">Made to be seen</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  display: none;
  border-top: 1px solid var(--line);
  background: var(--bg-deep);
  margin-top: var(--sp-9);
}
@media (min-width: 768px) { .footer { display: block; } }

.footer__in {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: var(--sp-6);
  padding-block: var(--sp-7);
}
.footer__wordmark { font-size: 1.8rem; font-weight: 700; }
.footer__wordmark em { color: var(--coral); font-style: normal; }
.footer__about { margin-top: 0.7rem; max-width: 22rem; font-size: var(--fs-small); color: var(--muted); line-height: 1.9; }

.footer__col { display: grid; gap: 0.45rem; align-content: start; font-size: var(--fs-small); }
.footer__title {
  font-family: var(--font-latin);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 600;
  margin-bottom: 0.4rem;
}
.footer__col a { color: var(--ink-soft); font-weight: 600; width: fit-content; }
.footer__col a:hover { color: var(--coral); }
.footer__soon { color: var(--faint); }
.footer__mail { direction: ltr; text-align: end; }
.footer__socials { display: flex; gap: 0.5rem; margin-top: 0.3rem; }
.footer__social {
  width: 2.2rem; height: 2.2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  color: var(--ink-soft);
}

.footer__base {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 1.1rem;
  border-top: 1px solid var(--line);
  font-size: var(--fs-caption);
  color: var(--muted);
}
.footer__base-en { font-style: italic; }
</style>
