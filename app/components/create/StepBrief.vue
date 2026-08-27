<script setup lang="ts">
// گام ۵ — محتوا و بریف
import { uid, fileSizeLabel } from '#shared/utils/format'

const { state } = useProjectRequest()
const toast = useToast()

const fileInput = ref<HTMLInputElement | null>(null)

function pickFiles() { fileInput.value?.click() }

function onFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) {
    if (state.value.brief.files.length >= 6) {
      toast.error('حداکثر ۶ فایل', 'برای مرحله‌ی اول همین کافی است.')
      break
    }
    state.value.brief.files.push({ id: uid(), name: f.name, size: f.size })
  }
  toast.success('فایل اضافه شد', 'فایل‌ها پس از ثبت پروژه بارگذاری می‌شوند.')
  ;(e.target as HTMLInputElement).value = ''
}

function removeFile(id: string) {
  state.value.brief.files = state.value.brief.files.filter(f => f.id !== id)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer?.files.length) {
    const fake = { target: { files: e.dataTransfer.files, value: '' } } as unknown as Event
    onFiles(fake)
  }
}
</script>

<template>
  <div class="brief">
    <header class="s-head">
      <h2 class="t-h1">بریف بنویس</h2>
      <p class="t-body">هرچه دقیق‌تر بنویسی، پیشنهادهای خلاق‌ها دقیق‌تر می‌شود.</p>
    </header>

    <AInput
      v-model="state.brief.mainText"
      label="متن اصلی روی اثر"
      required
      placeholder="مثلاً: جشنواره‌ی موسیقی رها — ۱۲ و ۱۳ مهر"
      hint="عنوان یا پیامی که باید در طرح دیده شود."
      :maxlength="140"
      counter
    />

    <ATextarea
      v-model="state.brief.description"
      label="توضیح پروژه"
      required
      :rows="5"
      :maxlength="1200"
      counter
      placeholder="درباره‌ی برند یا رویداد، حس موردنظر، مخاطب و کاربرد نهایی طرح بنویس…"
      hint="حداقل ۲۰ کاراکتر — جزئیات بیشتر، نتیجه‌ی بهتر."
    />

    <ATextarea
      v-model="state.brief.requirements"
      label="نکات مهم و الزامات"
      :rows="3"
      :maxlength="500"
      counter
      placeholder="مثلاً: حتماً لوگوی اسپانسر باشد، رنگ سازمانی قرمز است، خروجی برای چاپ بنر ۳×۶…"
      hint="اختیاری"
    />

    <!-- فایل‌های مرجع -->
    <div>
      <p class="brief__label">فایل‌های مرجع</p>
      <button
        type="button"
        class="drop"
        @click="pickFiles"
        @dragover.prevent
        @drop="onDrop"
      >
        <AIcon name="upload" :size="22" />
        <span class="drop__t">تصویر یا فایل مرجع را اینجا رها کن</span>
        <span class="drop__s">یا برای انتخاب کلیک کن — حداکثر ۶ فایل</span>
      </button>
      <input ref="fileInput" type="file" multiple accept="image/*,.pdf,.zip" class="visually-hidden" @change="onFiles">

      <TransitionGroup v-if="state.brief.files.length" name="file" tag="ul" class="files">
        <li v-for="f in state.brief.files" :key="f.id" class="file">
          <AIcon name="file" :size="16" class="file__icon" />
          <span class="file__name">{{ f.name }}</span>
          <span class="file__size">{{ fileSizeLabel(f.size) }}</span>
          <button type="button" class="file__del" aria-label="حذف فایل" @click="removeFile(f.id)">
            <AIcon name="trash" :size="15" />
          </button>
        </li>
      </TransitionGroup>
    </div>

    <!-- لینک‌های مرجع -->
    <fieldset class="links">
      <legend class="brief__label">لینک‌های مرجع <span class="t-caption">(اختیاری)</span></legend>
      <AInput v-model="state.brief.links.instagram" dir="ltr" icon="instagram" inputmode="url" placeholder="instagram.com/…" />
      <AInput v-model="state.brief.links.pinterest" dir="ltr" icon="link" inputmode="url" placeholder="pinterest.com/…" />
      <AInput v-model="state.brief.links.website" dir="ltr" icon="globe" inputmode="url" placeholder="https://…" />
    </fieldset>
  </div>
</template>

<style scoped>
.brief { display: grid; gap: 1.25rem; }
.s-head { display: grid; gap: 0.4rem; margin-bottom: 0.2rem; }

.brief__label { font-size: var(--fs-small); font-weight: 800; }

.drop {
  margin-top: 0.5rem;
  width: 100%;
  display: grid;
  justify-items: center;
  gap: 0.15rem;
  padding: 1.6rem 1rem;
  border: 1.5px dashed var(--line-strong);
  border-radius: var(--r-md);
  background: var(--paper);
  color: var(--muted);
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.drop:hover { border-color: var(--coral); color: var(--coral-deep); background: var(--coral-soft); }
.drop__t { font-size: var(--fs-small); font-weight: 800; color: inherit; }
.drop__s { font-size: var(--fs-caption); opacity: 0.8; }

.files { display: grid; gap: 0.4rem; margin-top: 0.6rem; }
.file {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  padding: 0.55rem 0.8rem;
}
.file__icon { color: var(--indigo); flex-shrink: 0; }
.file__name {
  font-size: var(--fs-caption);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  direction: ltr;
}
.file__size { font-size: var(--fs-caption); color: var(--faint); flex-shrink: 0; }
.file__del {
  margin-inline-start: auto;
  width: 1.9rem; height: 1.9rem;
  display: grid; place-items: center;
  border-radius: 99px;
  color: var(--muted);
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}
.file__del:hover { background: var(--coral-soft); color: var(--coral-deep); }

.file-enter-active { transition: all 0.3s var(--ease-out); }
.file-leave-active { transition: all 0.2s ease-in; }
.file-enter-from { opacity: 0; transform: translateY(6px); }
.file-leave-to { opacity: 0; transform: translateX(-8px); }

.links { display: grid; gap: 0.6rem; border: none; padding: 0; margin: 0; }
.links legend { margin-bottom: 0.2rem; padding: 0; }
</style>
