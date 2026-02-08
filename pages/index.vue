<template>
  <div class="q-pt-md">
    <!-- filter -->
    <Teleport v-if="teleportElement" :to="teleportElement">
      <races-filter
        v-show="races"
        :loading="status !== 'success'"
        @update:filter="updateFilter()"
      />
    </Teleport>

    <race-timeline
      :races="races"
      :loading="status !== 'success'"
      @load-more="loadMore()"
      @update:filter="updateFilter()"
    />
    <div v-if="error">Error: {{ error }}</div>
  </div>
</template>

<script setup lang="ts">
  import { readItems } from '@directus/sdk'
  import { Notify } from 'quasar'
  import type { Race } from '~/types/DirectusTypes'
  import RaceTimeline from '~/components/races/RaceTimeline.vue'

  // initially loads races with onMounted hook within composable
  const filter = useRaceFilter()
  const { directus } = useApi()
  const { teleportElement } = useTeleport('teleport-to-filter-menu')

  const {
    data: races,
    status,
    error
  } = await useAsyncData<Race[]>('fetchRaces', () => {
    const query = filter.composeRaceQuery({ initialLoad: true })
    return directus.request<Race[]>(readItems('Race', query))
  })

  async function updateFilter(): Promise<void> {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    filter.filter.page = 1
    const query = filter.composeRaceQuery({})
    races.value = await directus.request<Race[]>(readItems('Race', query))
  }

  async function loadMore(): Promise<void> {
    filter.filter.page += 1
    const query = filter.composeRaceQuery({})
    const newRaces = await directus.request<Race[]>(readItems('Race', query))

    // no new races
    if (!newRaces.length) {
      filter.filter.page -= 1
      Notify.create({
        message: 'Keine weiteren Läufe verfügbar'
      })
      return
    }
    races.value = [...(races.value || []), ...newRaces]
  }
</script>
