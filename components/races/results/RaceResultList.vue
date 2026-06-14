<template>
  <div class="result-list">
    <!-- name search (client-side filter) -->
    <q-input
      v-model="search"
      class="q-mb-md"
      dense
      outlined
      rounded
      clearable
      debounce="100"
      placeholder="Läufer:in suchen …"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- comparison chart -->
    <div v-if="hasSplits && compareSeries.length" class="q-mb-md">
      <client-only>
        <race-result-split-chart
          :x-values="analysis.bestCumulative"
          :controls="analysis.controls"
          :series="compareSeries"
        />
      </client-only>
      <div class="row items-center justify-between q-mb-xs">
        <div class="text-caption text-grey-6">
          zoomen & seitlich schieben möglich
        </div>
        <q-btn
          v-if="compareIndices.length"
          dense
          flat
          no-caps
          size="sm"
          icon="close"
          label="Vergleich leeren"
          @click="compareIndices = []"
        />
      </div>
    </div>

    <!-- ranked rows (filtered by name search; original index preserved) -->
    <race-result-row
      v-for="row in visibleRows"
      :key="`${row.entry.identifier}-${row.index}`"
      :entry="row.entry"
      :runner-analysis="analysis.byIndex[row.index]"
      :gap-seconds="gapFor(row.index)"
      :bar-pct="barPctFor(row.index)"
      :is-me="isMe(row.entry.identifier)"
      :is-followed="isFollowed(row.entry.identifier)"
      :expanded="expandedIndex === row.index"
      :in-compare="compareIndices.includes(row.index)"
      :compare-color="compareColorMap.get(row.index) ?? null"
      @toggle="toggleExpand(row.index)"
      @toggle-compare="toggleCompare(row.index)"
    />

    <div v-if="!visibleRows.length" class="text-center text-grey-6 q-py-lg">
      Keine Läufer:innen gefunden für „{{ search }}“.
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, watch } from 'vue'
  import type { RaceResultClass } from '@/types/RaceResults'
  import type { SplitAnalysis } from '@/composables/useSplitAnalysis'
  import RaceResultRow from './RaceResultRow.vue'
  import RaceResultSplitChart from './RaceResultSplitChart.vue'

  const props = defineProps<{
    raceClass: RaceResultClass
    analysis: SplitAnalysis
    meIdentifier: string | false
    followedIdentifiers: string[]
  }>()

  // Brand-aligned palette for additional comparison lines.
  const PALETTE = ['#2a9d8f', '#e76f51', '#e9c46a', '#8d99ae', '#9b5de5']

  const expandedIndex = ref<number | null>(null)
  const compareIndices = ref<number[]>([])
  const search = ref('')

  // Rows to render, filtered by the name search but keeping the original index
  // so ranks, gaps, bars and the comparison chart stay relative to the full field.
  const visibleRows = computed(() => {
    const rows = props.raceClass.results.map((entry, index) => ({
      entry,
      index
    }))
    const query = (search.value ?? '').trim().toLowerCase()
    if (!query) return rows
    return rows.filter(({ entry }) => {
      const haystack = `${entry.fullName} ${entry.club ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  })

  const okResults = computed(() =>
    props.raceClass.results.filter(
      (r) => r.status === 'OK' && r.timeInSeconds !== null
    )
  )
  const leaderTime = computed(() => okResults.value[0]?.timeInSeconds ?? null)
  const maxGap = computed(() => {
    if (leaderTime.value === null || !okResults.value.length) return 0
    const slowest = okResults.value.reduce(
      (max, r) => Math.max(max, r.timeInSeconds as number),
      leaderTime.value
    )
    return slowest - leaderTime.value
  })

  const hasSplits = computed(() => props.analysis.legCount > 0)

  function isMe(identifier: string): boolean {
    return props.meIdentifier !== false && identifier === props.meIdentifier
  }
  function isFollowed(identifier: string): boolean {
    return props.followedIdentifiers.includes(identifier)
  }

  function gapFor(index: number): number | null {
    const entry = props.raceClass.results[index]
    if (entry.status !== 'OK' || entry.timeInSeconds === null) return null
    if (leaderTime.value === null) return null
    return entry.timeInSeconds - leaderTime.value
  }

  // Inverted "deficit" bar: more time behind the leader → fuller bar
  // (leader ≈ empty, slowest ≈ full).
  function barPctFor(index: number): number {
    const gap = gapFor(index)
    if (gap === null) return 0
    if (maxGap.value <= 0) return 0
    return Math.min(100, Math.round((gap / maxGap.value) * 100))
  }

  function toggleExpand(index: number): void {
    expandedIndex.value = expandedIndex.value === index ? null : index
  }

  function toggleCompare(index: number): void {
    const at = compareIndices.value.indexOf(index)
    if (at !== -1) {
      compareIndices.value.splice(at, 1)
    } else if (compareIndices.value.length < 6) {
      compareIndices.value.push(index)
    }
  }

  // Stable color per selected runner, shared by the chart lines and the row
  // swatches. Me → primary, leader → secondary, others → palette in select order.
  const compareColorMap = computed(() => {
    const map = new Map<number, string>()
    let slot = 0
    for (const index of compareIndices.value) {
      const entry = props.raceClass.results[index]
      if (!entry) continue
      if (isMe(entry.identifier)) {
        map.set(index, '#264653') // primary
      } else if (entry.position === 1) {
        map.set(index, '#f4a261') // secondary (leader)
      } else {
        map.set(index, PALETTE[slot % PALETTE.length])
        slot++
      }
    }
    return map
  })

  const compareSeries = computed(() =>
    compareIndices.value.map((index) => {
      const entry = props.raceClass.results[index]
      return {
        label: entry.fullName,
        data:
          props.analysis.byIndex[index]?.legs.map((l) => l.cumulativeBehind) ??
          [],
        color: compareColorMap.value.get(index) ?? PALETTE[0],
        dashed: entry.position === 1
      }
    })
  )

  // Default the comparison to leader + the current user (when present with splits).
  watch(
    () => props.raceClass,
    () => {
      expandedIndex.value = null
      search.value = ''
      const defaults: number[] = []
      const leaderIdx = props.raceClass.results.findIndex(
        (r) => r.position === 1
      )
      if (leaderIdx !== -1) defaults.push(leaderIdx)
      const meIdx = props.raceClass.results.findIndex(
        (r) => isMe(r.identifier) && r.splits.length > 0
      )
      if (meIdx !== -1 && !defaults.includes(meIdx)) defaults.push(meIdx)
      compareIndices.value = defaults
    },
    { immediate: true }
  )

  // The profile identity may resolve (from localStorage) after the class loads —
  // auto-add the current user to the comparison once it becomes available.
  watch(
    () => props.meIdentifier,
    (identifier) => {
      if (identifier === false) return
      const meIdx = props.raceClass.results.findIndex(
        (r) => r.identifier === identifier && r.splits.length > 0
      )
      if (meIdx !== -1 && !compareIndices.value.includes(meIdx)) {
        compareIndices.value.push(meIdx)
      }
    }
  )
</script>
