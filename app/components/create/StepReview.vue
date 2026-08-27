<script setup lang="ts">
// گام ۸ — بازبینی و ارسال: خلاصه‌ی زیبا + ویرایش هر بخش + برآورد نهایی
const { state, step } = useProjectRequest()
const { sections, estimate } = useRequestSummary()

function edit(stepIndex: number) {
  step.value = stepIndex
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="review">
    <header class="s-head">
      <h2 class="t-h1">یک نگاه نهایی</h2>
      <p class="t-body">همه‌چیز درست است؟ هر بخش را می‌توانی جداگانه ویرایش کنی — بدون شروع دوباره.</p>
    </header>

    <div class="rv">
      <article v-for="s in sections" :key="s.step" class="rv__sec" :class="{ 'rv__sec--sel': s.step === -1 }">
        <span class="rv__num latin">{{ String(s.step + 1).padStart(2, '0') }}</span>
        <div class="rv__body">
          <span class="rv__title"><AIcon :name="s.icon" :size="15" /> {{ s.title }}</span>
          <span v-for="(l, i) in s.lines" :key="i" class="rv__line" :class="{ 'rv__line--empty': l === 'انتخاب نشده' || l === 'نوشته نشده' || l === 'تکمیل نشده' || l === 'مشخص نشده' }">{{ l }}</span>
          <span v-if="s.swatches" class="rv__sw">
            <i v-for="(c, i) in s.swatches" :key="i" :style="{ background: c }" />
          </span>
        </div>
        <button v-if="s.step >= 0" type="button" class="rv__edit" :aria-label="`ویرایش ${s.title}`" @click="edit(s.step)">
          <AIcon name="pen" :size="14" />
          ویرایش
        </button>
      </article>
    </div>

    <EstimatePanel />

    <ACheck
      v-model="state.confirmed"
      label="اطلاعات را بررسی کردم و صحت آن‌ها را تایید می‌کنم"
      description="پس از ثبت، بریف شما برای خلاق‌های مناسب ارسال می‌شود."
    />
  </div>
</template>

<style scoped>
.review { display: grid; gap: 1.3rem; }
.s-head { display: grid; gap: 0.4rem; margin-bottom: 0.2rem; }

.rv { display: grid; }

.rv__sec {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  padding-block: 0.95rem;
  border-bottom: 1px solid var(--line);
}
.rv__sec:first-child { border-top: 1px solid var(--line-strong); }
.rv__sec--sel { background: var(--indigo-soft); border-radius: var(--r-sm); padding-inline: 0.6rem; margin-block: 0.35rem; border-bottom: none !important; }

.rv__num {
  font-size: 0.95rem;
  font-weight: 600;
  font-style: italic;
  color: var(--faint);
  width: 2rem;
  flex-shrink: 0;
  line-height: 1.9;
}

.rv__body { display: grid; gap: 0.12rem; min-width: 0; flex: 1; }
.rv__title {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--muted);
}
.rv__line { font-size: var(--fs-small); font-weight: 600; line-height: 1.8; overflow-wrap: anywhere; }
.rv__line--empty { color: var(--faint); font-weight: 500; }

.rv__sw { display: flex; gap: 0.25rem; margin-top: 0.25rem; }
.rv__sw i { width: 0.95rem; height: 0.95rem; border-radius: 99px; border: 1px solid rgba(33, 28, 21, 0.12); }

.rv__edit {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--indigo-deep);
  border: 1px solid var(--indigo-soft);
  background: var(--indigo-soft);
  border-radius: var(--r-pill);
  padding: 0.28rem 0.7rem;
  flex-shrink: 0;
  transition: all 0.2s;
}
.rv__edit:hover { background: var(--indigo); border-color: var(--indigo); color: #fff; }
</style>
