<script setup lang="ts">
  import { watch } from 'vue'

  const syncCenter = useSyncCenter()
  const dialogOpen = ref(false)

  watch(
    () => syncCenter.showCalendarPrompt,
    (val) => {
      if (val) {
        // disable it until webapp crashes are fixed
        // dialogOpen.value = true
        syncCenter.showCalendarPrompt = false
      }
    }
  )
</script>

<template>
  <q-dialog v-model="dialogOpen">
    <q-card style="min-width: 320px; max-width: 480px">
      <q-card-section>
        <div class="text-h6">Kalender</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <calendar-subscription-section />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Schliessen" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
