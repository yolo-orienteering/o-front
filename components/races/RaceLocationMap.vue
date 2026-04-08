<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import mapMarkerUrl from '@/assets/img/map-marker.svg'
  import type { GeoJSONPoint } from '@/types/DirectusTypes'

  const oMateIcon = L.icon({
    iconUrl: mapMarkerUrl,
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46]
  })

  const props = defineProps<{
    coordinates: GeoJSONPoint
  }>()

  const mapContainer = ref<HTMLElement | null>(null)
  let map: L.Map | null = null

  // GeoJSON uses [longitude, latitude]
  const lat = props.coordinates.coordinates[1]
  const lng = props.coordinates.coordinates[0]

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  const openRouteServiceData = JSON.stringify({
    coordinates: `null;${lng},${lat}`,
    options: {}
  })
  const openRouteServiceUrl = `https://maps.openrouteservice.org/#/directions/null/OL/data/${openRouteServiceData}`

  onMounted(() => {
    if (!mapContainer.value) return

    map = L.map(mapContainer.value).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    L.marker([lat, lng], { icon: oMateIcon }).addTo(map)
  })

  onBeforeUnmount(() => {
    map?.remove()
    map = null
  })
</script>

<template>
  <div class="race-location-map">
    <div class="row q-pl-sm q-pb-lg">
      <div class="col-auto">
        <q-btn :href="googleMapsUrl" target="_blank">
          <q-icon class="q-mr-sm" name="directions" />
          Google Maps
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn :href="openRouteServiceUrl" target="_blank" class="q-ml-sm">
          <q-icon class="q-mr-sm" name="directions" />
          Open Route
        </q-btn>
      </div>
    </div>
    <div ref="mapContainer" class="map-container" />
    <div class="q-mt-md text-center"></div>
  </div>
</template>

<style lang="scss" scoped>
  .map-container {
    width: calc(100% + (2 * 8px));
    height: 300px;
    border-radius: 8px;
    z-index: 0;
    margin: 0 -8px;
  }
</style>
