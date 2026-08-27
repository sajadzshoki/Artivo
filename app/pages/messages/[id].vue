<script setup lang="ts">
import type { FileAttachment } from '#shared/types'
import { useThread } from '~/composables/useConversations'

// ─────────────────────────────────────────────────────────────
// صفحه‌ی گفتگو — حباب‌ها، پیوست، تایپ هم‌صحبت، وضعیت خواندن
// ارسال امیدوارکُننده · polling در composable (لایه‌ی transport جداست
// و در فاز WebSocket فقط همان لایه عوض می‌شود)
// ─────────────────────────────────────────────────────────────
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const threadId = String(route.params.id)
const { user } = useAuth()
const toast = useToast()

const { thread, error, sending, send, notifyTyping, refresh } = useThread(threadId)

const timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' })

// ── کمپوزر ──
const draft = ref('')
const files = ref<{ name: string; url: string; size: number }[]>([])
const bodyEl = ref<HTMLTextAreaElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function autoGrow() {
  const el = bodyEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function onType() {
  autoGrow()
  notifyTyping()
}

function pickFiles() {
  fileInput.value?.click()
}

function onFiles(e: Event) {
  const list = (e.target as HTMLInputElement).files
  if (!list) return
  for (const file of Array.from(list)) {
    if (files.value.length >= 4) {
      toast.error('حداکثر ۴ فایل در هر پیام')
      break
    }
    if (file.size > 500 * 1024) {
      toast.error('فایل بزرگ است', `«${file.name}» بزرگ‌تر از ۵۰۰ کیلوبایت است.`)
      continue
    }
    const reader = new FileReader()
    reader.onload = () => {
      files.value = [...files.value, { name: file.name, url: String(reader.result), size: file.size }]
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeFile(i: number) {
  files.value = files.value.filter((_, k) => k !== i)
}

async function doSend() {
  const text = draft.value.trim()
  if (!text && !files.value.length) return
  const payload = files.value
  draft.value = ''
  files.value = []
  await nextTick()
  autoGrow()
  try {
    await send(text, payload)
  }
  catch (err: unknown) {
    toast.error('پیام ارسال نشد', (err as { data?: { message?: string } })?.data?.message)
  }
}

// ── اسکرول چسبان به پایین ──
const scroller = ref<HTMLElement | null>(null)
const stickToBottom = ref(true)
function onScroll() {
  const el = scroller.value
  if (!el) return
  stickToBottom.value = el.scrollHeight - el.scrollTop - el.clientHeight < 120
}
watch(() => thread.value?.messages.length, async () => {
  await nextTick()
  const el = scroller.value
  if (el && stickToBottom.value) el.scrollTop = el.scrollHeight
})
onMounted(() => {
  void refresh()
  setTimeout(() => {
    const el = scroller.value
    if (el) el.scrollTop = el.scrollHeight
  }, 300)
  // کیبورد موبایل: با باز/بسته شدن، اگر کاربر پایین چسبیده بمان
  const vv = window.visualViewport
  if (vv) {
    vv.addEventListener('resize', onVVResize)
    vv.addEventListener('scroll', onVVResize)
  }
})
onUnmounted(() => {
  const vv = window.visualViewport
  if (vv) {
    vv.removeEventListener('resize', onVVResize)
    vv.removeEventListener('scroll', onVVResize)
  }
})
function onVVResize() {
  if (!stickToBottom.value) return
  const el = scroller.value
  if (el) requestAnimationFrame(() => { el.scrollTop = el.scrollHeight })
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yest = new Date(today.getTime() - 86400000)
  if (d.toDateString() === today.toDateString()) return 'امروز'
  if (d.toDateString() === yest.toDateString()) return 'دیروز'
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(d)
}

const showFile = ref<FileAttachment | null>(null)

const peerName = computed(() => thread.value?.peers[0]?.name ?? 'گفتگو')
useHead(() => ({ title: `${peerName.value} — گفتگو | آرتیوو` }))
</script>

<template>
  <div class="th">
    <!-- سربرگ -->
    <header class="th__bar">
      <NuxtLink to="/messages" class="th__back" aria-label="بازگشت به گفتگوها">
        <AIcon name="arrow-right" :size="18" />
      </NuxtLink>
      <div class="th__who">
        <strong class="th__name">{{ peerName }}</strong>
        <span v-if="thread?.peerTyping" class="th__typing-inline" aria-live="polite">در حال نوشتن…</span>
        <span v-else-if="thread?.projectTitle" class="th__project">
          <AIcon name="briefcase" :size="11" />
          {{ thread.projectTitle }}
        </span>
      </div>
      <NuxtLink v-if="thread?.projectId" :to="`/projects/${thread.projectId}`" class="th__toproject">
        <AIcon name="briefcase" :size="15" />
        <span class="th__toproject-label">پروژه</span>
      </NuxtLink>
    </header>

    <!-- پیام‌ها -->
    <div ref="scroller" class="th__scroll" @scroll="onScroll">
      <div class="th__inner">
        <div v-if="!thread && !error" class="th__loading">
          <div v-for="i in 4" :key="i" class="th__skel" :class="{ 'th__skel--mine': i % 2 === 0 }" />
        </div>

        <AEmptyState
          v-else-if="error"
          class="th__err"
          icon="info"
          title="گفتگو در دسترس نیست"
          description="ممکن است حذف شده یا دسترسی نداشته باشی."
        >
          <AButton to="/messages" size="sm">بازگشت</AButton>
        </AEmptyState>

        <AEmptyState
          v-else-if="thread && thread.messages.length === 0"
          class="th__err"
          icon="send"
          title="گفتگو را شروع کن"
          description="اولین پیام را بفرست؛ درباره‌ی پروژه هم‌راستا بمانیم."
        />

        <template v-for="(m, i) in thread?.messages ?? []" :key="m.id">
          <div
            v-if="i === 0 || new Date(m.at).toDateString() !== new Date(thread!.messages[i - 1]!.at).toDateString()"
            class="dayline"
          >
            <span>{{ dayLabel(m.at) }}</span>
          </div>

          <div class="row" :class="{ 'row--mine': m.from === user?.id || m.from === '__me__' }">
            <div class="bubble" :class="{ 'bubble--pending': m.id.startsWith('tmp-') }">
              <p v-if="m.body" class="bubble__text">{{ m.body }}</p>
              <div v-if="m.files.length" class="bubble__files">
                <button v-for="f in m.files" :key="f.id" type="button" class="bubble__file" @click="showFile = f">
                  <img v-if="f.url.startsWith('data:image')" :src="f.url" :alt="f.name" loading="lazy">
                  <span v-else class="bubble__fileicon"><AIcon name="file" :size="16" /></span>
                </button>
              </div>
              <span class="bubble__meta">
                <time>{{ timeFmt.format(new Date(m.at)) }}</time>
                <AIcon
                  v-if="m.from === user?.id"
                  name="check"
                  :size="12"
                  :class="m.readAt ? 'bubble__read' : 'bubble__sent'"
                  :aria-label="m.readAt ? 'خوانده شد' : 'ارسال شد'"
                />
              </span>
            </div>
          </div>
        </template>

        <!-- تایپ هم‌صحبت -->
        <div v-if="thread?.peerTyping" class="row typingrow" aria-live="polite">
          <div class="bubble bubble--typing">
            <i /><i /><i />
            <span class="sr-only">{{ peerName }} در حال نوشتن است</span>
          </div>
        </div>
      </div>
    </div>

    <!-- کمپوزر -->
    <footer class="composer">
      <div v-if="files.length" class="composer__files">
        <span v-for="(f, i) in files" :key="f.url.slice(-16)" class="composer__file">
          <img v-if="f.url.startsWith('data:image')" :src="f.url" :alt="f.name">
          <span v-else class="composer__fileicon"><AIcon name="file" :size="14" /></span>
          <button type="button" :aria-label="`حذف ${f.name}`" @click="removeFile(i)">
            <AIcon name="x" :size="10" />
          </button>
        </span>
      </div>
      <div class="composer__row">
        <button type="button" class="composer__clip" aria-label="پیوست فایل" @click="pickFiles">
          <AIcon name="paperclip" :size="19" />
        </button>
        <input ref="fileInput" type="file" accept="image/*,application/pdf,.zip" multiple hidden @change="onFiles">
        <textarea
          ref="bodyEl"
          v-model="draft"
          class="composer__input"
          rows="1"
          placeholder="پیام…"
          enterkeyhint="send"
          @keydown.enter.exact.prevent="doSend"
          @input="onType"
        />
        <button
          type="button"
          class="composer__send"
          :disabled="sending || (!draft.trim() && !files.length)"
          aria-label="ارسال پیام"
          @click="doSend"
        >
          <AIcon name="send" :size="18" />
        </button>
      </div>
    </footer>

    <!-- پیش‌نمایش فایل -->
    <AModal :model-value="showFile !== null" :title="showFile?.name ?? 'فایل'" size="lg" @update:model-value="(v: boolean) => { if (!v) showFile = null }">
      <div v-if="showFile" class="fileview">
        <img v-if="showFile.url.startsWith('data:image')" :src="showFile.url" :alt="showFile.name">
        <div v-else class="fileview__generic"><AIcon name="file" :size="40" /></div>
        <a :href="showFile.url" :download="showFile.name" class="fileview__dl">
          <AIcon name="download" :size="15" />
          دانلود فایل
        </a>
      </div>
    </AModal>
  </div>
</template>

<style scoped>
.th {
  position: fixed;
  inset: 0;
  height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--bg);
  z-index: 30;
}

.th__bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: max(0.6rem, env(safe-area-inset-top)) 1rem 0.6rem;
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}
.th__back {
  width: 2.5rem; height: 2.5rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  flex-shrink: 0;
}
.th__who { display: grid; gap: 0.05rem; min-width: 0; flex: 1; }
.th__name { font-size: var(--fs-md); font-weight: 900; }
.th__project {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.64rem;
  font-weight: 800;
  color: var(--indigo-deep);
}
.th__typing-inline { font-size: 0.64rem; color: var(--coral-deep); font-weight: 700; }
.th__toproject {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  flex-shrink: 0;
  background: var(--paper);
}

.th__scroll { overflow-y: auto; overscroll-behavior: contain; }
.th__inner {
  max-width: 44rem;
  margin-inline: auto;
  padding: 1rem clamp(0.7rem, 3vw, 1.2rem) 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.th__loading { display: grid; gap: 0.5rem; }
.th__skel { height: 2.6rem; width: 60%; border-radius: var(--r-lg); background: var(--bg-deep); animation: pulse 1.4s ease-in-out infinite; }
.th__skel--mine { margin-inline-start: auto; }
.th__err { padding-block: 2rem; width: 100%; }

.dayline {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-block: 0.6rem;
  color: var(--faint);
  font-size: 0.64rem;
  font-weight: 800;
}
.dayline::before, .dayline::after { content: ''; flex: 1; height: 1px; background: var(--line); }

.row { display: flex; justify-content: flex-start; }
/* پیام من در سمت مقابل (منطقی — در RTL چپ، در LTR راست) */
.row--mine { justify-content: flex-end; }

.bubble {
  max-width: min(80%, 26rem);
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 0.55rem 0.75rem 0.28rem;
  display: grid;
  gap: 0.35rem;
  animation: bubble-in 0.25s var(--ease-out) both;
}
.row--mine .bubble { background: var(--ink); border-color: var(--ink); color: var(--bg); border-end-end-radius: var(--r-xs); }
.row:not(.row--mine) .bubble { border-end-start-radius: var(--r-xs); }
.bubble--pending { opacity: 0.6; }

.bubble__text { font-size: var(--fs-small); line-height: 1.9; overflow-wrap: anywhere; white-space: pre-wrap; }
.bubble__files { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.bubble__file img { width: 6.5rem; height: 6.5rem; object-fit: cover; border-radius: var(--r-sm); }
.bubble__fileicon {
  width: 6.5rem; height: 3rem;
  display: grid; place-items: center;
  background: color-mix(in srgb, var(--bg-deep) 55%, transparent);
  border-radius: var(--r-sm);
}
.bubble__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  font-size: 0.63rem;
  opacity: 0.75;
}
.bubble__read { color: var(--green); }
.row--mine .bubble__read { color: color-mix(in srgb, var(--coral) 70%, white); }
.bubble__sent { opacity: 0.6; }

@keyframes bubble-in {
  from { opacity: 0; transform: translateY(6px) scale(0.98); }
  to { opacity: 1; transform: none; }
}

.typingrow .bubble--typing {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  padding: 0.7rem 0.8rem;
}
.bubble--typing i {
  width: 0.4rem; height: 0.4rem;
  border-radius: 99px;
  background: var(--muted);
  animation: blink 1.2s infinite;
}
.bubble--typing i:nth-child(2) { animation-delay: 0.2s; }
.bubble--typing i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink { 0%, 60%, 100% { opacity: 0.3; transform: none; } 30% { opacity: 1; transform: translateY(-2px); } }

.sr-only {
  position: absolute;
  width: 1px; height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.composer {
  border-top: 1px solid var(--line);
  background: var(--paper);
  padding: 0.6rem clamp(0.7rem, 3vw, 1.2rem) max(0.6rem, env(safe-area-inset-bottom));
}
.composer__files { display: flex; gap: 0.4rem; margin-bottom: 0.45rem; flex-wrap: wrap; }
.composer__file { position: relative; }
.composer__file img { width: 3rem; height: 3rem; object-fit: cover; border-radius: var(--r-sm); }
.composer__fileicon {
  width: 3rem; height: 3rem;
  display: grid; place-items: center;
  background: var(--bg-deep);
  border-radius: var(--r-sm);
}
.composer__file button {
  position: absolute;
  top: -0.35rem;
  inset-inline-end: -0.35rem;
  width: 1.3rem; height: 1.3rem;
  display: grid; place-items: center;
  background: var(--ink);
  color: var(--bg);
  border-radius: 99px;
}
.composer__row { display: flex; align-items: flex-end; gap: 0.45rem; }
.composer__clip {
  width: 2.7rem; height: 2.7rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.composer__input {
  flex: 1;
  min-width: 0;
  resize: none;
  border: 1px solid var(--line-strong);
  background: var(--bg);
  border-radius: var(--r-lg);
  padding: 0.65rem 0.9rem;
  font: inherit;
  font-size: var(--fs-small);
  line-height: 1.7;
  max-height: 120px;
}
.composer__input:focus { outline: none; border-color: var(--ink); }
.composer__send {
  width: 2.7rem; height: 2.7rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
  flex-shrink: 0;
  transition: transform 0.15s, opacity 0.15s;
}
.composer__send:active { transform: scale(0.92); }
.composer__send:disabled { opacity: 0.4; }

.fileview { display: grid; gap: 0.8rem; justify-items: center; }
.fileview img { max-width: 100%; max-height: 55vh; border-radius: var(--r-md); }
.fileview__generic { padding: 3rem; color: var(--faint); }
.fileview__dl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  border: 1px solid var(--coral);
  border-radius: var(--r-pill);
  padding: 0.5rem 1rem;
}
</style>
