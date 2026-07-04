<template>
  <div class="splits-table">
    <div class="splits-row splits-head text-grey-7">
      <div class="splits-col-control">Posten</div>
      <div class="splits-col-num">Abschnitt</div>
      <div class="splits-col-num">Total</div>
      <div class="splits-col-num">{{ compareHeader }}</div>
    </div>

    <div
      v-for="row in rows"
      :key="row.seq"
      class="splits-row"
      :class="{ 'splits-row--best': row.isBest }"
    >
      <div class="splits-col-control">
        <span class="splits-seq">{{ row.seq }}</span>
        <span class="splits-code">({{ row.control ?? '–' }})</span>
      </div>
      <div class="splits-col-num">
        <span class="splits-leg-time">{{ formatRaceTime(row.legTime) }}</span>
      </div>
      <div class="splits-col-num">{{ formatRaceTime(row.cumulative) }}</div>
      <div class="splits-col-num" :class="row.deltaClass">
        {{ formatDelta(row.delta) }}
        <span v-if="row.rank" class="splits-rank" :class="rankClass(row.rank)">
          {{ row.rank }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { LegAnalysis } from '@/composables/useSplitAnalysis'
  import { formatDelta, formatRaceTime } from '@/utils/raceResultFormat'

  const props = defineProps<{
    legs: LegAnalysis[]
    /** Comparison reference: 'winner' (Rückstand) or 'selected' (Direktvergleich). */
    mode?: 'winner' | 'selected'
    /** Fastest selected runner's cumulative time per control (selected mode). */
    baseline?: (number | null)[]
    /** Leg (section) times per control for each selected runner (selected mode). */
    selectedLegTimes?: (number | null)[][]
  }>()

  const hasBaseline = computed(
    () => !!props.baseline?.some((v) => v !== null && v > 0)
  )

  // Direktvergleich needs a selection to reference; without one, fall back to the
  // always-available winner comparison so the column is never empty.
  const effectiveMode = computed(() =>
    props.mode === 'selected' && hasBaseline.value ? 'selected' : 'winner'
  )

  const compareHeader = computed(() =>
    effectiveMode.value === 'selected' ? 'Direktvergleich' : 'Rückstand'
  )

  /** Rank of this runner's leg among the selected runners (1 = fastest of the field). */
  function rankAmongSelected(legTime: number | null, i: number): number | null {
    if (legTime === null || legTime <= 0 || !props.selectedLegTimes) return null
    let faster = 0
    for (const legs of props.selectedLegTimes) {
      const t = legs[i]
      if (t !== null && t > 0 && t < legTime) faster++
    }
    return faster + 1
  }

  // Precompute the display values once per (legs, mode) change — the template then
  // only reads plain fields, so toggling the mode re-renders cheaply.
  const rows = computed(() => {
    const selected = effectiveMode.value === 'selected'
    return props.legs.map((leg, i) => {
      let delta: number | null
      let rank: number | null
      if (selected) {
        const base = props.baseline?.[i]
        delta =
          leg.cumulative !== null && base !== null && base !== undefined
            ? leg.cumulative - base
            : null
        rank = rankAmongSelected(leg.legTime, i)
      } else {
        delta = leg.cumulativeBehind
        rank = leg.legRank
      }
      return {
        seq: i + 1,
        control: leg.control,
        legTime: leg.legTime,
        cumulative: leg.cumulative,
        delta,
        rank,
        // Highlight the row where this runner led the compared field on the leg.
        isBest: rank === 1,
        deltaClass: deltaClass(delta)
      }
    })
  })

  function deltaClass(delta: number | null): string {
    if (delta === null || Math.round(delta) === 0) return 'text-grey-6'
    return delta > 0 ? 'splits-behind' : 'text-positive'
  }

  function rankClass(rank: number | null): string {
    if (rank === null) return ''
    if (rank === 1) return 'splits-rank--gold'
    if (rank <= 3) return 'splits-rank--good'
    return 'splits-rank--normal'
  }
</script>

<style lang="scss" scoped>
  .splits-table {
    font-size: 0.8rem;
    width: 100%;
  }

  .splits-row {
    display: grid;
    grid-template-columns: 0.9fr 0.85fr 0.95fr 1.3fr;
    align-items: center;
    gap: 2px;
    padding: 4px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  .splits-head {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .splits-row--best {
    background: rgba(42, 157, 143, 0.08);
  }

  .splits-col-num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .splits-col-control {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .splits-seq {
    font-weight: 600;
  }

  .splits-code {
    font-size: 0.7rem;
    color: var(--q-dark);
    opacity: 0.5;
  }

  .splits-leg-time {
    font-weight: 500;
  }

  .splits-rank {
    display: inline-block;
    min-width: 1.4em;
    margin-left: 6px;
    padding: 0 4px;
    border-radius: 6px;
    font-size: 0.65rem;
    line-height: 1.5;
    text-align: center;
  }

  .splits-rank--gold {
    background: var(--q-secondary);
    color: #fff;
    font-weight: 700;
  }

  .splits-rank--good {
    background: rgba(42, 157, 143, 0.18);
    color: #1d7268;
  }

  .splits-rank--normal {
    background: rgba(0, 0, 0, 0.06);
    color: var(--q-dark);
  }

  .splits-behind {
    color: var(--q-secondary);
  }
</style>
