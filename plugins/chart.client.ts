import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

/**
 * Register only the Chart.js pieces we use (line + bar) — client-side only.
 * vue-chartjs <Line>/<Bar> components rely on this global registry.
 * The zoom plugin adds pinch-zoom + pan (it imports hammerjs for touch).
 */
export default defineNuxtPlugin(() => {
  Chart.register(
    LineController,
    BarController,
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
  )
})
