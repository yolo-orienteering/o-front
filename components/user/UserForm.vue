<template>
  <div v-if="syncCenter.user" class="row q-col-gutter-sm">
    <!-- hint -->
    <client-only>
      <div
        v-if="
          !syncCenter.user.first_name ||
          !syncCenter.user.last_name ||
          !syncCenter.user.birthYear
        "
        class="col-12 q-py-lg"
      >
        <q-banner dark>
          <template #avatar>
            <q-icon name="info" size="md" />
          </template>
          Lass dir deine <b>Startzeiten automatisch</b> von o-mate anzeigen. Gib
          einfach deinen Vornamen, Nachnamen und Jahrgang ein.
        </q-banner>
      </div>
    </client-only>

    <!-- first name -->
    <div class="col-6">
      <q-input
        v-model="syncCenter.user.first_name"
        label="Vorname"
        outlined
        dense
      />
    </div>

    <!-- last name -->
    <div class="col-6">
      <q-input
        v-model="syncCenter.user.last_name"
        label="Nachname"
        outlined
        dense
      />
    </div>

    <!-- birth year -->
    <div class="col-6">
      <q-input
        v-model="syncCenter.user.birthYear"
        label="Jahrgang"
        outlined
        dense
        type="number"
      />
    </div>

    <!-- public transport starting location -->
    <div class="col-12 q-pt-md">
      <q-input
        v-model="syncCenter.user.location"
        label="Dein Wohnort (als Abfahrtsort)"
        outlined
        dense
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSyncCenter } from '@/stores/syncCenter'

  const syncCenter = useSyncCenter()
</script>
