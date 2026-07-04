<template>
  <div class="split-chart-wrap">
    <div class="split-chart">
      <Line
        ref="chartRef"
        :data="chartData"
        :options="chartOptions"
        :plugins="chartPlugins"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref } from 'vue'
  import { Line } from 'vue-chartjs'
  import type { Chart, ChartData, ChartOptions, Plugin } from 'chart.js'
  import { formatRaceTime } from '@/utils/raceResultFormat'

  /** One line: cumulative seconds behind the active reference per control (null = no data). */
  interface SplitChartSeries {
    label: string
    data: (number | null)[]
    color: string
    dashed?: boolean
  }

  const props = defineProps<{
    /**
     * Reference runner's cumulative time per control (the class winner or the
     * fastest selected runner, per mode) — the x position of each control, so
     * column spacing reflects leg length.
     */
    xValues: (number | null)[]
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

  // Fixed lower bound of the reversed y-axis (0 = fastest, pinned to the top).
  // Deriving the max from the data — and freezing both ends — keeps 0:00 glued to
  // the top edge while zooming/panning x, instead of the axis auto-rescaling to
  // whatever happens to be in view (which made the 0-line drift mid-chart).
  const yMax = computed(() => {
    let m = 0
    for (const s of props.series) {
      for (const v of s.data) {
        if (v !== null && v !== undefined && v > m) m = v
      }
    }
    // Round up to the next 5s and add headroom; keep a sensible floor so a lone
    // (flat) line still gets a non-degenerate axis.
    return Math.max(Math.ceil((m * 1.1) / 5) * 5, 30)
  })

  // Small negative headroom (~5% of the range) so the top line at 0:00 and its
  // dots aren't clipped against the top edge. 0:00 stays effectively at the top;
  // the sliver above it is just padding (its label is hidden). Fixed chart height
  // → this is a near-constant ~13px gap regardless of the range.
  const yMin = computed(() => -yMax.value * 0.05)

  // Renders the control (Posten) sequence numbers along the top of the plot,
  // replacing the hover tooltip. It reads the live x scale on every draw, so the
  // labels stay pinned above their points at any zoom/pan level. Labels that
  // would overlap a neighbour are skipped (zoom in to reveal them).
  const postenAxisPlugin: Plugin<'line'> = {
    id: 'postenAxis',
    afterDraw(chart: Chart<'line'>) {
      const xScale = chart.scales.x
      if (!xScale) return
      const { ctx, chartArea } = chart
      ctx.save()
      ctx.font = '600 10px sans-serif'
      ctx.fillStyle = '#78909c'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      let lastPx = -Infinity
      xs.value.forEach((x, i) => {
        const px = xScale.getPixelForValue(x)
        if (px < chartArea.left - 1 || px > chartArea.right + 1) return
        if (px - lastPx < 13) return
        lastPx = px
        ctx.fillText(String(i + 1), px, chartArea.top - 3)
      })
      ctx.restore()
    }
  }

  // Stable array reference so vue-chartjs doesn't re-init the chart every render.
  const chartPlugins = [postenAxisPlugin]

  const chartData = computed<ChartData<'line'>>(() => ({
    datasets: props.series.map((s) => ({
      label: s.label,
      // Every runner starts level (0 behind at 0:00), so anchor each line at the
      // origin on the y-axis, then plot the per-control gaps.
      data: [
        { x: 0, y: 0 },
        ...xs.value.map((x, i) => ({ x, y: s.data[i] as number }))
      ],
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
    // Extra top room holds the Posten numbers drawn by postenAxisPlugin.
    layout: { padding: { left: 0, right: 6, top: 20, bottom: 0 } },
    scales: {
      y: {
        reverse: true, // smaller gap (better) on top
        // Pinned bounds (never rescale on zoom); the small negative min is only
        // top padding so the 0:00 line/dots clear the edge.
        min: yMin.value,
        max: yMax.value,
        ticks: {
          // Hide the padding region's (negative) label; 0:00 stays the top tick.
          callback: (value) =>
            Number(value) < 0 ? '' : formatRaceTime(Number(value)),
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
      // Tooltip removed on purpose — the Posten numbers along the top and the
      // time axes now carry the labelling the hover popover used to.
      tooltip: { enabled: false },
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
</style>
