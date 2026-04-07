<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
  import markerIcon from 'leaflet/dist/images/marker-icon.png'
  import markerShadow from 'leaflet/dist/images/marker-shadow.png'
  import type { GeoJSONPoint } from '@/types/DirectusTypes'

  // Fix Leaflet default marker icons in bundled environments:
  // Delete the internal method that prepends Leaflet's own base path,
  // then set the Vite-resolved URLs directly.
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow
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

  onMounted(() => {
    if (!mapContainer.value) return

    map = L.map(mapContainer.value).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    L.marker([lat, lng]).addTo(map)
  })

  onBeforeUnmount(() => {
    map?.remove()
    map = null
  })
</script>

<template>
  <div class="race-location-map">
    <div ref="mapContainer" class="map-container" />
    <div class="q-mt-md text-center">
      <q-btn :href="googleMapsUrl" target="_blank" color="primary">
        <q-icon class="q-mr-sm" name="directions" />
        Google Maps öffnen
      </q-btn>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .map-container {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    z-index: 0;
  }
</style>
