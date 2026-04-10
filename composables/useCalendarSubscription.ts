import { computed } from 'vue'

export function useCalendarSubscription() {
  const syncCenter = useSyncCenter()
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl as string

  const hasSubscription = computed<boolean>(
    () => !!syncCenter.calendarSubscriptionId
  )

  const subscriptionUrl = computed<string | null>(() => {
    if (!syncCenter.calendarSubscriptionId) return null
    return `${apiUrl}/calendar-subscription/${syncCenter.calendarSubscriptionId}/calendar.ics`
  })

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
    subscriptionUrl,
    createSubscription
  }
}
