<template>
  <div v-if="user" class="row q-col-gutter-sm">
    <!-- hint -->
    <div
      v-if="!user.first_name || !user.last_name || !user.birthYear"
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

    <!-- first name -->
    <div class="col-6">
      <q-input v-model="user.first_name" label="Vorname" outlined dense />
    </div>

    <!-- last name -->
    <div class="col-6">
      <q-input v-model="user.last_name" label="Nachname" outlined dense />
    </div>

    <!-- birth year -->
    <div class="col-6">
      <q-input
        v-model="user.birthYear"
        label="Jahrgang"
        outlined
        dense
        type="number"
      />
    </div>

    <!-- public transport starting location -->
    <div class="col-12 q-pt-md">
      <q-input
        v-model="user.location"
        label="Dein Wohnort (als Abfahrtsort)"
        outlined
        dense
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSyncCenter } from '@/stores/syncCenter'

  const { user, userIdentifier } = useSyncCenter()
</script>
