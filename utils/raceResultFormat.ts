import type { ResultStatus } from '@/types/RaceResults'

/**
 * Format a duration in seconds as `m:ss` (or `h:mm:ss` for ≥ 1h).
 * Returns `–` for null/undefined.
 */
export function formatRaceTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) {
    return '–'
  }
  const sign = seconds < 0 ? '-' : ''
  const total = Math.abs(Math.round(seconds))
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const secs = total % 60

  if (hours > 0) {
    return `${sign}${hours}:${pad(minutes)}:${pad(secs)}`
  }
  return `${sign}${minutes}:${pad(secs)}`
}

/**
 * Format a gap (seconds behind) as `+m:ss`. Empty string for ≤ 0 / null.
 */
export function formatGap(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || seconds <= 0) {
    return ''
  }
  return `+${formatRaceTime(seconds)}`
}

const STATUS_LABELS: Record<ResultStatus, string> = {
  OK: 'OK',
  DidNotFinish: 'Aufgegeben',
  MissingPunch: 'Fehlstempel',
  DidNotStart: 'Nicht gestartet',
  Disqualified: 'Disqualifiziert',
  OverTime: 'Zeitlimite überschritten',
  NotCompeting: 'Ausser Konkurrenz',
  Unknown: 'Unbekannt'
}

const STATUS_SHORT: Record<ResultStatus, string> = {
  OK: '',
  DidNotFinish: 'DNF',
  MissingPunch: 'Fehlst.',
  DidNotStart: 'DNS',
  Disqualified: 'Disq.',
  OverTime: 'Zeit',
  NotCompeting: 'a.K.',
  Unknown: '?'
}

export function statusLabel(status: ResultStatus): string {
  return STATUS_LABELS[status] ?? status
}

export function statusShort(status: ResultStatus): string {
  return STATUS_SHORT[status] ?? status
}

export function isRanked(status: ResultStatus): boolean {
  return status === 'OK'
}

/**
 * Extract o-l.ch's numeric `result_event_id` from a race's rankingLink.
 * Returns null when the link is missing or not an o-l.ch results URL.
 */
export function parseEventId(
  rankingLink: string | null | undefined
): string | null {
  if (!rankingLink) return null
  const match = rankingLink.match(/result_event_id=(\d+)/)
  return match ? match[1] : null
}

function pad(value: number): string {
  return value.toString().padStart(2, '0')
}
