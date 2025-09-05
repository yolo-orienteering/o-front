import type { Query, QueryFilter } from '@directus/sdk'
import type { Schema, Race } from '@/types/DirectusTypes'

export type RaceQuery = Query<Schema, Race>
export type RaceTerrain = 'forest' | 'urban' | 'mix' | undefined | null

export interface RaceFilter {
  deadline: boolean
  searchString: string | undefined
  terrain?: RaceTerrain
  geographicalScale: Race['geographicalScale'] | undefined
  regions?: string[]
  previousDays: number
  limit: number
  page: number
}

export const useRaceFilter = defineStore('useRaceFilter', () => {
  const filter = ref<RaceFilter>({
    deadline: false,
    searchString: undefined,
    terrain: undefined,
    geographicalScale: undefined,
    regions: [],
    previousDays: 0,
    limit: 25,
    page: 1,
  })

  function composeRaceQuery({
    initialLoad,
  }: {
    initialLoad?: boolean
  }): RaceQuery {
    let limit = filter.value.limit
    let page = filter.value.page

    const now = new Date()
    const filterDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    filterDate.setDate(filterDate.getDate() - filter.value.previousDays)
    const filterDateIso = filterDate.toISOString()

    // in case of initial load
    if (initialLoad && page > 1) {
      limit = page * limit
      page = 1
    }

    // base query
    const composedFilter: RaceQuery = {
      limit,
      page,
      sort: 'date',
      filter: {
        date: {
          _gte: filterDateIso,
        },
        terrain: {
          _eq: filter.value.terrain,
        },
      },
    } as RaceQuery

    // add deadline filter
    if (filter.value.deadline) {
      composedFilter.filter = {
        ...composedFilter.filter,
        _and: [
          {
            deadline: {
              _nnull: true,
            },
          },
          {
            deadline: {
              _gte: filterDateIso,
            },
          },
        ],
        // reset date filter
        date: {},
      } as QueryFilter<Schema, Race>

      composedFilter.sort = 'deadline'
    }

    // add geographical scale filter
    if (filter.value.geographicalScale) {
      composedFilter.filter = {
        ...composedFilter.filter,
        geographicalScale: {
          _eq: filter.value.geographicalScale,
        },
      }
    }

    // add region filter
    if (filter.value.regions?.length) {
      const regionsOrFilter = filter.value.regions.map((region) => ({
        region: { _eq: region },
      }))

      composedFilter.filter = {
        ...composedFilter.filter,
        _or: regionsOrFilter,
      }
    }

    // add search
    if (filter.value.searchString) {
      composedFilter.search = filter.value.searchString
    }

    return composedFilter
  }

  return {
    filter,
    composeRaceQuery,
  }
})
