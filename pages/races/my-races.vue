<template>
  <div class="row justify-between items-center">
    <div class="text-h5 q-pt-md">Meine Läufe</div>

    <client-only>
      <div v-if="myRacesSorted.length" class="col-12">
        <race-timeline :races="myRacesSorted" hide-load-more :loading="false" />
      </div>

      <div v-else class="col-12 q-pt-md">
        <q-banner dark>
          Du hast dir noch keine Läufe vorgemerkt. Stelle Dir Deine Liste
          zusammen.
          <template #avatar>
            <q-icon name="info" size="md" class="q-pr-sm" />
          </template>
          <template #action>
            <q-btn to="/"> Jetzt Läufe entdecken </q-btn>
          </template>
        </q-banner>
      </div>
    </client-only>
  </div>
</template>

<script setup lang="ts">
  import RaceTimeline from '~/components/races/RaceTimeline.vue'
  import type { Race } from '~/types/DirectusTypes'

  const syncCenter = useSyncCenter()
  const { eventBus } = useEventBus()

  onMounted(async () => {
    await nextTick(() => {
      eventBus.emit('scrollToSavedPosition')
    })
  })

  const myRacesSorted = computed<Race[]>(() => {
    if (!syncCenter.myRaces) {
      return []
    }

    const fiveDaysAgoMs = new Date(
      new Date().setDate(new Date().getDate() - 4)
    ).setHours(0, 0, 0, 0)

    return [...syncCenter.myRaces]
      .sort((a, b) => {
        const aDate = a.date
        const bDate = b.date
        if (!aDate || !bDate) {
          return 0
        }
        return new Date(aDate).getTime() - new Date(bDate).getTime()
      })
      .filter((race) => {
        // only return races in future.
        if (!race.date) {
          return false
        }
        return new Date(race.date).setHours(0, 0, 0, 0) >= fiveDaysAgoMs
      })
  })
</script>
