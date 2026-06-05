/**
 * Copy text to the clipboard, with a fallback for non-secure contexts.
 *
 * `navigator.clipboard` only exists in a secure context (HTTPS or localhost). In the Android
 * dev WebView the app is served over plain HTTP on a LAN IP, where `navigator.clipboard` is
 * `undefined` — so we fall back to a hidden <textarea> + `document.execCommand('copy')`,
 * which also covers older WebViews. Must be called from a user gesture (e.g. a click).
 *
 * Throws if the copy ultimately fails, so callers can show an error.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, text.length)
  try {
    const ok = document.execCommand('copy')
    if (!ok) throw new Error('Copy command was rejected')
  } finally {
    document.body.removeChild(textarea)
  }
}
