<template>
  <div class="splits-table">
    <div class="splits-row splits-head text-grey-7">
      <div class="splits-col-control">Posten</div>
      <div class="splits-col-num">Abschnitt</div>
      <div class="splits-col-num">Total</div>
      <div class="splits-col-num">Rückstand</div>
    </div>

    <div
      v-for="(leg, index) in legs"
      :key="index"
      class="splits-row"
      :class="{ 'splits-row--best': leg.legRank === 1 }"
    >
      <div class="splits-col-control">
        <span class="splits-seq">{{ index + 1 }}</span>
        <span class="splits-code">({{ leg.control ?? '–' }})</span>
      </div>
      <div class="splits-col-num">
        <span class="splits-leg-time">{{ formatRaceTime(leg.legTime) }}</span>
        <span
          v-if="leg.legRank"
          class="splits-rank"
          :class="rankClass(leg.legRank)"
        >
          {{ leg.legRank }}
        </span>
      </div>
      <div class="splits-col-num">{{ formatRaceTime(leg.cumulative) }}</div>
      <div class="splits-col-num splits-behind">
        <span v-if="leg.cumulativeBehind && leg.cumulativeBehind > 0">
          {{ formatGap(leg.cumulativeBehind) }}
        </span>
        <span v-else class="text-positive">–</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type { LegAnalysis } from '@/composables/useSplitAnalysis'
  import { formatGap, formatRaceTime } from '@/utils/raceResultFormat'

  defineProps<{ legs: LegAnalysis[] }>()

  function rankClass(rank: number): string {
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
    grid-template-columns: 1fr 1.2fr 1fr 1fr;
    align-items: center;
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
