import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

/**
 * Operating systems we distinguish for the calendar-subscription flow. `other` covers
 * anything we can't confidently classify (e.g. ChromeOS, BSD, unknown UAs).
 */
export type DeviceOs =
  | 'ios'
  | 'android'
  | 'windows'
  | 'macos'
  | 'linux'
  | 'other'

/**
 * OS / form-factor detection used to branch the calendar-subscription UX.
 *
 * iOS, Linux and macOS hand a `webcal://` link straight to the OS, which opens the
 * calendar app and offers to subscribe — so on those we keep the one-click "Kalender
 * verknüpfen" flow. Everywhere else (Windows, Android, …) `webcal://` is unreliable or
 * unsupported, so we route the user to the step-by-step how-to page instead
 * (`pages/calendar-setup.vue`). See `useCalendarSubscription` and the frontend CLAUDE.md.
 *
 * Detection delegates to Quasar's `$q.platform`, which already disambiguates Android from
 * Linux (Android UAs also contain "Linux"), reclassifies iPadOS's desktop UA as iOS, and
 * is SSR-aware. This is intentionally separate from `useNativeApp` (which detects the
 * native wrapper and its version for the force-update gate).
 *
 * We still gate behind `resolved` (set in `onMounted`): callers treat the platform as
 * unknown until the client has hydrated, which avoids flashing the wrong branch.
 */
export function useDevicePlatform() {
  const $q = useQuasar()
  const resolved = ref(false)

  onMounted(() => {
    resolved.value = true
  })

  const os = computed<DeviceOs>(() => {
    const is = $q.platform.is
    // Order matters: Quasar matches `android` before `linux`, so Android never sets
    // `is.linux`; iPadOS's desktop UA is corrected to `is.ios`; ChromeOS is `is.cros`.
    if (is.ios) return 'ios'
    if (is.android) return 'android'
    if (is.win) return 'windows'
    if (is.mac) return 'macos'
    if (is.linux) return 'linux'
    return 'other'
  })

  /** Phone / tablet form factor — used to nudge the user to a desktop for calendar setup. */
  const isMobile = computed<boolean>(() => !!$q.platform.is.mobile)

  /**
   * Whether the OS reliably opens a `webcal://` link in its calendar app. iOS, macOS and
   * Linux do; Windows, Android and everything else don't, and are sent to the how-to page.
   * Stays `false` until the client has hydrated so we never flash the wrong UI.
   */
  const supportsWebcal = computed<boolean>(() => {
    if (!resolved.value) return false
    return os.value === 'ios' || os.value === 'macos' || os.value === 'linux'
  })

  return {
    resolved,
    os,
    isMobile,
    supportsWebcal
  }
}
