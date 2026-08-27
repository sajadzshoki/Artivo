<script setup lang="ts">
import type { AdminCollectionDef, AdminFieldDef } from '#shared/config/admin-collections'
import { formatTomanCompact } from '#shared/utils/format'
import { creatives } from '#shared/data/content'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// ─────────────────────────────────────────────────────────────
// CollectionManager · مدیریت عمومی کالکشن‌های ادمین
// فهرست ادیتوریال + فرم مودالِ اسکیمامحور + خطاهای صریح
// ─────────────────────────────────────────────────────────────
const props = defineProps<{ def: AdminCollectionDef }>()

const toast = useToast()

const items = ref<Record<string, any>[]>([])
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const deleting = ref(false)
const showForm = ref(false)
const showDelete = ref(false)
const editingId = ref<string | null>(null)
const deleteTarget = ref<Record<string, any> | null>(null)
const form = ref<Record<string, any>>({})
const formErrors = ref<Record<string, string>>({})

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<{ items: Record<string, any>[] }>(`/api/admin/collections/${props.def.id}`)
    items.value = res.items
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    loadError.value = e?.data?.message ?? 'بارگذاری ناموفق بود.'
  }
  finally {
    loading.value = false
  }
}
onMounted(load)

// ── گزینه‌های select داینامیک ──
function optionsFor(f: AdminFieldDef) {
  if (f.options?.length) return f.options
  if (f.key === 'creativeId') return creatives.map(c => ({ value: c.id, label: c.name }))
  if (f.key === 'category') return Object.entries(serviceCategoryLabels).map(([value, label]) => ({ value, label }))
  return []
}

function openCreate() {
  editingId.value = null
  form.value = {}
  for (const f of props.def.fields) {
    form.value[f.key] = f.type === 'boolean' ? (f.key === 'visible' || f.key === 'active')
      : f.type === 'colors' || f.type === 'tags' ? []
        : f.key === 'id' ? '' : ''
  }
  formErrors.value = {}
  showForm.value = true
}

function openEdit(item: Record<string, any>) {
  editingId.value = item.id
  form.value = {}
  for (const f of props.def.fields) form.value[f.key] = item[f.key] ?? (f.type === 'colors' || f.type === 'tags' ? [] : f.type === 'boolean' ? false : '')
  formErrors.value = {}
  showForm.value = true
}

function fieldLabel(f: AdminFieldDef) { return f.label }

function validate(): boolean {
  formErrors.value = {}
  for (const f of props.def.fields) {
    if (!f.required) continue
    const v = form.value[f.key]
    if (f.type === 'boolean') continue
    if (f.type === 'colors' || f.type === 'tags') {
      if (!Array.isArray(v) || !v.length) formErrors.value[f.key] = `${fieldLabel(f)} لازم است.`
      continue
    }
    if (v === undefined || v === null || String(v).trim() === '') formErrors.value[f.key] = `${fieldLabel(f)} لازم است.`
  }
  for (const f of props.def.fields) {
    if (f.type === 'number' || f.type === 'money') {
      const v = form.value[f.key]
      if (v === '' || v === null || v === undefined) continue
      const n = Number(v)
      if (!Number.isFinite(n)) formErrors.value[f.key] = 'عدد معتبر وارد کن.'
      else if (f.min !== undefined && n < f.min) formErrors.value[f.key] = `حداقل ${f.min}`
      else if (f.max !== undefined && n > f.max) formErrors.value[f.key] = `حداکثر ${f.max}`
    }
  }
  return Object.keys(formErrors.value).length === 0
}

async function save() {
  if (!validate()) return
  saving.value = true
  try {
    if (editingId.value) {
      await $fetch(`/api/admin/collections/${props.def.id}/${editingId.value}`, { method: 'PUT', body: form.value })
    }
    else {
      await $fetch(`/api/admin/collections/${props.def.id}`, { method: 'POST', body: form.value })
    }
    showForm.value = false
    toast.success(editingId.value ? 'ذخیره شد' : 'ایتم اضافه شد')
    await load()
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    const field = e?.data?.data?.field
    if (field) formErrors.value[field] = e?.data?.message ?? ''
    else toast.error('ذخیره نشد', e?.data?.message)
  }
  finally {
    saving.value = false
  }
}

