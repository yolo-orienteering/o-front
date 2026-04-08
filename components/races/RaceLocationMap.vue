<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
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
  const isFullscreen = ref(false)
  let map: L.Map | null = null

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

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value

    if (!map) return

    if (isFullscreen.value) {
      map.scrollWheelZoom.enable()
    } else {
      map.scrollWheelZoom.disable()
    }

    nextTick(() => map?.invalidateSize())
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isFullscreen.value) {
      toggleFullscreen()
    }
  }

  onMounted(() => {
    if (!mapContainer.value) return

    map = L.map(mapContainer.value, {
      scrollWheelZoom: false,
      touchZoom: true
    }).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(map)

    L.marker([lat, lng], { icon: oMateIcon }).addTo(map)

    document.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    map?.remove()
    map = null
  })
</script>

<template>
  <div class="race-location-map" :class="{ fullscreen: isFullscreen }">
    <div class="map-wrapper">
      <div ref="mapContainer" class="map-container" />
      <q-btn
        class="fullscreen-btn"
        round
        dense
        color="white"
        text-color="dark"
        :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="toggleFullscreen"
      />
    </div>
    <div class="row q-pl-sm q-pt-lg justify-center">
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
  </div>
</template>

<style lang="scss" scoped>
  .map-wrapper {
    position: relative;
  }

  .map-container {
    width: calc(100% + (2 * 8px));
    height: 300px;
    border-radius: 8px;
    z-index: 0;
    margin: 0 -8px;
  }

  .fullscreen-btn {
    position: absolute;
    top: 8px;
    right: 0;
    z-index: 1;
  }

  .fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: white;
    display: flex;
    flex-direction: column;

    .map-wrapper {
      flex: 1;
    }

    .map-container {
      width: 100%;
      height: 100%;
      margin: 0;
      border-radius: 0;
    }

    .fullscreen-btn {
      right: 16px;
    }
  }
</style>
