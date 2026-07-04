<template>
  <div class="result-list">
    <!-- reference toggle: gap to the winner vs. among the selected runners -->
    <div class="row no-wrap q-gutter-sm items-top justify-between q-mt-md">
      <!-- name search (client-side filter) -->
      <q-input
        v-model="search"
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

      <q-btn-toggle
        v-model="compareMode"
        :options="compareModeOptions"
        dense
        no-caps
        rounded
        toggle-color="primary"
        text-color="grey-7"
        color="primary"
      />
    </div>
  </div>
  <div class="row justify-end">
    <div class="text-caption text-grey-5 q-mt-sm">
      {{ compareHint }}
    </div>
  </div>

  <!-- comparison chart -->
  <div v-if="hasSplits && compareSeries.length" class="q-mt-md">
    <client-only>
      <race-result-split-chart
        :x-values="chartBaseline"
        :series="compareSeries"
      />
    </client-only>

    <!-- ranked rows (filtered by name search; original index preserved) -->
    <div class="q-mt-md">
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
        :compare-mode="compareMode"
        :compare-baseline="compareBaseline"
        :selected-leg-times="selectedLegTimes"
        @toggle="toggleExpand(row.index)"
        @toggle-compare="toggleCompare(row.index)"
      />
    </div>

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

  // Comparison reference: 'winner' = classic gap to the class winner (Rückstand);
  // 'selected' = Direktvergleich, gap to the fastest of the selected runners.
  type CompareMode = 'winner' | 'selected'
  const compareMode = ref<CompareMode>('winner')
  const compareModeOptions = [
    { label: 'Sieger', value: 'winner' },
    { label: 'Direktvergleich', value: 'selected' }
  ]
  const compareHint = computed(() =>
    compareMode.value === 'selected'
      ? 'Vergleich der gewählten Läufer:innen'
      : 'Rückstand auf die Siegerzeit'
  )

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

  // Reference line for the comparison chart: the fastest of the *currently
  // selected* runners at each control — not the category leader. Comparing
  // places 4/5/8 makes the fastest of those three the 0-line, so the chart zooms
  // in on their mutual gaps instead of dwarfing them against the overall winner.
  const compareBaseline = computed<(number | null)[]>(() =>
    Array.from({ length: props.analysis.legCount }, (_, i) => {
      let best: number | null = null
      for (const index of compareIndices.value) {
        const cum = props.analysis.byIndex[index]?.legs[i]?.cumulative ?? null
        if (cum !== null && cum > 0 && (best === null || cum < best)) {
          best = cum
        }
      }
      return best
    })
  )

  // Leg (section) times per control for each selected runner — feeds the split
  // table's "Direktvergleich" rank badge (rank within the compared field).
  const selectedLegTimes = computed<(number | null)[][]>(() =>
    compareIndices.value.map(
      (index) => props.analysis.byIndex[index]?.legs.map((l) => l.legTime) ?? []
    )
  )

  // The 0-line the chart is drawn against, per the active mode: the class winner
  // (analysis.bestCumulative) or the fastest selected runner (compareBaseline).
  const chartBaseline = computed<(number | null)[]>(() =>
    compareMode.value === 'selected'
      ? compareBaseline.value
      : props.analysis.bestCumulative
  )

  const compareSeries = computed(() =>
    compareIndices.value.map((index) => {
      const entry = props.raceClass.results[index]
      const legs = props.analysis.byIndex[index]?.legs ?? []
      return {
        label: entry.fullName,
        // Cumulative gap to the active reference (winner or fastest selected).
        data: legs.map((l, i) => {
          const base = chartBaseline.value[i]
          return l.cumulative !== null && base !== null && base !== undefined
            ? l.cumulative - base
            : null
        }),
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
