import type { RaceResultClass } from '@/types/RaceResults'

export interface LegAnalysis {
  /** Physical control code for this leg's destination control. */
  control: number | null
  /** Cumulative time from start to this control, in seconds. */
  cumulative: number | null
  /** Time for this leg (previous control → this control), in seconds. */
  legTime: number | null
  /** Rank of this leg time among runners who ran it (1 = fastest). */
  legRank: number | null
  /** legTime − fastest leg time at this control (≥ 0). */
  legLoss: number | null
  /** cumulative − leader's cumulative at this control (≥ 0). */
  cumulativeBehind: number | null
}

export interface RunnerAnalysis {
  legs: LegAnalysis[]
}

export interface SplitAnalysis {
  /** Number of controls in the course (max splits across runners). */
  legCount: number
  /** Control code per leg index. */
  controls: (number | null)[]
  /** Leader's cumulative time per control index. */
  bestCumulative: (number | null)[]
  /** Fastest leg time per control index. */
  bestLeg: (number | null)[]
  /** Per-runner analysis, parallel to raceClass.results. */
  byIndex: RunnerAnalysis[]
}

const EMPTY: SplitAnalysis = {
  legCount: 0,
  controls: [],
  bestCumulative: [],
  bestLeg: [],
  byIndex: []
}

/**
 * Split-time (Zwischenzeiten) analysis for a single class. All runners in a class
 * share the same course, so splits are aligned by sequence index. Computes per-leg
 * times, per-leg ranks, time lost per leg, and cumulative time behind the leader.
 */
export function useSplitAnalysis() {
  function analyse(
    raceClass: RaceResultClass | null | undefined
  ): SplitAnalysis {
    if (!raceClass || !raceClass.results.length) {
      return EMPTY
    }

    const results = raceClass.results
    const legCount = results.reduce(
      (max, r) => Math.max(max, r.splits.length),
      0
    )
    if (!legCount) {
      return { ...EMPTY, byIndex: results.map(() => ({ legs: [] })) }
    }

    // Control codes — take them from a runner that ran the whole course.
    const reference =
      results.find((r) => r.splits.length === legCount) ?? results[0]
    const controls = Array.from(
      { length: legCount },
      (_, i) => reference?.splits[i]?.control ?? null
    )

    // cumulative[runner][leg] and legTime[runner][leg]
    const cumulative = results.map((r) =>
      Array.from({ length: legCount }, (_, i) => valid(r.splits[i]?.time))
    )
    const legTimes = cumulative.map((cum) =>
      Array.from({ length: legCount }, (_, i) => {
        const cur = cum[i]
        const prev = i === 0 ? 0 : cum[i - 1]
        return cur !== null && prev !== null ? cur - prev : null
      })
    )

    // Best (fastest) cumulative + leg per control index.
    const bestCumulative: (number | null)[] = []
    const bestLeg: (number | null)[] = []
    for (let i = 0; i < legCount; i++) {
      bestCumulative.push(min(cumulative.map((c) => c[i])))
      bestLeg.push(min(legTimes.map((l) => l[i])))
    }

    const byIndex: RunnerAnalysis[] = results.map((_, rIdx) => {
      const legs: LegAnalysis[] = []
      for (let i = 0; i < legCount; i++) {
        const cum = cumulative[rIdx][i]
        const legTime = legTimes[rIdx][i]

        let legRank: number | null = null
        if (legTime !== null && legTime > 0) {
          const faster = legTimes.reduce(
            (count, l) =>
              l[i] !== null &&
              (l[i] as number) > 0 &&
              (l[i] as number) < legTime
                ? count + 1
                : count,
            0
          )
          legRank = faster + 1
        }

        legs.push({
          control: controls[i],
          cumulative: cum,
          legTime,
          legRank,
          legLoss:
            legTime !== null && legTime > 0 && bestLeg[i] !== null
              ? legTime - (bestLeg[i] as number)
              : null,
          cumulativeBehind:
            cum !== null && bestCumulative[i] !== null
              ? cum - (bestCumulative[i] as number)
              : null
        })
      }
      return { legs }
    })

    return { legCount, controls, bestCumulative, bestLeg, byIndex }
  }

  return { analyse }
}

/**
 * A cumulative split time must be strictly positive — `0` is the placeholder
 * o-l.ch emits for a missed punch (and you can't reach a control in 0s), so
 * treat 0/negative/NaN as missing. Otherwise such a 0 becomes the "leader" and
 * everyone's Rückstand collapses to their own total.
 */
function valid(time: number | null | undefined): number | null {
  return time !== null && time !== undefined && time > 0 ? time : null
}

/** Smallest strictly-positive value (ignores null and artifact 0/negative times). */
function min(values: (number | null)[]): number | null {
  let best: number | null = null
  for (const v of values) {
    if (v !== null && v > 0 && (best === null || v < best)) {
      best = v
    }
  }
  return best
}
