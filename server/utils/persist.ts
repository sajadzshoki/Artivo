import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ─────────────────────────────────────────────────────────────
// persist · ذخیره‌ی JSON زیر .data/ (فقط برای توسعه/فاندیشن)
// در فاز بک‌اند واقعی، کل این لایه با دیتابیس جایگزین می‌شود.
// ─────────────────────────────────────────────────────────────

const DATA_DIR = resolve(process.cwd(), '.data')
const DATA_FILE = resolve(DATA_DIR, 'artivo.json')

export function loadJson<T>(fallback: T): T {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, 'utf-8')) as T
    }
  }
  catch {
    // فایل خراب — از صفر شروع می‌کنیم
  }
  return fallback
}

export function saveJson(data: unknown): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(data), 'utf-8')
  }
  catch (err) {
    console.error('[store] persist failed:', err)
  }
}
