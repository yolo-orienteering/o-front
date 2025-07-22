<template>
  <div class="q-pt-md">
    <!-- filter -->
    <Teleport v-if="teleportToMenuEl" :to="teleportToMenuEl">
      <races-filter
        v-show="races"
        :loading="loading"
        @update:filter="updateFilter()"
      />
    </Teleport>

    <race-timeline
      v-if="races"
      :races="races"
      :loading="loading"
      @load-more="loadMore()"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { readItems } from '@directus/sdk'
  import { Notify } from 'quasar'
  import type { Race } from '~/types/DirectusTypes'
  import RaceTimeline from '~/components/races/RaceTimeline.vue'

  // defining races
  const loading = ref<boolean>(false)
  const teleportToMenuEl = ref<HTMLElement | null>(null)

  // initially loads races with onMounted hook within composable
  const filter = useRaceFilter()
  const { directus } = useApi()
  const races = ref<Race[]>([])
  const eventBus = useEventBus().eventBus

  onMounted(async () => {
    teleportToMenuEl.value = document.getElementById('teleport-to-menu')
    await initialLoad()
  })

  async function initialLoad(): Promise<void> {
    loading.value = true
    const query = filter.composeRaceQuery({ initialLoad: true })
    races.value = await directus.request<Race[]>(readItems('Race', query))
    eventBus.emit('scrollToSavedPosition')
    loading.value = false
  }

  async function updateFilter(): Promise<void> {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
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
        message: 'Keine weiteren Läufe verfügbar',
      })
      return
    }
    races.value = [...races.value, ...newRaces]
  }
</script>
