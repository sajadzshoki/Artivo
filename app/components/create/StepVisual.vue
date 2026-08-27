<script setup lang="ts">
import { colorPalettes, paletteCategories } from '#shared/config/palettes'

// گام ۳ — جهت بصری: پالت آماده یا رنگ‌های دلخواه
const { state } = useProjectRequest()

const category = ref('all')

const filtered = computed(() => {
  if (category.value === 'all') return colorPalettes
  return colorPalettes.filter(p => p.category === category.value)
})

const catOptions = [
  { value: 'all', label: 'همه' },
  ...paletteCategories.map(c => ({ value: c.id, label: c.label })),
]

function choosePalette(id: string) {
  state.value.visual.paletteId = state.value.visual.paletteId === id ? null : id
  if (state.value.visual.paletteId) state.value.visual.isCustom = false
}

function enableCustom() {
  state.value.visual.isCustom = !state.value.visual.isCustom
  if (state.value.visual.isCustom) state.value.visual.paletteId = null
}

const preview = computed(() => {
  if (state.value.visual.isCustom) {
    return {
      bg: '#FFFEFA',
      sub: `${state.value.visual.customPrimary}33`,
      accent: state.value.visual.customPrimary,
      ink: state.value.visual.customSecondary,
    }
  }
  const p = colorPalettes.find(x => x.id === state.value.visual.paletteId)
  if (!p) return null
  return { bg: p.colors[0], sub: p.colors[1], accent: p.colors[2], ink: p.colors[3] }
})
</script>

<template>
  <div>
    <header class="s-head">
      <h2 class="t-h1">با چه حال‌وهوایی؟</h2>
      <p class="t-body">یک پالت آماده انتخاب کن یا رنگ‌های دلخواهت را بچین؛ خلاق دقیقاً همین را می‌بیند.</p>
    </header>

    <AFilterChips v-model="category" :options="catOptions" label="دسته‌بندی پالت" class="cats" />

    <!-- پالت‌های آماده -->
    <TransitionGroup name="pal" tag="div" class="pals">
      <button
        v-for="p in filtered"
        :key="p.id"
        type="button"
        class="pal"
        :class="{ 'pal--on': state.visual.paletteId === p.id }"
        @click="choosePalette(p.id)"
      >
        <PalettePreview :bg="p.colors[0]" :sub="p.colors[1]" :accent="p.colors[2]" :ink="p.colors[3]" small />
        <span class="pal__body">
          <span class="pal__name">{{ p.name }}</span>
          <span class="pal__desc">{{ p.description }}</span>
          <span class="pal__sw">
            <i v-for="(c, i) in p.colors" :key="i" :style="{ background: c }" />
          </span>
        </span>
        <span class="pal__check" aria-hidden="true"><AIcon name="check" :size="12" /></span>
      </button>
    </TransitionGroup>

    <!-- رنگ دلخواه -->
    <div class="custom panel" :class="{ 'custom--on': state.visual.isCustom }">
      <button type="button" class="custom__toggle" @click="enableCustom">
        <span class="custom__swatches" aria-hidden="true">
          <i :style="{ background: state.visual.customPrimary }" />
          <i :style="{ background: state.visual.customSecondary }" />
        </span>
        <strong>رنگ‌های دلخواه خودم</strong>
        <AIcon :name="state.visual.isCustom ? 'chevron-up' : 'plus'" :size="16" class="custom__plus" />
      </button>

      <Transition name="fold">
        <div v-if="state.visual.isCustom" class="custom__pickers">
          <label class="custom__pick">
            <span>رنگ اصلی</span>
            <span class="custom__ctrl">
              <input v-model="state.visual.customPrimary" type="color" aria-label="رنگ اصلی">
              <code class="latin">{{ state.visual.customPrimary }}</code>
            </span>
          </label>
          <label class="custom__pick">
            <span>رنگ مکمل</span>
            <span class="custom__ctrl">
              <input v-model="state.visual.customSecondary" type="color" aria-label="رنگ مکمل">
              <code class="latin">{{ state.visual.customSecondary }}</code>
            </span>
          </label>
        </div>
      </Transition>
    </div>

    <!-- پیش‌نمایش بزرگ -->
    <Transition name="fold">
      <div v-if="preview" class="preview">
        <p class="preview__label">پیش‌نمایش زنده‌ی جهت بصری</p>
        <div class="preview__row">
          <PalettePreview v-bind="preview" />
          <div class="preview__text" :style="{ color: preview.ink }">
            <span class="preview__overline latin" :style="{ color: preview.accent }">Artivo Preview</span>
            <strong class="preview__h">جشنواره‌ی طراحی امروز</strong>
            <span class="preview__p" :style="{ background: preview.sub }" />
            <span class="preview__p preview__p--2" :style="{ background: preview.sub }" />
            <span class="preview__btn" :style="{ background: preview.accent, color: preview.bg }">ثبت‌نام</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.s-head { display: grid; gap: 0.4rem; margin-bottom: 1.2rem; }
