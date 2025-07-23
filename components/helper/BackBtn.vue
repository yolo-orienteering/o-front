<template>
  <q-btn
    size="md"
    rounded
    icon="chevron_left"
    color="primary"
    @click="props.to ? $router.push(props.to) : $router.go(-1)"
  >
    Zurück
  </q-btn>
</template>

<script setup lang="ts">
  import type { RouteLocationRaw } from 'vue-router'

  const props = defineProps<{
    to?: RouteLocationRaw
  }>()
</script>
