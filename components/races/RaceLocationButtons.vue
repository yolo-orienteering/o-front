<script lang="ts" setup>
  import { onMounted, ref, computed } from 'vue'
  import sbbLogoUrl from '@/assets/img/sbb_logo.svg'
  import type {
    GeoJSONPoint,
    Race,
    RaceInstruction
  } from '@/types/DirectusTypes'
  import { formatDate } from '@/utils/DateUtils'
  import { useSyncCenter } from '@/stores/syncCenter'

  const props = defineProps<{
    coordinates: GeoJSONPoint
    race?: Race | null
  }>()

  const { user } = useSyncCenter()
  const nearestStation = ref<string | null>(null)

  // GeoJSON uses [longitude, latitude]
  const lat = props.coordinates.coordinates[1]
  const lng = props.coordinates.coordinates[0]

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  const openRouteServiceData = JSON.stringify({
    coordinates: `null;${lng},${lat}`,
    options: {
      zoom: 14,
      center: { lat, lng }
    }
  })
  const openRouteServiceUrl = `https://maps.openrouteservice.org/#/directions/null/OL/data/${openRouteServiceData}`

  const sbbUrl = computed(() => {
    if (!nearestStation.value) return null
    const params = new URLSearchParams()
    params.set('nach', nearestStation.value)
    if (props.race?.date) {
      params.set('datum', formatDate(props.race.date, 'DD.MM.YYYY'))
    }
    params.set('zeit', '10:00')
    params.set('an', 'true')
    if (user?.location) {
      params.set('von', user.location)
    }
    params.set('suche', 'true')
    return `https://www.sbb.ch/de/kaufen/pages/fahrplan/fahrplan.xhtml?${params.toString()}`
  })

  async function fetchNearestStation() {
    try {
      const response = await fetch(
        `https://transport.opendata.ch/v1/locations?x=${lat}&y=${lng}&type=station`
      )
      const data = await response.json()
      if (data.stations?.length) {
        nearestStation.value = data.stations[0].name
      } else {
        nearestStation.value = getFallbackStation()
      }
    } catch {
      nearestStation.value = getFallbackStation()
    }
  }

  function getFallbackStation(): string | null {
    const instruction = (props.race?.instruction as RaceInstruction[])?.[0]
    return instruction?.publicTransportAI || props.race?.city || null
  }

  onMounted(() => {
    fetchNearestStation()
  })
</script>

<template>
  <div class="row q-pt-lg justify-center q-gutter-sm">
    <div class="col-auto">
      <q-btn :href="googleMapsUrl" target="_blank">
        <q-icon class="q-mr-sm" name="directions" />
        Google Maps
      </q-btn>
    </div>
    <div class="col-auto">
      <q-btn :href="openRouteServiceUrl" target="_blank">
        <q-icon class="q-mr-sm" name="directions" />
        Open Route
      </q-btn>
    </div>
    <div v-if="sbbUrl" class="col-auto">
      <q-btn :href="sbbUrl" target="_blank">
        <img :src="sbbLogoUrl" width="20" class="q-mr-sm" />
        SBB
      </q-btn>
    </div>
  </div>
</template>
