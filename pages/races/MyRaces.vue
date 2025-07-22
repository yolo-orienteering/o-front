<template>
  <div class="row justify-between items-center">
    <div class="text-h5 q-pt-md">Meine Läufe</div>

    <div v-if="syncCenter.myRacesSorted.length" class="col-12">
      <race-timeline
        :races="syncCenter.myRacesSorted"
        hide-load-more
        :loading="false"
      />
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
  </div>
</template>

<script setup lang="ts">
  import RaceTimeline from '@/components/races/RaceTimeline.vue'

  const syncCenter = useSyncCenter()
  const { eventBus } = useEventBus()

  onMounted(async () => {
    await nextTick(() => {
      eventBus.emit('scrollToSavedPosition')
    })
  })
</script>
