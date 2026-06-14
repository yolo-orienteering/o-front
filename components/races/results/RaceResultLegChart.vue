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
  import { formatRaceTime } from '@/utils/raceResultFormat'

  const props = defineProps<{ legs: LegAnalysis[] }>()

  // Bars = time lost vs the fastest runner on each leg. Green if fastest.
  const chartData = computed<ChartData<'bar'>>(() => ({
    labels: props.legs.map((_, i) => String(i + 1)),
    datasets: [
      {
        label: 'Zeitverlust pro Abschnitt',
        data: props.legs.map((l) => l.legLoss ?? 0),
        backgroundColor: props.legs.map((l) =>
          l.legRank === 1 ? '#2a9d8f' : '#e76f51'
        ),
        borderRadius: 3
      }
    ]
  }))

  const chartOptions: ChartOptions<'bar'> = {
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
            const leg = props.legs[ctx.dataIndex]
            const loss = leg?.legLoss ?? 0
            const rank = leg?.legRank ? ` · Rang ${leg.legRank}` : ''
            return loss > 0
              ? `+${formatRaceTime(loss)}${rank}`
              : `Bester${rank}`
          }
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .leg-chart {
    position: relative;
    height: 180px;
    width: 100%;
  }
</style>
