import { readItems } from '@directus/sdk'
import { useQuasar } from 'quasar'
import { useSyncCenter } from '@/stores/syncCenter'
import { useApi } from '@/stores/useApi'
import type { RaceCategory, UserDeparture } from '@/types/DirectusTypes'
import { onMounted, ref, watch } from 'vue'
import { useDeparture } from './useDeparture'

export function useMyDepartures() {
  const { directus } = useApi()
  const syncCenter = useSyncCenter()
  const { formatDepartureTime } = useDeparture()

  const myDepartures = ref<UserDeparture[]>([])
  const lastUserIdentifier = ref<string | false>(syncCenter.userIdentifier)

  // local storage
  const localStorage = useQuasar().localStorage
  const MY_DEPARTURES_KEY = 'my-departures'

  onMounted(async () => {
    // 1. read data from store
    readMyDeparturesFromStore()
    // 2. try to update from remote
    await updateMyDeparturesFromDirectus()

    departureFetchEngine()
  })

  // update local store
  watch(
    () => myDepartures,
    () => localStorage.set(MY_DEPARTURES_KEY, myDepartures.value),
    { deep: true }
  )

  function departureFetchEngine() {
    setInterval(() => {
      if (
        syncCenter.userIdentifier &&
        syncCenter.userIdentifier !== lastUserIdentifier.value
      ) {
        lastUserIdentifier.value = syncCenter.userIdentifier
        updateMyDeparturesFromDirectus()
      }
    }, 1500)
  }

  function readMyDeparturesFromStore(): void {
    const myDeparturesFromStore =
      localStorage.getItem<UserDeparture[]>(MY_DEPARTURES_KEY)
    if (myDeparturesFromStore) {
      myDepartures.value = myDeparturesFromStore
    }
  }

  async function updateMyDeparturesFromDirectus(): Promise<void> {
    try {
      if (!syncCenter.userIdentifier) {
        return
      }

      myDepartures.value = await directus.request<UserDeparture[]>(
        readItems('UserDeparture', {
          filter: {
            user: {
              composedIdentifierSolv: {
                _eq: syncCenter.userIdentifier,
              },
            },
          },
          fields: [
            'id',
            'race',
            'startTimeInMinutes',
            {
              raceCategory: [
                'id',
                'name',
                'amountOfControls',
                'distanceInMeter',
                'equidistanceInMeter',
              ],
            },
          ],
        })
      )
    } catch (e) {
      console.error(e)
    }
  }

  function getFormatedDeparture(raceId: string): string | undefined {
    const departure = getDepartureFor(raceId)
    if (!departure) {
      return
    }

    const departureTime = formatDepartureTime(departure.startTimeInMinutes)

    return `${departureTime}, ${(departure.raceCategory as RaceCategory).name}`
  }

  function getDepartureFor(
    raceId: string | null | undefined
  ): UserDeparture | undefined {
    return myDepartures.value.find((departure) => departure.race === raceId)
  }

  return {
    myDepartures,
    getDepartureFor,
    getFormatedDeparture,
  }
}
