<template>
  <div
    class="result-row"
    :class="{
      'result-row--me': isMe,
      'result-row--followed': isFollowed && !isMe
    }"
  >
    <!-- summary (always visible, click to expand) -->
    <div class="result-summary" @click="$emit('toggle')">
      <div class="result-rank">
        <span v-if="entry.position" class="result-position">{{
          entry.position
        }}</span>
        <q-icon v-else name="remove" size="16px" class="text-grey-5" />
      </div>

      <div class="result-info">
        <div class="result-name-line">
          <span class="result-name">{{ entry.fullName }}</span>
          <q-icon
            v-if="isMe"
            name="person"
            size="14px"
            class="q-ml-xs text-primary"
          />
          <q-icon
            v-else-if="isFollowed"
            name="star"
            size="14px"
            class="q-ml-xs text-secondary"
          />
        </div>
        <div class="result-meta text-grey-7">
          <span v-if="entry.club">{{ entry.club }}</span>
          <span v-if="entry.club && entry.birthYear"> · </span>
          <span v-if="entry.birthYear">{{ entry.birthYear }}</span>
        </div>
      </div>

      <div class="result-time">
        <template v-if="entry.status === 'OK'">
          <div class="result-total">
            {{ formatRaceTime(entry.timeInSeconds) }}
          </div>
          <div v-if="gapSeconds" class="result-gap">
            {{ formatGap(gapSeconds) }}
          </div>
        </template>
        <q-chip
          v-else
          dense
          square
          color="grey-3"
          text-color="grey-8"
          class="result-status"
        >
          {{ statusShort(entry.status) || statusLabel(entry.status) }}
        </q-chip>
      </div>

      <!-- add/remove from the comparison chart, without expanding -->
      <q-btn
        v-if="hasSplits"
        round
        flat
        dense
        size="sm"
        class="result-compare-btn"
        :class="{ 'text-grey-5': !inCompare }"
        :style="
          inCompare
            ? {
                backgroundColor: compareColor ?? 'var(--q-primary)',
                color: '#fff'
              }
            : {}
        "
        :icon="inCompare ? 'check' : 'timeline'"
        @click.stop="$emit('toggle-compare')"
      >
        <q-tooltip>{{
          inCompare ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'
        }}</q-tooltip>
      </q-btn>
      <div v-else class="result-compare-btn" />

      <q-icon
        v-if="hasSplits"
        :name="expanded ? 'expand_less' : 'expand_more'"
        size="20px"
        class="result-chevron text-grey-6"
      />
      <div v-else class="result-chevron" />
    </div>

    <!-- time-behind bar -->
    <div v-if="entry.status === 'OK'" class="result-bar-track">
      <div
        class="result-bar"
        :class="{
          'result-bar--me': isMe,
          'result-bar--leader': entry.position === 1
        }"
        :style="{ width: `${barPct}%` }"
      />
    </div>

    <!-- expanded detail -->
    <q-slide-transition>
      <div v-show="expanded && hasSplits" class="result-detail">
        <div class="text-caption text-grey-7 q-mb-sm">
          Start {{ startClock }} · {{ legCount }} Posten
        </div>

        <race-result-splits-table :legs="legs" />

        <div v-if="legs.length" class="q-mt-md">
          <div class="text-caption text-grey-7 q-mb-xs">
            Zeitverlust pro Abschnitt
          </div>
          <client-only>
            <race-result-leg-chart :legs="legs" />
          </client-only>
        </div>
      </div>
    </q-slide-transition>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import type { RaceResultEntry } from '@/types/RaceResults'
  import type { RunnerAnalysis } from '@/composables/useSplitAnalysis'
  import RaceResultSplitsTable from './RaceResultSplitsTable.vue'
  import RaceResultLegChart from './RaceResultLegChart.vue'
  import {
    formatGap,
    formatRaceTime,
    statusLabel,
    statusShort
  } from '@/utils/raceResultFormat'

  const props = defineProps<{
    entry: RaceResultEntry
    runnerAnalysis?: RunnerAnalysis
    gapSeconds: number | null
    barPct: number
    isMe: boolean
    isFollowed: boolean
    expanded: boolean
    inCompare: boolean
    compareColor?: string | null
  }>()

  defineEmits<{ toggle: []; 'toggle-compare': [] }>()

  const legs = computed(() => props.runnerAnalysis?.legs ?? [])
  const hasSplits = computed(() => legs.value.length > 0)
  const legCount = computed(() => legs.value.length)

  const startClock = computed(() => {
    if (!props.entry.startTime) return '–'
    // startTime is ISO local "2025-06-25T18:48:08"
    const match = props.entry.startTime.match(/T(\d{2}:\d{2})/)
    return match ? match[1] : '–'
  })
</script>

<style lang="scss" scoped>
  .result-row {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 2px 0;
  }

  .result-row--me {
    background: rgba(38, 70, 83, 0.07);
    border-radius: 8px;
  }

  .result-row--followed {
    background: rgba(244, 162, 97, 0.1);
    border-radius: 8px;
  }

  .result-summary {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 8px 6px;
    cursor: pointer;
  }

  .result-rank {
    flex: 0 0 28px;
    text-align: center;
  }

  .result-position {
    font-weight: 700;
    font-size: 1rem;
  }

  .result-info {
    flex: 1 1 auto;
    min-width: 0;
  }

  .result-name-line {
    display: flex;
    align-items: center;
  }

  .result-name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-meta {
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-time {
    flex: 0 0 auto;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .result-total {
    font-weight: 600;
  }

  .result-gap {
    font-size: 0.75rem;
    color: var(--q-secondary);
  }

  .result-status {
    font-size: 0.7rem;
  }

  .result-compare-btn {
    flex: 0 0 30px;
  }

  .result-chevron {
    flex: 0 0 20px;
  }

  .result-bar-track {
    height: 3px;
    margin: 0 8px 6px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 2px;
    overflow: hidden;
  }

  .result-bar {
    height: 100%;
    background: rgba(38, 70, 83, 0.35);
    border-radius: 2px;
  }

  .result-bar--leader {
    background: var(--q-secondary);
  }

  .result-bar--me {
    background: var(--q-primary);
  }

  .result-detail {
    padding: 4px 10px 14px;
  }
</style>
