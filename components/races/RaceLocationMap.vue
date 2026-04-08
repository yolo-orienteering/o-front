<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import mapMarkerUrl from '@/assets/img/map-marker.svg'
  import type { GeoJSONPoint, Race } from '@/types/DirectusTypes'

  const oMateIcon = L.icon({
    iconUrl: mapMarkerUrl,
    iconSize: [32, 46],
    iconAnchor: [16, 46],
    popupAnchor: [0, -46]
  })

  const props = defineProps<{
    coordinates: GeoJSONPoint
    race?: Race | null
  }>()

  const mapContainer = ref<HTMLElement | null>(null)
  const isFullscreen = ref(false)
  let map: L.Map | null = null

  // GeoJSON uses [longitude, latitude]
  const lat = props.coordinates.coordinates[1]
  const lng = props.coordinates.coordinates[0]

  function toggleFullscreen() {
    isFullscreen.value = !isFullscreen.value

    if (!map) return

    if (isFullscreen.value) {
      map.scrollWheelZoom.enable()
      map.dragging.enable()
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

  function onMapTouchStart(e: TouchEvent) {
    if (!map || isFullscreen.value) return
    if (e.touches.length >= 2) {
      map.dragging.enable()
    } else {
      map.dragging.disable()
    }
  }

  function onMapTouchEnd(e: TouchEvent) {
    if (!map || isFullscreen.value) return
    if (e.touches.length === 0) {
      map.dragging.disable()
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
    mapContainer.value.addEventListener('touchstart', onMapTouchStart, {
      passive: true
    })
    mapContainer.value.addEventListener('touchend', onMapTouchEnd, {
      passive: true
    })
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    mapContainer.value?.removeEventListener('touchstart', onMapTouchStart)
    mapContainer.value?.removeEventListener('touchend', onMapTouchEnd)
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
    <races-race-location-buttons
      :coordinates="coordinates"
      :race="race"
      :class="{ 'q-pb-md': isFullscreen }"
    />
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
