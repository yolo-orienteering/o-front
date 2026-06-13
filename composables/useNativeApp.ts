import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Minimum native app version (Android versionCode / iOS CFBundleVersion) the frontend
 * accepts. Any o-mate native wrapper below this is force-updated via a blocking overlay
 * (see components/AppUpdateGate.vue). Bump this deliberately — only when a release truly
 * requires it — and keep it in sync with the native apps' versions.
 */
const MIN_REQUIRED_APP_VERSION = 2

/** Store listings for the o-mate apps. */
const PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=ch.seccom.omate'
// TODO: replace <APPLE_APP_ID> with the numeric App Store ID (e.g. id1234567890)
// from App Store Connect / the public App Store listing.
const APP_STORE_URL = 'https://apps.apple.com/app/id<APPLE_APP_ID>'

/**
 * Detects whether the web app is running inside the o-mate native wrapper (iOS / Android)
 * and which version, so the frontend can force an app update when it's too old. Recent
 * apps advertise themselves in the User-Agent as `o-mate-app/<version>`.
 *
 * Gating is by app capability, NOT by device: a normal browser — mobile or desktop —
 * is never gated.
 */
export function useNativeApp() {
  const $q = useQuasar()
  const userAgent = ref('')
  // Only evaluate on the client — `navigator` doesn't exist during SSR, and deferring to
  // onMounted keeps the initial client render identical to the server render (no hydration
  // mismatch). Until resolved nothing is gated, so the overlay never flashes in a browser.
  const resolved = ref(false)

  onMounted(() => {
    userAgent.value = navigator.userAgent || ''
    resolved.value = true
  })

  /** Native app version from the `o-mate-app/<version>` UA marker, or null if not present. */
  const appVersion = computed<number | null>(() => {
    const match = userAgent.value.match(/o-mate-app\/(\d+)/i)
    return match ? parseInt(match[1], 10) : null
  })

  /**
   * True when running inside an o-mate native wrapper that predates the `o-mate-app/`
   * marker. The old iOS app tags its UA with `WePublish/`; the old Android app uses a stock
   * Android WebView UA (contains the `wv` token). Standalone mobile browsers do NOT carry
   * the `wv` token, so they are never matched here. Note that other Android in-app browsers
   * (e.g. Facebook/Instagram) DO carry `wv` and are intentionally treated as old wrappers.
   */
  const isLegacyApp = computed(
    () =>
      /WePublish\//i.test(userAgent.value) || /;\s*wv\)/i.test(userAgent.value)
  )

  const isNativeApp = computed(
    () => appVersion.value !== null || isLegacyApp.value
  )

  /**
   * Best-effort platform, used to pick the right app store. OS detection comes from
   * Quasar's `$q.platform`; we keep the `WePublish/` override so the legacy iOS wrapper is
   * always treated as iOS even if its WebView UA wouldn't otherwise classify as such.
   */
  const platform = computed<'ios' | 'android' | 'other'>(() => {
    if ($q.platform.is.ios || /WePublish\//i.test(userAgent.value)) return 'ios'
    if ($q.platform.is.android) return 'android'
    return 'other'
  })

  /** Store listing URL for the current platform, or null in a desktop browser. */
  const storeUrl = computed<string | null>(() => {
    if (platform.value === 'ios') return APP_STORE_URL
    if (platform.value === 'android') return PLAY_STORE_URL
    return null
  })

  /**
   * Whether the running native app is too old and must be updated. Stays false until the
   * UA is resolved on the client, and is always false in a normal browser (mobile/desktop).
   */
  const updateRequired = computed<boolean>(() => {
    if (!resolved.value) return false
    // Marker-bearing app: gate on the advertised version.
    if (appVersion.value !== null)
      return appVersion.value < MIN_REQUIRED_APP_VERSION
    // Any native wrapper without the marker (old iOS / old or other Android webview).
    if (isLegacyApp.value) return true
    // Normal browser — never gated.
    return false
  })

  return {
    resolved,
    isNativeApp,
    appVersion,
    platform,
    storeUrl,
    updateRequired
  }
}
