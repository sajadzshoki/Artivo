<script setup lang="ts">
import type { Creative } from '#shared/types'
import { creatives } from '#shared/data/content'

// خلاق‌های منتخب — اسکرولر افقی کارت‌ها + مودال جزئیات
const toast = useToast()
const featured = creatives.filter(c => c.featured)
const active = ref<Creative | null>(null)
const open = ref(false)

function show(c: Creative) {
  active.value = c
  open.value = true
}
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">خلاق‌های منتخب</span>
          <h2 class="t-h1">پشت هر اثر، یک امضاست</h2>
        </div>
        <NuxtLink to="/creatives" class="section-head__link">
          مشاهده‌ی همه
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>
    </div>

    <div class="container">
      <div class="scroll-x">
        <CreativeCard
          v-for="c in featured"
          :key="c.id"
          :creative="c"
          class="home-creative"
          @open="show(c)"
        />
      </div>
    </div>

    <AModal v-model="open" :title="active?.name" size="sm">
      <template v-if="active">
        <p class="t-body">{{ active.bio }}</p>
        <div class="mini">
          <div class="mini__row"><span>تخصص</span><strong>{{ active.role }}</strong></div>
          <div class="mini__row"><span>شهر</span><strong>{{ active.city }}</strong></div>
          <div class="mini__row"><span>امتیاز</span><strong class="star"><AIcon name="star" :size="14" /> {{ new Intl.NumberFormat('fa-IR').format(active.rating) }}</strong></div>
          <div class="mini__row"><span>شروع قیمت</span><strong>{{ formatTomanCompact(active.startingPrice) }}</strong></div>
        </div>
      </template>
      <template #footer>
        <AButton
          block
          @click="open = false; toast.info('به‌زودی!', 'درخواست همکاری مستقیم با خلاق در فاز بعدی فعال می‌شود.')"
        >
          درخواست همکاری با این خلاق
        </AButton>
      </template>
    </AModal>
  </section>
</template>

<style scoped>
.home-creative { width: min(16.5rem, 74vw); }
@media (min-width: 1024px) {
  .home-creative { width: 100%; }
  :deep(.creative-grid-4) { display: contents; }
}

.mini { display: grid; gap: 0.55rem; margin-top: 1.1rem; }
.mini__row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: var(--fs-small);
  color: var(--muted);
  border-bottom: 1px dashed var(--line);
  padding-bottom: 0.55rem;
}
.mini__row strong { color: var(--ink); }
.star { display: inline-flex; align-items: center; gap: 0.25rem; color: var(--amber) !important; }
</style>