.cats { margin-bottom: 0.9rem; }

.pals {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.7rem;
}
@media (min-width: 768px) { .pals { grid-template-columns: repeat(3, 1fr); } }

.pal {
  position: relative;
  display: grid;
  gap: 0.55rem;
  align-content: start;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.55rem 0.55rem 0.7rem;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s var(--ease-out);
}
.pal:hover { transform: translateY(-2px); box-shadow: var(--shadow-soft); }
.pal--on { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }

.pal__body { display: grid; gap: 0.15rem; padding-inline: 0.25rem; }
.pal__name { font-size: var(--fs-small); font-weight: 900; }
.pal__desc {
  font-size: 0.68rem;
  color: var(--muted);
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pal__sw { display: flex; gap: 0.25rem; margin-top: 0.3rem; }
.pal__sw i { flex: 1; height: 0.55rem; border-radius: 99px; border: 1px solid rgba(33, 28, 21, 0.07); }

.pal__check {
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
.pal--on .pal__check { opacity: 1; transform: scale(1); }

.pal-move { transition: transform 0.35s var(--ease-out); }
.pal-enter-active { transition: all 0.3s var(--ease-out); }
.pal-enter-from { opacity: 0; transform: scale(0.96); }

/* ── سفارشی ── */
.custom { margin-top: 0.9rem; padding: 0; overflow: hidden; }
.custom--on { border-color: var(--ink); }
.custom__toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  text-align: start;
}
.custom__swatches { display: flex; }
.custom__swatches i { width: 1.3rem; height: 1.3rem; border-radius: 99px; border: 2px solid var(--paper); }
.custom__swatches i + i { margin-inline-start: -0.5rem; }
.custom__toggle strong { font-size: var(--fs-small); font-weight: 900; }
.custom__plus { margin-inline-start: auto; color: var(--faint); }

.custom__pickers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  padding: 0.2rem 1rem 1rem;
}
.custom__pick { display: grid; gap: 0.35rem; }
.custom__pick > span:first-child { font-size: var(--fs-caption); font-weight: 700; color: var(--muted); }
.custom__ctrl {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding: 0.35rem 0.55rem;
}
.custom__ctrl input[type='color'] {
  inline-size: 2.1rem;
  block-size: 2.1rem;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.custom__ctrl code { font-size: var(--fs-caption); color: var(--ink-soft); }

/* ── پیش‌نمایش ── */
.preview { margin-top: 1.1rem; }
.preview__label { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); margin-bottom: 0.55rem; }
.preview__row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.9rem;
  align-items: stretch;
}
.preview__row > :first-child { inline-size: 7.2rem; }

.preview__text {
  display: grid;
  gap: 0.5rem;
  align-content: center;
  padding: 0.4rem 0.2rem;
  min-width: 0;
}
.preview__overline { font-size: 0.64rem; letter-spacing: 0.18em; font-weight: 600; }
.preview__h { font-size: var(--fs-lg); font-weight: 900; line-height: 1.4; }
.preview__p { display: block; height: 0.55rem; border-radius: 99px; width: 88%; }
.preview__p--2 { width: 62%; }
.preview__btn {
  justify-self: start;
  border-radius: 99px;
  font-size: var(--fs-caption);
  font-weight: 800;
  padding: 0.35rem 1rem;
  margin-top: 0.3rem;
}

.fold-enter-active { transition: all 0.35s var(--ease-out); }
.fold-leave-active { transition: all 0.2s ease-in; }
.fold-enter-from, .fold-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
