<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, ref, nextTick, computed } from 'vue'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import mapMarkerUrl from '@/assets/img/map-marker.svg'
  import sbbLogoUrl from '@/assets/img/sbb_logo.svg'
  import type {
    GeoJSONPoint,
    Race,
    RaceInstruction
  } from '@/types/DirectusTypes'
  import { formatDate } from '@/utils/DateUtils'
  import { useSyncCenter } from '@/stores/syncCenter'

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

  const { user } = useSyncCenter()
  const mapContainer = ref<HTMLElement | null>(null)
  const isFullscreen = ref(false)
  const nearestStation = ref<string | null>(null)
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
      // Falls back to publicTransportAI or city via sbbDestination computed
      return getFallbackStation()
    }
  }

  function getFallbackStation(): string | null {
    const instruction = (props.race?.instruction as RaceInstruction[])?.[0]
    return instruction?.publicTransportAI || props.race?.city || null
  }

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

    fetchNearestStation()
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
    <div
      class="row q-pt-lg justify-center q-gutter-sm"
      :class="{ 'q-pb-md': isFullscreen }"
    >
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
      <div v-if="sbbUrl" class="col-auto">
        <q-btn :href="sbbUrl" target="_blank" class="q-ml-sm">
          <img :src="sbbLogoUrl" width="20" class="q-mr-sm" />
          SBB
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
