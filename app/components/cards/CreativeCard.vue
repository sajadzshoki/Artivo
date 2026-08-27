<script setup lang="ts">
import type { Creative } from '#shared/types'

// کارت خلاق — کاور بصری، امتیاز و قیمت شروع
const props = defineProps<{ creative: Creative }>()
defineEmits<{ open: [] }>()

const initials = computed(() => props.creative.name.split(' ').map(w => w[0]).slice(0, 2).join(''))
const fa = new Intl.NumberFormat('fa-IR')
</script>

<template>
  <button type="button" class="cc" @click="$emit('open')">
    <span class="cc__cover" :style="!creative.image ? { background: `linear-gradient(150deg, ${creative.accent}30, ${creative.accent}66)` } : undefined">
      <img v-if="creative.image" :src="creative.image" :alt="`نمونه‌کار ${creative.name}`" loading="lazy" width="560" height="420">
      <span v-else class="cc__glyph latin">{{ initials }}</span>
      <span class="cc__rate"><AIcon name="star" :size="13" /> {{ fa.format(creative.rating) }}</span>
    </span>

    <span class="cc__body">
      <span class="cc__head">
        <span class="cc__avatar" :style="{ background: `${creative.accent}1E`, color: creative.accent }">{{ initials }}</span>
        <span class="cc__id">
          <span class="cc__name">{{ creative.name }}</span>
          <span class="cc__role">{{ creative.role }}</span>
        </span>
      </span>

      <span class="cc__tags">
        <ATag v-for="s in creative.skills.slice(0, 2)" :key="s" :label="s" />
      </span>

      <span class="cc__foot">
        <span class="cc__price">شروع از <strong>{{ formatTomanCompact(creative.startingPrice) }}</strong></span>
        <span class="cc__city"><AIcon name="map-pin" :size="13" /> {{ creative.city }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
.cc {
  display: grid;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s, border-color 0.3s;
}
.cc:hover { transform: translateY(-4px); box-shadow: var(--shadow-pop); border-color: var(--line-strong); }

.cc__cover {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-deep);
}
.cc__cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.cc:hover .cc__cover img { transform: scale(1.06); }
.cc__glyph {
  position: absolute; inset: 0;
  display: grid; place-items: center;
  font-size: 3.4rem; font-weight: 700; font-style: italic;
  color: color-mix(in srgb, var(--ink) 45%, transparent);
}
.cc__rate {
  position: absolute;
  top: 0.6rem; inset-inline-start: 0.6rem;
  display: inline-flex; align-items: center; gap: 0.25rem;
  background: var(--paper);
  border-radius: 99px;
  padding: 0.2rem 0.55rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--amber);
  box-shadow: var(--shadow-soft);
}

.cc__body { display: grid; gap: 0.65rem; padding: 0.85rem 0.95rem 1rem; }
.cc__head { display: flex; align-items: center; gap: 0.6rem; }
.cc__avatar {
  width: 2.4rem; height: 2.4rem;
  display: grid; place-items: center;
  border-radius: 99px;
  font-size: var(--fs-small);
  font-weight: 900;
  flex-shrink: 0;
}
.cc__id { display: grid; min-width: 0; }
.cc__name { font-size: var(--fs-small); font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cc__role { font-size: var(--fs-caption); color: var(--muted); }

.cc__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.cc__foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px dashed var(--line);
  padding-top: 0.65rem;
}
.cc__price { font-size: var(--fs-caption); color: var(--muted); }
.cc__price strong { color: var(--ink); font-weight: 800; }
.cc__city { display: inline-flex; align-items: center; gap: 0.2rem; font-size: var(--fs-caption); color: var(--faint); }
</style>
