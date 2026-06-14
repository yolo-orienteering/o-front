import { ref } from 'vue'
import type {
  RaceResultClass,
  RaceResultEntry,
  RaceResultsResponse
} from '@/types/RaceResults'
import { parseEventId } from '@/utils/raceResultFormat'

/**
 * Fetches race results (Rangliste) from the same-origin Nitro proxy route
 * `/api/race-results/[eventId]`, which transforms o-l.ch's IOF XML to JSON.
 */
export function useRaceResults() {
  const results = ref<RaceResultsResponse | null>(null)
  const loading = ref(false)
  const failed = ref(false)

  async function fetchByEventId(
    eventId: string | null
  ): Promise<RaceResultsResponse | null> {
    if (!eventId) {
      results.value = null
      return null
    }
    loading.value = true
    failed.value = false
    try {
      results.value = await $fetch<RaceResultsResponse>(
        `/api/race-results/${eventId}`
      )
      return results.value
    } catch (error) {
      console.error('Failed to load race results', error)
      failed.value = true
      results.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  function fetchByRankingLink(
    rankingLink: string | null | undefined
  ): Promise<RaceResultsResponse | null> {
    return fetchByEventId(parseEventId(rankingLink))
  }

  function getClass(
    name: string | null | undefined
  ): RaceResultClass | undefined {
    if (!results.value || !name) return undefined
    const target = name.trim().toLowerCase()
    return results.value.classes.find(
      (raceClass) => raceClass.name.trim().toLowerCase() === target
    )
  }

  /** Find a runner (and their class) across all classes by composed identifier. */
  function findByIdentifier(
    identifier: string | false | null | undefined
  ): { entry: RaceResultEntry; raceClass: RaceResultClass } | undefined {
    if (!results.value || !identifier) return undefined
    for (const raceClass of results.value.classes) {
      const entry = raceClass.results.find((r) => r.identifier === identifier)
      if (entry) return { entry, raceClass }
    }
    return undefined
  }

  return {
    results,
    loading,
    failed,
    fetchByEventId,
    fetchByRankingLink,
    getClass,
    findByIdentifier
  }
}
