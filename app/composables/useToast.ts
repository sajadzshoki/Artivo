// ─────────────────────────────────────────────────────────────
// useToast · سیستم اعلان سراسری
// ─────────────────────────────────────────────────────────────
export interface Toast {
  id: number
  type: 'success' | 'error' | 'info'
  title: string
  desc?: string
}

let seq = 0

export function useToast() {
  const toasts = useState<Toast[]>('artivo-toasts', () => [])

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function push(type: Toast['type'], title: string, desc?: string) {
    const id = ++seq
    toasts.value = [...toasts.value.slice(-2), { id, type, title, desc }]
    if (import.meta.client) setTimeout(() => dismiss(id), 4200)
    return id
  }

  return {
    toasts,
    dismiss,
    success: (title: string, desc?: string) => push('success', title, desc),
    error: (title: string, desc?: string) => push('error', title, desc),
    info: (title: string, desc?: string) => push('info', title, desc),
  }
}
