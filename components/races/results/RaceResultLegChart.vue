<template>
  <div class="leg-chart">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue'
  import { Bar } from 'vue-chartjs'
  import type { ChartData, ChartOptions } from 'chart.js'
  import type { LegAnalysis } from '@/composables/useSplitAnalysis'
  import { fastestLegAmong, legRankAmong } from '@/composables/useSplitAnalysis'
  import { formatRaceTime } from '@/utils/raceResultFormat'

  const props = defineProps<{
    legs: LegAnalysis[]
    /** Comparison reference: 'winner' (vs the class) or 'selected' (Direktvergleich). */
    mode?: 'winner' | 'selected'
    /** Leg times per control for each selected runner (Direktvergleich mode). */
    selectedLegTimes?: (number | null)[][]
  }>()

  // Re-base "Zeitverlust" on the selected field when in Direktvergleich mode (and a
  // selection exists); otherwise vs the whole class (leg.legLoss / leg.legRank).
  const useSelected = computed(
    () =>
      props.mode === 'selected' &&
      !!props.selectedLegTimes?.some((r) => r.some((t) => t !== null && t > 0))
  )

  // Per-leg time loss + rank for the active reference (loss clamped to ≥ 0).
  const stats = computed(() =>
    props.legs.map((leg, i) => {
      if (useSelected.value) {
        const ref = fastestLegAmong(props.selectedLegTimes ?? [], i)
        const loss =
          leg.legTime !== null && ref !== null
            ? Math.max(0, leg.legTime - ref)
            : 0
        return {
          loss,
          rank: legRankAmong(leg.legTime, props.selectedLegTimes ?? [], i)
        }
      }
      return { loss: leg.legLoss ?? 0, rank: leg.legRank }
    })
  )

  // Bars = time lost vs the reference on each leg. Green if fastest of the field.
  const chartData = computed<ChartData<'bar'>>(() => ({
    labels: props.legs.map((_, i) => String(i + 1)),
    datasets: [
      {
        label: 'Zeitverlust pro Abschnitt',
        data: stats.value.map((s) => s.loss),
        backgroundColor: stats.value.map((s) =>
          s.rank === 1 ? '#2a9d8f' : '#e76f51'
        ),
        borderRadius: 3
      }
    ]
  }))

  const chartOptions = computed<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { display: true, text: 'Verlust' },
        ticks: { callback: (value) => formatRaceTime(Number(value)) }
      },
      x: { title: { display: true, text: 'Posten' } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const s = stats.value[ctx.dataIndex]
            const loss = s?.loss ?? 0
            const rank = s?.rank ? ` · Rang ${s.rank}` : ''
            return loss > 0
              ? `+${formatRaceTime(loss)}${rank}`
              : `Bester${rank}`
          }
        }
      }
    }
  }))
</script>

<style lang="scss" scoped>
  .leg-chart {
    position: relative;
    height: 180px;
    width: 100%;
  }
</style>
