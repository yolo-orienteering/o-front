import { LocalStorage } from 'quasar'

// Mock Swiss O Magazine subscription state for the online-publishing test.
//
// There is no real auth/payment backend — this just persists a flag in
// localStorage so that, after a (mock) checkout or login, premium articles
// unlock and stay unlocked across navigation/reload. Module-level refs make
// the state shared across every component that calls the composable.

export type MagazinePlan = 'print' | 'online' | 'combo'

export interface MagazineSubscription {
  active: boolean
  plan: MagazinePlan | null
  /** ISO timestamp of when it was activated */
  since: string | null
}

const STORAGE_KEY = 'omate_magazine_subscription'

const subscription = ref<MagazineSubscription>({
  active: false,
  plan: null,
  since: null
})

let hydrated = false

function hydrate() {
  if (hydrated || !import.meta.client) return
  const stored = LocalStorage.getItem<MagazineSubscription>(STORAGE_KEY)
  if (stored?.active) subscription.value = stored
  hydrated = true
}

function persist() {
  if (import.meta.client) LocalStorage.set(STORAGE_KEY, subscription.value)
}

export function useMagazineSubscription() {
  hydrate()

  const isSubscribed = computed(() => subscription.value.active)

  /** Activate a subscription (called from the mock checkout). */
  function subscribe(plan: MagazinePlan) {
    subscription.value = {
      active: true,
      plan,
      since: new Date().toISOString()
    }
    persist()
  }

  /** Mock "existing subscriber logs in" — unlocks without choosing a plan. */
  function login() {
    if (!subscription.value.active) {
      subscription.value = {
        active: true,
        plan: subscription.value.plan,
        since: new Date().toISOString()
      }
      persist()
    }
  }

  /** Reset — handy for re-testing the paywall flow. */
  function reset() {
    subscription.value = { active: false, plan: null, since: null }
    if (import.meta.client) LocalStorage.remove(STORAGE_KEY)
  }

  return {
    subscription: readonly(subscription),
    isSubscribed,
    subscribe,
    login,
    reset
  }
}
