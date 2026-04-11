import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import type {
  CustomDirectusUser,
  Race,
  UserDeparture
} from '@/types/DirectusTypes'
import { computed, ref, watch } from 'vue'
import { updateItem } from '@directus/sdk'

export type FollowingUserDeparture = Pick<UserDeparture, 'id' | 'race'>

export const useSyncCenter = defineStore('syncCenter', () => {
  function isServer(): boolean {
    return typeof window === 'undefined'
  }
  const myDepartures = useMyDepartures()

  /**
   * DEFINE DATA YOU WANT SYNC
   */
  const myRaces = ref<Race[] | null>(null)
  const user = ref<Partial<CustomDirectusUser>>({})
  const followingUserDepartures = ref<FollowingUserDeparture[] | null>(null)
  const calendarSubscriptionId = ref<string | null>(null)
  const bookmarkCount = ref<number>(0)
  const showCalendarPrompt = ref<boolean>(false)

  /**
   * DEFINE STORE KEY NAMES
   */
  // local storage variables
  const localStorage = useQuasar().localStorage
  const MY_RACES_STORAGE_KEY = 'my-races'
  const USER_STORAGE_KEY = 'user'
  const FOLLOWING_USER_DEPARTURES_STORAGE_KEY = 'following-user-departures'
  const CALENDAR_SUBSCRIPTION_ID_STORAGE_KEY = 'calendar-subscription-id'
  const BOOKMARK_COUNT_STORAGE_KEY = 'bookmark-count'

  /**
   * INITIAL DATA READING FROM STORE
   */

  onMounted(() => {
    readUser()
    readMyRaces()
    readFollowingUserDepartures()
    readCalendarSubscriptionId()
    readBookmarkCount()
  })

  // load data from the local store
  function readMyRaces(): void {
    myRaces.value = localStorage.getItem<Race[]>(MY_RACES_STORAGE_KEY) || []
  }
  function readUser(): void {
    const userFromStore: Partial<CustomDirectusUser> =
      localStorage.getItem<Partial<CustomDirectusUser>>(USER_STORAGE_KEY) || {}
    if (userFromStore) {
      user.value = userFromStore
    } else {
      user.value = {}
    }
  }
  function readFollowingUserDepartures(): void {
    const followingDeparturesFromStore: FollowingUserDeparture[] | null =
      localStorage.getItem<FollowingUserDeparture[]>(
        FOLLOWING_USER_DEPARTURES_STORAGE_KEY
      )

    if (followingDeparturesFromStore) {
      followingUserDepartures.value = followingDeparturesFromStore
    } else {
      followingUserDepartures.value = []
    }
  }
  function readCalendarSubscriptionId(): void {
    calendarSubscriptionId.value =
      localStorage.getItem<string>(CALENDAR_SUBSCRIPTION_ID_STORAGE_KEY) || null
  }
  function readBookmarkCount(): void {
    bookmarkCount.value =
      localStorage.getItem<number>(BOOKMARK_COUNT_STORAGE_KEY) || 0
  }

  /**
   * WATCH CHANGES ON THE DATA AND SAVE THEM
   */
  // races
  watch(
    myRaces,
    () => {
      if (isServer()) {
        return
      }
      localStorage.set(MY_RACES_STORAGE_KEY, myRaces.value)
      syncCalendarSubscription()
    },
    { deep: true }
  )

  function incrementBookmarkCount(): void {
    bookmarkCount.value += 1
    localStorage.set(BOOKMARK_COUNT_STORAGE_KEY, bookmarkCount.value)
    if (!calendarSubscriptionId.value && bookmarkCount.value % 10 === 1) {
      showCalendarPrompt.value = true
    }
  }

  function syncCalendarSubscription(): void {
    if (!calendarSubscriptionId.value) return

    const { directus } = useApi()
    const raceIds = (myRaces.value || []).map((r) => r.id)

    directus
      .request(
        updateItem('CalendarSubscription', calendarSubscriptionId.value, {
          races: raceIds.map((id) => ({ Race_id: id })) as any
        })
      )
      .catch((error) => {
        console.error('Failed to sync calendar subscription:', error)
      })
  }
  // user
  watch(
    user,
    () => {
      if (isServer() || Object.keys(user.value).length === 0) {
        return
      }
      localStorage.set(USER_STORAGE_KEY, user.value)
    },
    { deep: true }
  )
  watch(
    followingUserDepartures,
    () => {
      if (isServer()) {
        return
      }
      localStorage.set(
        FOLLOWING_USER_DEPARTURES_STORAGE_KEY,
        followingUserDepartures.value
      )
    },
    {
      deep: true
    }
  )
  watch(calendarSubscriptionId, () => {
    if (isServer()) {
      return
    }
    if (calendarSubscriptionId.value) {
      localStorage.set(
        CALENDAR_SUBSCRIPTION_ID_STORAGE_KEY,
        calendarSubscriptionId.value
      )
    } else {
      localStorage.remove(CALENDAR_SUBSCRIPTION_ID_STORAGE_KEY)
    }
  })

  /**
   * Computed data
   */

  const userIdentifier = computed<string | false>(() => {
    if (
      !user.value?.first_name ||
      !user.value.last_name ||
      !user.value.birthYear
    ) {
      return false
    }

    return `${user.value.first_name}${user.value.last_name}${user.value.birthYear}`
      .replace(/\s+/g, '')
      .toLowerCase()
  })

  return {
    myRaces,
    user,
    followingUserDepartures,
    calendarSubscriptionId,
    bookmarkCount,
    showCalendarPrompt,
    incrementBookmarkCount,
    userIdentifier,
    myDepartures
  }
})
