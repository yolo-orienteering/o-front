<template>
  <div class="split-chart-wrap">
    <q-btn
      class="reset-zoom"
      dense
      round
      flat
      size="sm"
      icon="zoom_out_map"
      @click="resetZoom"
    >
      <q-tooltip>Zoom zurücksetzen</q-tooltip>
    </q-btn>
    <div class="split-chart">
      <Line ref="chartRef" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { Line } from 'vue-chartjs'
  import type { ChartData, ChartOptions } from 'chart.js'
  import { formatRaceTime } from '@/utils/raceResultFormat'

  /** One line: cumulative seconds behind the leader per control (null = no data). */
  interface SplitChartSeries {
    label: string
    data: (number | null)[]
    color: string
    dashed?: boolean
  }

  const props = defineProps<{
    /** Leader's cumulative time per control — the x position of each control. */
    xValues: (number | null)[]
    /** Control code per index (for tooltips). */
    controls: (number | null)[]
    series: SplitChartSeries[]
  }>()

  const chartRef = ref<InstanceType<typeof Line> | null>(null)

  // Strictly increasing numeric x positions (course time). Controls with longer
  // legs sit further apart, so the column spacing reflects leg length/effort.
  const xs = computed(() => {
    let last = 0
    return props.xValues.map((v) => {
      const x = v !== null && v > last ? v : last + 1
      last = x
      return x
    })
  })

  const chartData = computed<ChartData<'line'>>(() => ({
    datasets: props.series.map((s) => ({
      label: s.label,
      data: xs.value.map((x, i) => ({ x, y: s.data[i] as number })),
      borderColor: s.color,
      backgroundColor: s.color,
      borderDash: s.dashed ? [6, 4] : undefined,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 5,
      tension: 0.2,
      spanGaps: true
    }))
  }))

  const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: 0, right: 6, top: 6, bottom: 0 } },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        reverse: true, // smaller gap (better) on top
        ticks: {
          callback: (value) => formatRaceTime(Number(value)),
          font: { size: 10 },
          maxTicksLimit: 6
        },
        grid: { drawTicks: false }
      },
      x: {
        type: 'linear',
        min: 0,
        ticks: {
          callback: (value) => formatRaceTime(Number(value)),
          font: { size: 10 },
          maxRotation: 0,
          autoSkipPadding: 16
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          title: (items) => {
            const i = items[0]?.dataIndex ?? 0
            const code = props.controls[i]
            return `Posten ${i + 1}${code ? ` (${code})` : ''}`
          },
          label: (ctx) =>
            `${ctx.dataset.label}: +${formatRaceTime(Number(ctx.parsed.y))}`
        }
      },
      zoom: {
        pan: { enabled: true, mode: 'x' },
        zoom: {
          wheel: { enabled: true },
          pinch: { enabled: true },
          mode: 'x'
        },
        limits: { x: { min: 'original', max: 'original' } }
      }
    }
  }))

  function resetZoom(): void {
    // vue-chartjs exposes the underlying Chart instance as `.chart`
    const chart = (
      chartRef.value as unknown as { chart?: { resetZoom?: () => void } }
    )?.chart
    chart?.resetZoom?.()
  }
</script>

<style lang="scss" scoped>
  .split-chart-wrap {
    position: relative;
  }

  .split-chart {
    position: relative;
    height: 300px;
    width: 100%;
    touch-action: pan-y; // let the plugin handle horizontal pan/pinch
  }

  .reset-zoom {
    position: absolute;
    top: -2px;
    right: 0;
    z-index: 1;
    color: var(--q-primary);
  }
</style>