function askDelete(item: Record<string, any>) {
  deleteTarget.value = item
  showDelete.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/collections/${props.def.id}/${deleteTarget.value.id}`, { method: 'DELETE' })
    showDelete.value = false
    toast.success('حذف شد')
    await load()
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    toast.error('حذف نشد', e?.data?.message)
  }
  finally {
    deleting.value = false
  }
}

// ── نمایش خلاصه‌ی آیتم ──
function subtitleOf(item: Record<string, any>): string {
  const parts: string[] = []
  for (const f of props.def.fields) {
    if (f.key === props.def.titleKey) continue
    if (f.type === 'boolean' || f.type === 'colors' || f.type === 'tags') continue
    const v = item[f.key]
    if (v === undefined || v === null || v === '') continue
    if (f.type === 'money') parts.push(formatTomanCompact(Number(v)))
    else if (f.type === 'select') parts.push(optionsFor(f).find(o => o.value === v)?.label ?? String(v))
    else parts.push(String(v))
    if (parts.length >= 2) break
  }
  return parts.join(' · ')
}

function flagsOf(item: Record<string, any>) {
  const out: { label: string; tone: 'green' | 'amber' | 'coral' | 'indigo' }[] = []
  for (const f of props.def.fields) {
    if (f.type !== 'boolean') continue
    if (item[f.key] === true) {
      out.push({ label: f.label, tone: f.key === 'visible' || f.key === 'active' ? 'green' : f.key === 'hidden' ? 'coral' : 'indigo' })
    }
  }
  return out
}

const tagInput = ref('')
function addTag(f: AdminFieldDef) {
  const t = tagInput.value.trim()
  const arr: string[] = form.value[f.key] ?? []
  if (t && !arr.includes(t)) {
    form.value[f.key] = [...arr, t]
    tagInput.value = ''
  }
}
function removeTag(f: AdminFieldDef, t: string) {
  form.value[f.key] = (form.value[f.key] ?? []).filter((x: string) => x !== t)
}
</script>

<template>
  <div class="cm">
    <header class="cm__head">
      <div>
        <h2 class="cm__title">
          <AIcon :name="def.icon" :size="19" />
          {{ def.label }}
        </h2>
        <p class="cm__desc">{{ def.description }}</p>
      </div>
      <AButton v-if="def.canCreate" size="sm" icon="plus" @click="openCreate">افزودن</AButton>
    </header>

    <!-- خطا -->
    <div v-if="loadError" class="cm__error panel">
      <AIcon name="info" :size="18" />
      <p>{{ loadError }}</p>
      <AButton size="sm" variant="outline" @click="load">تلاش دوباره</AButton>
    </div>

    <div v-else-if="loading" class="cm__list">
      <div v-for="i in 3" :key="i" class="panel" style="padding:1rem">
        <ASkeleton h="2.4rem" radius="12px" />
      </div>
    </div>

    <AEmptyState
      v-else-if="!items.length"
      icon="package"
      :title="`هنوز چیزی در «${def.label}» نیست`"
      :description="def.canCreate ? 'اولین آیتم را اضافه کن.' : 'آیتمی برای مدیریت وجود ندارد.'"
    >
      <AButton v-if="def.canCreate" size="sm" icon="plus" @click="openCreate">افزودن</AButton>
    </AEmptyState>

    <!-- فهرست -->
    <ul v-else class="cm__list">
      <li v-for="it in items" :key="it.id" class="panel cm__item">
        <div class="cm__item-body">
          <strong class="cm__item-title">{{ it[def.titleKey] || it.id }}</strong>
          <span class="cm__item-sub">{{ subtitleOf(it) || '—' }}</span>
        </div>
        <div class="cm__item-side">
          <ATag v-for="fl in flagsOf(it)" :key="fl.label" :label="fl.label" :tone="fl.tone" dot />
          <button type="button" class="cm__btn" aria-label="ویرایش" @click="openEdit(it)">
            <AIcon name="pen" :size="15" />
          </button>
          <button v-if="def.canDelete" type="button" class="cm__btn cm__btn--danger" aria-label="حذف" @click="askDelete(it)">
            <AIcon name="trash" :size="15" />
          </button>
        </div>
      </li>
    </ul>

    <!-- فرم -->
    <AModal v-model="showForm" :title="editingId ? `ویرایش «${def.label}»` : `افزودن به «${def.label}»`" size="md">
      <div class="cm__form">
        <template v-for="f in def.fields" :key="f.key">
          <!-- شناسه فقط هنگام ساخت -->
          <AInput
            v-if="f.type === 'text' && !(f.key === 'id' && editingId)"
            v-model="form[f.key]"
            :label="f.label"
            :hint="f.hint"
            :error="formErrors[f.key]"
            :dir="f.key === 'id' ? 'ltr' : undefined"
          />
          <AInput
            v-else-if="f.type === 'number' || f.type === 'money'"
            v-model="form[f.key]"
            :label="f.label"
            dir="ltr"
            inputmode="numeric"
            :hint="f.hint"
            :error="formErrors[f.key]"
          />
          <ATextarea
            v-else-if="f.type === 'textarea'"
            v-model="form[f.key]"
            :label="f.label"
            :hint="f.hint"
            :error="formErrors[f.key]"
            :rows="3"
          />
          <ACheck
            v-else-if="f.type === 'boolean'"
            v-model="form[f.key]"
            :label="f.label"
            :description="f.hint"
          />
          <div v-else-if="f.type === 'select'" class="cm__field">
            <p class="cm__flabel">{{ f.label }}</p>
            <ASelect v-model="form[f.key]" :options="optionsFor(f)" />
            <p v-if="formErrors[f.key]" class="cm__ferr">{{ formErrors[f.key] }}</p>
          </div>
          <div v-else-if="f.type === 'tags'" class="cm__field">
            <AInput v-model="tagInput" :label="f.label" :hint="f.hint" @keydown.enter.prevent="addTag(f)" />
            <div v-if="(form[f.key] ?? []).length" class="cm__tags">
              <span v-for="t in form[f.key]" :key="t" class="cm__tag">
                {{ t }}
                <button type="button" @click="removeTag(f, t)"><AIcon name="x" :size="11" /></button>
              </span>
            </div>
          </div>
          <div v-else-if="f.type === 'colors'" class="cm__field">
            <p class="cm__flabel">{{ f.label }} <small v-if="f.hint">— {{ f.hint }}</small></p>
            <div class="cm__colors">
              <label v-for="(c, i) in (form[f.key] ?? [])" :key="i" class="cm__color">
                <input v-model="form[f.key][i]" type="color">
                <span class="latin">{{ c }}</span>
              </label>
              <button type="button" class="cm__color-add" @click="form[f.key] = [...(form[f.key] ?? []), '#FAF6EF']">
                <AIcon name="plus" :size="14" />
              </button>
              <button
                v-if="(form[f.key] ?? []).length"
                type="button"
                class="cm__color-add cm__color-add--minus"
                @click="form[f.key] = (form[f.key] ?? []).slice(0, -1)"
              >
                <AIcon name="minus" :size="14" />
              </button>
            </div>
            <p v-if="formErrors[f.key]" class="cm__ferr">{{ formErrors[f.key] }}</p>
          </div>
        </template>
      </div>

      <template #footer>
        <AButton variant="outline" @click="showForm = false">انصراف</AButton>
        <AButton :loading="saving" @click="save">ذخیره</AButton>
      </template>
    </AModal>

    <!-- حذف -->
    <AModal v-model="showDelete" title="حذف آیتم" size="sm">
      <p class="t-body">
        «{{ deleteTarget?.[def.titleKey] || deleteTarget?.id }}» حذف شود؟ این عمل قابل بازگشت نیست.
      </p>
      <template #footer>
        <AButton variant="outline" @click="showDelete = false">انصراف</AButton>
        <AButton :loading="deleting" @click="confirmDelete">حذف</AButton>
      </template>
    </AModal>
  </div>
</template>

<style scoped>
.cm { display: grid; gap: 1rem; }
.cm__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.cm__title { display: flex; align-items: center; gap: 0.5rem; font-size: var(--fs-lg); font-weight: 900; }
.cm__title svg { color: var(--coral); }
.cm__desc { font-size: var(--fs-caption); color: var(--muted); margin-top: 0.25rem; }

.cm__error { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; color: var(--coral-deep); }

.cm__list { display: grid; gap: 0.55rem; }
.cm__item { display: flex; align-items: center; gap: 0.9rem; padding: 0.85rem 1rem; }
.cm__item-body { display: grid; gap: 0.15rem; min-width: 0; flex: 1; }
.cm__item-title { font-size: var(--fs-small); font-weight: 900; }
.cm__item-sub { font-size: var(--fs-caption); color: var(--muted); }
.cm__item-side { display: flex; align-items: center; gap: 0.4rem; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

.cm__btn {
  width: 2.1rem; height: 2.1rem;
  display: grid; place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  background: var(--paper);
  color: var(--ink-soft);
  transition: all 0.15s;
}
.cm__btn:hover { border-color: var(--ink); color: var(--ink); }
.cm__btn--danger:hover { border-color: var(--coral); color: var(--coral); }

.cm__form { display: grid; gap: 0.9rem; }
.cm__field { display: grid; gap: 0.4rem; }
.cm__flabel { font-size: var(--fs-small); font-weight: 800; }
.cm__flabel small { color: var(--faint); font-weight: 400; }
.cm__ferr { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.cm__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
.cm__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  font-size: var(--fs-caption);
  font-weight: 800;
  border-radius: var(--r-pill);
  padding: 0.2rem 0.4rem 0.2rem 0.6rem;
}
.cm__tag button { display: grid; place-items: center; width: 1.1rem; height: 1.1rem; border-radius: 99px; background: color-mix(in srgb, var(--indigo-deep) 12%, transparent); }

.cm__colors { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.cm__color {
  display: grid;
  gap: 0.15rem;
  justify-items: center;
  font-size: 0.6rem;
  color: var(--muted);
}
.cm__color input[type='color'] {
  width: 2.4rem; height: 2.4rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding: 2px;
  background: var(--paper);
}
.cm__color-add {
  width: 2.4rem; height: 2.4rem;
  display: grid; place-items: center;
  border: 1px dashed var(--line-strong);
  border-radius: var(--r-sm);
  color: var(--muted);
}
.cm__color-add--minus { border-style: solid; }
</style>
