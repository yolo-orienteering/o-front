<template>
  <div
    v-if="filter"
    class="row bg-white items-center races-filter-container q-py-sm no-wrap q-px-sm border-bottom-primary"
  >
    <!-- deadline -->
    <div class="col-auto">
      <q-chip
        :selected="filter.deadline"
        outline
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        icon-selected="notifications"
        :class="filter.deadline ? 'bg-primary text-white' : 'bg-white'"
        @click="updateFilter({ deadline: !filter.deadline })"
      >
        <span class="text-body2">
          <q-icon v-if="!filter.deadline" name="notifications" size="sm" />
          Anmeldeschluss
        </span>
      </q-chip>
    </div>

    <!-- relevance -->
    <div class="col-auto">
      <q-chip
        :selected="!!filter.geographicalScale"
        outline
        icon-selected="health_and_safety"
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        :class="filter.geographicalScale ? 'bg-primary text-white' : 'bg-white'"
        @click="
          updateFilter({
            geographicalScale: filter.geographicalScale ? null : 'national',
          })
        "
      >
        <span class="text-body2">
          <q-icon
            v-if="!filter.geographicalScale"
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
        :selected="!!filter.terrain"
        :class="filter.terrain ? 'bg-primary text-white' : 'bg-white'"
        :removable="!!filter.terrain"
        :icon-selected="getTerrainIcon(filter.terrain)"
        @remove="updateFilter({ terrain: null })"
      >
        <span class="text-body2">
          <q-icon
            v-if="!filter.terrain"
            :name="getTerrainIcon(undefined)"
            size="sm"
          />
          {{ getTerrainText(filter.terrain) }}
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
        :selected="!!filter.previousDays"
        outline
        icon-selected="touch_app"
        class="q-ml-none"
        color="primary"
        dense
        size="xl"
        :class="filter.previousDays ? 'bg-primary text-white' : 'bg-white'"
        :removable="!!filter.previousDays"
        @click="updateFilter({ previousDays: 'add' })"
        @remove="updateFilter({ previousDays: 'reset' })"
      >
        <span class="text-body2">
          <q-icon v-if="!filter.previousDays" name="refresh" size="sm" />
          <span v-if="filter.previousDays">
            -{{ filter.previousDays }}
            {{ filter.previousDays > 1 ? `Tage` : `Tag` }}
          </span>
          <span v-else> Frühere OLs </span>
        </span>
      </q-chip>
    </div>

    <!-- search -->
    <div class="q-mr-xs" :class="[!!filter?.searchString ? 'col-6' : 'col-4']">
      <q-input
        v-model="filter.searchString"
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
    <div :class="[filter.regions ? 'col-7' : 'col-5']">
      <q-select
        v-model="filter.regions"
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

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useSyncCenter } from '@/stores/syncCenter'
  import { useRegion } from '@/stores/useRegion'
  import { useRaceTerrain } from '@/composables/useRaceTerrain'

  const { filter } = useSyncCenter()
  const regionStore = useRegion()
  const { getTerrainIcon, getTerrainText } = useRaceTerrain()

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

<style lang="scss">
  .races-filter-container {
    overflow-x: scroll;
  }
</style>
