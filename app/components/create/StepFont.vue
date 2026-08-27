<script setup lang="ts">
import { fontPairings } from '#shared/config/font-pairings'

// گام ۴ — استایل فونت: ترکیب‌های واقعی فارسی + لاتین
const { state } = useProjectRequest()

function choose(id: string) {
  state.value.fontPairingId = state.value.fontPairingId === id ? null : id
}

function pairStyle(p: (typeof fontPairings)[number]) {
  return {
    '--ph': p.headingFamily,
    '--ph-w': p.headingWeight,
    '--pl': p.latinFamily,
  }
}
</script>

<template>
  <div>
    <header class="s-head">
      <h2 class="t-h1">حروف چه حالتی داشته باشند؟</h2>
      <p class="t-body">ترکیب‌های واقعی و قابل‌اجرا؛ پیش‌نمایش زنده‌ی هر زوج را ببین و انتخاب کن.</p>
    </header>

    <div class="fonts">
      <button
        v-for="p in fontPairings"
        :key="p.id"
        type="button"
        class="fp"
        :class="{ 'fp--on': state.fontPairingId === p.id }"
        :style="pairStyle(p)"
        @click="choose(p.id)"
      >
        <span class="fp__head">
          <strong class="fp__name">{{ p.name }}</strong>
          <ATag :label="p.tone" tone="coral" />
        </span>

        <span class="fp__preview">
          <span class="fp__h">پوستر رویداد شما</span>
          <span class="fp__latin latin" aria-hidden="true">Creative Direction — 2026</span>
        </span>

        <span class="fp__foot">
          <span class="fp__desc">{{ p.description }}</span>
          <span class="fp__latinname latin">{{ p.latinName }}</span>
        </span>

        <span class="fp__check" aria-hidden="true"><AIcon name="check" :size="12" /></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.s-head { display: grid; gap: 0.4rem; margin-bottom: 1.5rem; }

.fonts { display: grid; gap: 0.7rem; }

.fp {
  position: relative;
  display: grid;
  gap: 0.7rem;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.9rem 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.fp:hover { border-color: var(--line-strong); }
.fp--on { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink), var(--shadow-soft); }

.fp__head { display: flex; align-items: center; justify-content: space-between; gap: 0.6rem; }
.fp__name { font-size: var(--fs-small); font-weight: 900; }

.fp__preview {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  background: var(--bg);
  border-radius: var(--r-sm);
  padding: 0.85rem 1rem;
  overflow: hidden;
}
.fp__h {
  font-family: var(--ph);
  font-weight: var(--ph-w);
  font-size: 1.45rem;
  line-height: 1.5;
  white-space: nowrap;
}
.fp__latin {
  font-family: var(--pl);
  font-size: 0.78rem;
  font-style: italic;
  color: var(--muted);
  white-space: nowrap;
}

.fp__foot { display: flex; flex-direction: column; gap: 0.2rem; }
.fp__desc { font-size: var(--fs-caption); color: var(--muted); line-height: 1.8; }
.fp__latinname { font-size: 0.64rem; color: var(--faint); letter-spacing: 0.08em; }

.fp__check {
  position: absolute;
  top: -7px;
  inset-inline-end: -7px;
  width: 1.3rem; height: 1.3rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--ink);
  color: var(--bg);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s var(--ease-out);
  z-index: 2;
}
.fp--on .fp__check { opacity: 1; transform: scale(1); }

@media (max-width: 480px) {
  .fp__latin { display: none; }
  .fp__h { font-size: 1.3rem; }
}
</style>
