// ─────────────────────────────────────────────────────────────
// چرخه‌ی حیات پروژه — وضعیت‌ها، برچسب‌ها و گذارهای مجاز
// هم سرور (اعتبارسنجی گذار) هم UI (برچسب/رنگ) از همین فایل می‌خوانند.
// ─────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'
  | 'published'
  | 'receiving'
  | 'in_progress'
  | 'revision_requested'
  | 'ready_for_approval'
  | 'completed'
  | 'cancelled'

export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'پیش‌نویس',
  published: 'منتشرشده',
  receiving: 'در حال دریافت پیشنهاد',
  in_progress: 'در حال انجام',
  revision_requested: 'اصلاحیه درخواست شد',
  ready_for_approval: 'آماده‌ی تأیید',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
}

/** tone برای ATag */
export const projectStatusTones: Record<ProjectStatus, 'neutral' | 'indigo' | 'amber' | 'green' | 'coral'> = {
  draft: 'neutral',
  published: 'indigo',
  receiving: 'indigo',
  in_progress: 'amber',
  revision_requested: 'coral',
  ready_for_approval: 'green',
  completed: 'green',
  cancelled: 'coral',
}

/** آیا پروژه در فاز جذب پیشنهاد است؟ */
export function isHiring(status: ProjectStatus): boolean {
  return status === 'published' || status === 'receiving'
}

/** گذارهای مجاز — سرور تنها مکانِ اجرای آن‌هاست */
export const allowedTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ['published', 'cancelled'],
  published: ['receiving', 'cancelled'],
  receiving: ['in_progress', 'cancelled'],
  in_progress: ['ready_for_approval', 'cancelled'],
  revision_requested: ['ready_for_approval', 'cancelled'],
  ready_for_approval: ['revision_requested', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return allowedTransitions[from].includes(to)
}
