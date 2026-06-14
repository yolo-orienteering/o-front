import { computed } from 'vue'

/**
 * Small sharing helper shared by the race share button (`components/races/ShareRaceBtn.vue`)
 * and the calendar how-to page (`pages/calendar-setup.vue`).
 *
 * WhatsApp and e-mail have stable share URLs (`wa.me`, `mailto:`). **Signal does NOT expose a
 * public share-URL scheme**, so the only reliable way to reach it is the **Web Share API**
 * (`navigator.share`), which opens the OS share sheet where Signal/Telegram/… appear.
 * `canNativeShare` reflects whether that API is usable on the current device.
 *
 * Callers are expected to render in a client-only context; the `typeof navigator` guard keeps
 * it SSR-safe regardless.
 */
export function useShareLink() {
  const canNativeShare = computed<boolean>(
    () =>
      typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  )

  /** Open the OS share sheet (the path to Signal & co). No-op if unsupported. */
  async function nativeShare(
    url: string,
    opts: { title?: string; text?: string } = {}
  ): Promise<void> {
    if (!canNativeShare.value || !url) return
    try {
      await navigator.share({ url, title: opts.title, text: opts.text })
    } catch {
      // User dismissed the share sheet or it failed — nothing to do.
    }
  }

  /** WhatsApp deep link with the URL (and optional leading text) pre-filled. */
  function whatsappHref(url: string, text?: string): string {
    const message = text ? `${text} ${url}` : url
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }

  /** `mailto:` link with the URL placed in the body (after an optional intro). */
  function mailtoHref(url: string, subject?: string, body?: string): string {
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    params.set('body', body ? `${body}\n\n${url}` : url)
    return `mailto:?${params.toString()}`
  }

  return { canNativeShare, nativeShare, whatsappHref, mailtoHref }
}
