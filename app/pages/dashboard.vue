<script setup lang="ts">
import type { ProjectSummary } from '#shared/types'
import { formatTomanCompact } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// داشبورد — با سوییچ نقش: کارفرما / خلاق
// کارفرما: پروژه‌های فعال + پیشنهادهای تازه · خلاق: فرصت‌های باز + کارهای جاری
// ─────────────────────────────────────────────────────────────
useHead({ title: 'داشبورد — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const { user } = useAuth()
const { asClient, asCreative, ready, error, refresh } = useProjects()
const conversations = useConversations()
const fa = new Intl.NumberFormat('fa-IR')

const availableRoles = computed(() => {
  const roles = user.value?.roles ?? []
  const out: ('client' | 'creative')[] = []
  if (roles.includes('client') || roles.includes('admin')) out.push('client')
  if (roles.includes('creative') || roles.includes('admin')) out.push('creative')
  return out.length ? out : ['client' as const]
})
const activeRole = ref<'client' | 'creative'>(availableRoles.value[0] ?? 'client')

const clientActive = computed(() =>
  asClient.value.filter(p => !['completed', 'cancelled', 'draft'].includes(p.status)))
const clientHiring = computed(() =>
  asClient.value.filter(p => p.status === 'published' || p.status === 'receiving'))
const clientProposals = computed(() =>
  clientHiring.value.reduce((s, p) => s + p.proposalsCount, 0))
const clientDone = computed(() => asClient.value.filter(p => p.status === 'completed').length)

const creativeActive = computed(() =>
  asCreative.value.filter(p => !['completed', 'cancelled'].includes(p.status)))
const creativeDone = computed(() => asCreative.value.filter(p => p.status === 'completed').length)
const creativeRevisions = computed(() =>
  asCreative.value.filter(p => p.status === 'revision_requested'))

const opportunities = ref<ProjectSummary[]>([])
const oppsLoading = ref(false)
async function loadOpportunities() {
  oppsLoading.value = true
  try {
    opportunities.value = await useProjects().open()
  }
  finally {
    oppsLoading.value = false
  }
}

onMounted(async () => {
  await refresh()
  conversations.refresh()
  void loadOpportunities()
})

const roleOptions = computed(() => availableRoles.value.map(r => ({
  value: r,
  label: r === 'client' ? 'کارفرما' : 'خلاق',
})))
</script>

<template>
  <div class="container dash">
    <header class="page-head" v-reveal>
      <p class="overline">Dashboard</p>
      <h1 class="t-h1 page-head__title">سلام، {{ user?.name?.split(' ')[0] }} 👋</h1>
      <div class="dash__switch">
        <ASegmented v-if="roleOptions.length > 1" v-model="activeRole" :options="roleOptions" class="dash__seg" />
      </div>
    </header>

    <AEmptyState
          v-if="error && !ready"
          icon="zap"
          title="داشبورد بارگذاری نشد"
          description="ارتباط برقرار نشد؛ اتصالت را چک کن و دوباره تلاش کن."
        >
          <AButton size="sm" @click="refresh()">تلاش دوباره</AButton>
        </AEmptyState>
        <div v-else-if="!ready" class="dash__list">
      <div v-for="i in 3" :key="i" class="panel" style="padding:1rem">
        <ASkeleton h="3rem" radius="12px" />
      </div>
    </div>

    <template v-else>
      <!-- ═══ نمای کارفرما ═══ -->
      <template v-if="activeRole === 'client'">
        <div class="stats" v-reveal>
          <NuxtLink to="/projects?tab=client" class="panel stat">
            <span class="stat__n">{{ fa.format(clientActive.length) }}</span>
            <span class="stat__l">پروژه‌ی فعال</span>
          </NuxtLink>
          <div class="panel stat">
            <span class="stat__n">{{ fa.format(clientProposals) }}</span>
            <span class="stat__l">پیشنهاد دریافتی</span>
          </div>
          <div class="panel stat">
            <span class="stat__n">{{ fa.format(clientDone) }}</span>
            <span class="stat__l">پروژه‌ی تکمیل‌شده</span>
          </div>
        </div>

        <section class="sec" v-reveal>
          <div class="sec__head">
            <h2 class="t-h3 sec__t">پروژه‌های در جریان</h2>
            <AButton to="/projects/new" size="sm" icon="plus">پروژه‌ی جدید</AButton>
          </div>
          <div class="dash__list">
            <ProjectCard v-for="p in clientActive.slice(0, 4)" :key="p.id" :project="p" />
            <AEmptyState
              v-if="!clientActive.length"
              icon="briefcase"
              title="هنوز پروژه‌ی فعالی نداری"
              description="اولین پروژه‌ات را بساز؛ بریف ویزارد هم می‌تواند مستقیم به پروژه تبدیل شود."
            >
              <AButton to="/projects/new" size="sm" icon-end="arrow-left">ساخت پروژه</AButton>
            </AEmptyState>
          </div>
        </section>

        <section v-if="clientHiring.length" class="sec" v-reveal>
          <div class="sec__head">
            <h2 class="t-h3 sec__t">در حال جذب پیشنهاد</h2>
            <NuxtLink to="/projects?tab=client" class="sec__link">همه<AIcon name="arrow-left" :size="14" /></NuxtLink>
          </div>
          <div class="dash__list">
            <ProjectCard v-for="p in clientHiring" :key="p.id" :project="p" />
          </div>
        </section>
      </template>

      <!-- ═══ نمای خلاق ═══ -->
      <template v-else>
        <div class="stats" v-reveal>
          <div class="panel stat">
            <span class="stat__n">{{ fa.format(creativeActive.length) }}</span>
            <span class="stat__l">کارِ در جریان</span>
          </div>
          <div class="panel stat">
            <span class="stat__n">{{ fa.format(opportunities.length) }}</span>
            <span class="stat__l">فرصت‌ی باز</span>
          </div>
          <div class="panel stat">
            <span class="stat__n">{{ fa.format(creativeDone) }}</span>
            <span class="stat__l">کارِ تحویل‌شده</span>
          </div>
        </div>

        <section v-if="creativeRevisions.length" class="sec" v-reveal>
          <div class="sec__head">
            <h2 class="t-h3 sec__t">اصلاحیه در انتظارت 🖊</h2>
          </div>
          <div class="dash__list">
            <ProjectCard v-for="p in creativeRevisions" :key="p.id" :project="p" />
          </div>
        </section>

        <section class="sec" v-reveal>
          <div class="sec__head">
            <h2 class="t-h3 sec__t">کارهای در جریان</h2>
            <NuxtLink to="/projects?tab=creative" class="sec__link">همه<AIcon name="arrow-left" :size="14" /></NuxtLink>
          </div>
          <div class="dash__list">
            <ProjectCard v-for="p in creativeActive.slice(0, 4)" :key="p.id" :project="p" />
            <AEmptyState
              v-if="!creativeActive.length"
              icon="aperture"
              title="هنوز کاری شروع نکرده‌ای"
              description="از فرصت‌های پایین پیشنهاد بده تا اولین پروژه‌ات شروع شود."
            />
          </div>
        </section>

        <section class="sec" v-reveal>
          <div class="sec__head">
            <h2 class="t-h3 sec__t">فرصت‌های پروژه</h2>
            <NuxtLink to="/jobs" class="sec__link">بازار پروژه‌ها<AIcon name="arrow-left" :size="14" /></NuxtLink>
          </div>
          <div v-if="oppsLoading" class="dash__list">
            <div v-for="i in 2" :key="i" class="panel" style="padding:1rem"><ASkeleton h="2.6rem" radius="12px" /></div>
          </div>
          <div v-else class="dash__list">
            <NuxtLink v-for="o in opportunities.slice(0, 5)" :key="o.id" :to="`/projects/${o.id}`" class="panel opp">
              <span class="opp__icon"><AIcon name="sparkles" :size="16" /></span>
              <span class="opp__body">
                <strong>{{ o.title }}</strong>
                <small>{{ o.typeLabel }} · کارفرما: {{ o.clientName }}</small>
              </span>
              <span v-if="o.budgetMax" class="opp__price">{{ formatTomanCompact(o.budgetMax) }}</span>
            </NuxtLink>
            <AEmptyState
              v-if="!opportunities.length"
              icon="compass"
              title="فعلاً فرصت بازی نیست"
              description="پروژه‌های منتشرشده همین‌جا ظاهر می‌شوند؛ منتظر بمان یا در بازار پروژه‌ها فعال باش."
            >
              <AButton to="/jobs" size="sm">بازار پروژه‌ها</AButton>
            </AEmptyState>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1rem; display: grid; gap: 0.6rem; }
.dash__switch { min-height: 2.6rem; }
.dash__seg { max-width: 15rem; }

.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
@media (max-width: 560px) { .stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.stat { display: grid; gap: 0.15rem; padding: 0.9rem 1rem; }
.stat__n { font-size: clamp(1.2rem, 4.5vw, 1.6rem); font-weight: 900; }
.stat__l { font-size: 0.64rem; font-weight: 700; color: var(--muted); }

.sec { margin-top: var(--sp-6); display: grid; gap: 0.8rem; }
.sec__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.sec__t { font-size: var(--fs-lg); font-weight: 900; }
.sec__link { display: inline-flex; align-items: center; gap: 0.3rem; font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.sec__link:hover { color: var(--ink); }

.dash__list { display: grid; gap: 0.55rem; }

.opp { display: flex; align-items: center; gap: 0.75rem; padding: 0.8rem 1rem; }
.opp__icon {
  width: 2.3rem; height: 2.3rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--bg-deep);
  color: var(--indigo);
  flex-shrink: 0;
}
.opp__body { display: grid; gap: 0.1rem; min-width: 0; flex: 1; }
.opp__body strong { font-size: var(--fs-small); font-weight: 900; overflow-wrap: anywhere; }
.opp__body small { font-size: 0.66rem; color: var(--muted); }
.opp__price { font-size: var(--fs-caption); font-weight: 900; color: var(--coral-deep); flex-shrink: 0; }
</style>
