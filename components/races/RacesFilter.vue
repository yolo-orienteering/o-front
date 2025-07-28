<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useRegion } from '@/stores/useRegion'
  import { useRaceTerrain } from '@/composables/useRaceTerrain'

  const regionStore = useRegion()
  const filter = useRaceFilter()
  const { getTerrainIcon, getTerrainText } = useRaceTerrain()
  const isDesktop = useIsDesktop()

  const props = withDefaults(
    defineProps<{
      loading?: boolean
    }>(),
    {
      loading: false,
    }
  )

  const emits = defineEmits<{
    (e: 'update:filter'): void
  }>()

  onMounted(() => {
    searchEngine()
  })

  // text search helpers
  const lastSearchString = ref<string | undefined>(filter.filter.searchString)

  /**
   * handles user search input
   */
  function searchEngine() {
    setInterval(() => {
      if (filter && filter?.filter.searchString !== lastSearchString.value) {
        lastSearchString.value = filter.filter.searchString
        emits('update:filter')
      }
    }, 1000)
  }

  function updateFilter({
    deadline,
    geographicalScale,
    previousDays,
    terrain,
  }: {
    deadline?: boolean
    geographicalScale?: string | null
    previousDays?: 'add' | 'reset'
    terrain?: RaceTerrain | null
  }) {
    if (deadline !== undefined) {
      filter.filter.deadline = deadline
    }

    if (geographicalScale !== undefined) {
      filter.filter.geographicalScale = geographicalScale || undefined
    }

    if (previousDays !== undefined) {
      if (previousDays === 'reset') {
        filter.filter.previousDays = 0
      } else if (previousDays === 'add') {
        graduallyIncreasePreviousDays()
      }
    }

    if (terrain !== undefined) {
      filter.filter.terrain = terrain || undefined
    }

    emits('update:filter')
  }

  function graduallyIncreasePreviousDays() {
    let daysToChange = 7
    const previousDays = filter.filter.previousDays
    if (previousDays === 0 || previousDays === 1) {
      daysToChange = 1
    }

    if (previousDays === 2) {
      daysToChange = 5
    }

    filter.filter.previousDays += daysToChange
  }
</script>

<template>
  <div
    v-if="filter"
    class="row bg-white q-py-sm q-px-sm q-px-md-none"
    :class="
      isDesktop ? 'q-gutter-xs' : 'no-wrap items-center border-bottom-primary'
    "
    :style="isDesktop ? {} : { overflowX: 'scroll' }"
  >
    <div class="col-12 desktop-only">
      <p class="text-h6 q-mt-sm q-mb-xs q-pl-xs text-primary">
        <q-icon name="filter_alt" class="q-mb-xs q-mr-xs" />Läufe filtern
      </p>
    </div>

    <!-- deadline -->
    <div class="col-auto">
      <q-chip
        :selected="filter.filter.deadline"
        outline
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        icon-selected="notifications"
        :class="filter.filter.deadline ? 'bg-primary text-white' : 'bg-white'"
        @click="updateFilter({ deadline: !filter.filter.deadline })"
      >
        <span class="text-body2">
          <q-icon
            v-if="!filter.filter.deadline"
            name="notifications"
            size="sm"
          />
          Anmeldeschluss
        </span>
      </q-chip>
    </div>

    <!-- relevance -->
    <div class="col-auto">
      <q-chip
        :selected="!!filter.filter.geographicalScale"
        outline
        icon-selected="health_and_safety"
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        :class="
          filter.filter.geographicalScale ? 'bg-primary text-white' : 'bg-white'
        "
        @click="
          updateFilter({
            geographicalScale: filter.filter.geographicalScale
              ? null
              : 'national',
          })
        "
      >
        <span class="text-body2">
          <q-icon
            v-if="!filter.filter.geographicalScale"
            name="health_and_safety"
            size="sm"
          />
          Nat. Meisterschaft
        </span>
      </q-chip>
    </div>

    <!-- terrain -->
    <div class="col-auto">
      <q-chip
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        outline
        :selected="!!filter.filter.terrain"
        :class="filter.filter.terrain ? 'bg-primary text-white' : 'bg-white'"
        :removable="!!filter.filter.terrain"
        :icon-selected="getTerrainIcon(filter.filter.terrain)"
        @remove="updateFilter({ terrain: null })"
      >
        <span class="text-body2">
          <q-icon
            v-if="!filter.filter.terrain"
            :name="getTerrainIcon(undefined)"
            size="sm"
          />
          {{ getTerrainText(filter.filter.terrain) }}
        </span>

        <q-menu cover anchor="bottom left" auto-close class="text-no-wrap">
          <q-list>
            <q-item clickable @click="updateFilter({ terrain: 'urban' })">
              <q-item-section
                ><p class="q-mb-none">
                  <q-icon :name="getTerrainIcon('urban')" />
                  {{ getTerrainText('urban') }}
                </p></q-item-section
              >
            </q-item>
            <q-item clickable @click="updateFilter({ terrain: 'forest' })">
              <q-item-section
                ><p class="q-mb-none">
                  <q-icon :name="getTerrainIcon('forest')" />
                  {{ getTerrainText('forest') }}
                </p></q-item-section
              >
            </q-item>
            <q-item clickable @click="updateFilter({ terrain: 'mix' })">
              <q-item-section
                ><p class="q-mb-none">
                  <q-icon :name="getTerrainIcon('mix')" />
                  {{ getTerrainText('mix') }}
                </p></q-item-section
              >
            </q-item>
          </q-list>
        </q-menu>
      </q-chip>
    </div>

    <!-- previous -->
    <div class="col-auto">
      <q-chip
        :selected="!!filter.filter.previousDays"
        outline
        icon-selected="touch_app"
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        :class="
          filter.filter.previousDays ? 'bg-primary text-white' : 'bg-white'
        "
        :removable="!!filter.filter.previousDays"
        @click="updateFilter({ previousDays: 'add' })"
        @remove="updateFilter({ previousDays: 'reset' })"
      >
        <span class="text-body2">
          <q-icon v-if="!filter.filter.previousDays" name="refresh" size="sm" />
          <span v-if="filter.filter.previousDays">
            -{{ filter.filter.previousDays }}
            {{ filter.filter.previousDays > 1 ? `Tage` : `Tag` }}
          </span>
          <span v-else> Frühere OLs </span>
        </span>
      </q-chip>
    </div>

    <!-- search -->
    <div
      class="q-mr-xs"
      :class="[
        isDesktop
          ? 'col-11'
          : !!filter?.filter.searchString
          ? 'col-6'
          : 'col-4',
      ]"
    >
      <q-input
        v-model="filter.filter.searchString"
        :loading="props.loading"
        outlined
        label="Lauf suchen"
        color="primary"
        dense
        rounded
        label-color="primary"
        clearable
        clear-icon="close"
      />
    </div>

    <!-- region -->
    <div
      :class="[
        isDesktop
          ? 'col-11 q-pt-xs'
          : filter.filter.regions
          ? 'col-7'
          : 'col-5',
      ]"
    >
      <q-select
        v-model="filter.filter.regions"
        :options="regionStore.regions.map((region) => region.region)"
        dense
        rounded
        multiple
        outlined
        clearable
        color="primary"
        label-color="primary"
        label="Regionen"
        @update:model-value="emits('update:filter')"
        @clear="emits('update:filter')"
      />
    </div>
  </div>
</template>
