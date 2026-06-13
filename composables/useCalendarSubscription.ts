import { computed } from 'vue'

/** Both URL forms of a subscription feed: the raw HTTPS `.ics` and its `webcal://` twin. */
export interface SubscriptionUrls {
  /** `https://…/calendar.ics` — paste this into "Kalender per URL abonnieren" dialogs. */
  https: string
  /** `webcal://…/calendar.ics` — hand to the OS to open the calendar app directly. */
  webcal: string
}

export function useCalendarSubscription() {
  const syncCenter = useSyncCenter()
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl as string

  const hasSubscription = computed<boolean>(
    () => !!syncCenter.calendarSubscriptionId
  )

  /** Build both URL forms for an arbitrary subscription id (used by the how-to page,
   * which may receive the id via a cross-device link rather than from local state). */
  function urlsForId(id: string): SubscriptionUrls {
    const https = `${apiUrl}/calendar-subscription/${id}/calendar.ics`
    return {
      https: https.replace(/^webcal:\/\//, 'https://'),
      webcal: https.replace(/^https?:\/\//, 'webcal://')
    }
  }

  /** Both URL forms for the current user's subscription, or null if there is none. */
  const subscriptionUrls = computed<SubscriptionUrls | null>(() =>
    syncCenter.calendarSubscriptionId
      ? urlsForId(syncCenter.calendarSubscriptionId)
      : null
  )

  /** `webcal://` feed URL for the current subscription (kept for existing callers). */
  const subscriptionUrl = computed<string | null>(
    () => subscriptionUrls.value?.webcal ?? null
  )

  /** `https://` `.ics` feed URL — the form you paste into manual subscription dialogs. */
  const icsUrl = computed<string | null>(
    () => subscriptionUrls.value?.https ?? null
  )

  async function createSubscription(turnstileToken: string): Promise<void> {
    const raceIds = (syncCenter.myRaces || []).map((r) => r.id)

    const response = await fetch(`${apiUrl}/calendar-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        turnstileToken,
        races: raceIds
      })
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create subscription')
    }

    const { id } = (await response.json()) as { id: string }
    syncCenter.calendarSubscriptionId = id
  }

  return {
    hasSubscription,
    subscriptionUrls,
    subscriptionUrl,
    icsUrl,
    urlsForId,
    createSubscription
  }
}
