import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import type { DirectusUsers, Race, UserDeparture } from '@/types/DirectusTypes'
import { computed, ref, watch } from 'vue'

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
  const user = ref<Partial<DirectusUsers>>({})
  const followingUserDepartures = ref<FollowingUserDeparture[] | null>(null)

  /**
   * DEFINE STORE KEY NAMES
   */
  // local storage variables
  const localStorage = useQuasar().localStorage
  const MY_RACES_STORAGE_KEY = 'my-races'
  const FILTERS_STORAGE_KEY = 'filters'
  const USER_STORAGE_KEY = 'user'
  const FOLLOWING_USER_DEPARTURES_STORAGE_KEY = 'following-user-departures'

  /**
   * INITIAL DATA READING FROM STORE
   */

  onMounted(() => {
    readUser()
    readMyRaces()
    readFollowingUserDepartures()
  })

  // load data from the local store

  readFilters()
  function readMyRaces(): void {
    myRaces.value = localStorage.getItem<Race[]>(MY_RACES_STORAGE_KEY) || []
  }

  function readFilters(): void {
    const filtersFromStore: RaceFilter | null =
      localStorage.getItem<RaceFilter>(FILTERS_STORAGE_KEY)
    if (filtersFromStore) {
      filter.initFilter(filtersFromStore)
    } else {
      filter.initFilter()
    }
  }
  function readUser(): void {
    const userFromStore: Partial<DirectusUsers> =
      localStorage.getItem<Partial<DirectusUsers>>(USER_STORAGE_KEY) || {}
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
    }
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
      // sort by date
      localStorage.set(MY_RACES_STORAGE_KEY, myRaces.value)
    },
    { deep: true }
  )
  // filters
  watch(
    filter.filter,
    () => {
      localStorage.set(FILTERS_STORAGE_KEY, filter.filter.value)
    },
    { deep: true }
  )
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
      deep: true,
    }
  )

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
    userIdentifier,
    myDepartures,
  }
})
