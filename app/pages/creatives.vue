<script setup lang="ts">
import type { Creative } from '#shared/types'
import { creatives } from '#shared/data/content'

// خلاق‌ها — طراحان و عکاسان تأییدشده
useHead({ title: 'خلاق‌ها — آرتیوو' })

const toast = useToast()
const loading = ref(true)
const query = ref('')
const specialty = ref('all')

const specialties = computed(() => {
  const set = new Map<string, string>()
  for (const c of creatives) if (!set.has(c.role)) set.set(c.role, c.role)
  return [
    { value: 'all', label: 'همه‌ی تخصص‌ها' },
    ...[...set.entries()].map(([value, label]) => ({ value, label })),
  ]
})

onMounted(() => { setTimeout(() => { loading.value = false }, 600) })

const filtered = computed<Creative[]>(() => {
  let list = creatives
  if (specialty.value !== 'all') list = list.filter(c => c.role === specialty.value)
  const q = query.value.trim()
  if (q) {
    list = list.filter(c =>
      c.name.includes(q) || c.role.includes(q) || c.skills.some(s => s.includes(q)))
  }
  return list
})

const active = ref<Creative | null>(null)
const open = ref(false)
function show(c: Creative) {
  active.value = c
  open.value = true
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">The Talents</p>
      <h1 class="t-h1 page-head__title">خلاق‌های آرتیوو</h1>
      <p class="t-body page-head__desc">
        طراحان گرافیک و عکاسانی که هر کدام امضای خودشان را دارند؛ نمونه‌کار ببین، انتخاب کن.
      </p>
    </header>

    <div class="toolbar" v-reveal>
      <AInput v-model="query" icon="search" placeholder="جست‌وجوی نام یا تخصص…" />
    </div>

    <AFilterChips v-model="specialty" :options="specialties" label="فیلتر تخصص" class="toolbar__chips" />

    <section aria-label="فهرست خلاق‌ها">
      <div v-if="loading" class="grid">
        <div v-for="i in 4" :key="i" class="panel skel-card">
          <ASkeleton h="10.5rem" radius="0" />
          <div class="skel-card__body">
            <ASkeleton w="60%" h="1rem" />
            <ASkeleton w="40%" h="0.8rem" />
            <ASkeleton w="75%" h="0.8rem" />
          </div>
        </div>
      </div>

      <template v-else>
        <TransitionGroup name="list" tag="div" class="grid">
          <CreativeCard v-for="c in filtered" :key="c.id" :creative="c" @open="show(c)" />
          <AEmptyState
            v-if="filtered.length === 0"
            key="empty"
            icon="users"
            title="خلاقی پیدا نشد"
            description="عبارت دیگری را جست‌وجو کن یا فیلتر تخصص را بردار."
          >
            <AButton variant="outline" size="sm" @click="query = ''; specialty = 'all'">پاک کردن فیلترها</AButton>
          </AEmptyState>
        </TransitionGroup>
      </template>
    </section>

    <AModal v-model="open" :title="active?.name" size="sm">
      <template v-if="active">
        <p class="t-body">{{ active.bio }}</p>
        <div class="mini">
          <div class="mini__row"><span>تخصص</span><strong>{{ active.role }}</strong></div>
          <div class="mini__row"><span>شهر</span><strong>{{ active.city }}</strong></div>
          <div class="mini__row"><span>پروژه‌های انجام‌شده</span><strong>{{ new Intl.NumberFormat('fa-IR').format(active.projectsDone) }}</strong></div>
          <div class="mini__row"><span>امتیاز</span><strong class="star"><AIcon name="star" :size="14" /> {{ new Intl.NumberFormat('fa-IR').format(active.rating) }}</strong></div>
          <div class="mini__row"><span>شروع قیمت</span><strong>{{ formatTomanCompact(active.startingPrice) }}</strong></div>
        </div>
        <div class="mini__tags">
          <ATag v-for="s in active.skills" :key="s" :label="s" />
        </div>
      </template>
      <template #footer>
        <AButton
          block
          @click="open = false; toast.info('به‌زودی!', 'درخواست همکاری مستقیم با خلاق در فاز بعدی فعال می‌شود.')"
        >
          درخواست همکاری
        </AButton>
      </template>
    </AModal>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 30rem; }

.toolbar { margin-top: 0.8rem; max-width: 26rem; }
.toolbar__chips { margin-top: 0.6rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15.5rem, 1fr));
  gap: 0.8rem;
  margin-top: 1rem;
}
.skel-card__body { display: grid; gap: 0.6rem; padding: 1rem; }

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }

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
.mini__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.9rem; }
</style>
