import { XMLParser } from 'fast-xml-parser'
import type {
  RaceResultClass,
  RaceResultEntry,
  RaceResultSplit,
  RaceResultsResponse,
  ResultStatus
} from '../../../types/RaceResults'

/**
 * Server-side proxy for o-l.ch race results (Ranglisten).
 *
 * o-l.ch serves IOF Data Standard 3.0 XML but sends no CORS headers, so the
 * browser/WebView cannot read it directly. This route fetches it server-side
 * (deployed as a Cloudflare Pages Function), transforms it to JSON and returns it.
 *
 * Edge-runtime safe: uses the global `fetch` (no axios) and `fast-xml-parser`
 * (pure JS, no Node built-ins). It accepts ONLY a numeric `result_event_id` and
 * builds a fixed o-l.ch URL itself — no client-supplied URL (no SSRF surface).
 */

const OL_RESULTS_URL = 'https://www.o-l.ch/cgi-bin/results'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Force these repeating nodes to always be arrays, even with a single child.
  isArray: (name) =>
    name === 'ClassResult' || name === 'PersonResult' || name === 'SplitTime'
})

const KNOWN_STATUSES: ResultStatus[] = [
  'OK',
  'DidNotFinish',
  'MissingPunch',
  'DidNotStart',
  'Disqualified',
  'OverTime',
  'NotCompeting'
]

export default defineEventHandler(
  async (event): Promise<RaceResultsResponse> => {
    const eventId = getRouterParam(event, 'eventId')
    if (!eventId || !/^\d+$/.test(eventId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'A numeric result_event_id is required'
      })
    }

    const url = `${OL_RESULTS_URL}?type=rang&result_event_id=${eventId}&kind=all&zwizt=1&xml=1`

    let xml: string
    try {
      const res = await fetch(url, { headers: { Accept: 'application/xml' } })
      if (!res.ok) {
        throw new Error(`Upstream responded ${res.status}`)
      }
      xml = await res.text()
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to fetch results from o-l.ch'
      })
    }

    let parsed: Record<string, any>
    try {
      parsed = parser.parse(xml)
    } catch {
      throw createError({
        statusCode: 502,
        statusMessage: 'Failed to parse results XML'
      })
    }

    const resultList = parsed?.ResultList
    if (!resultList) {
      throw createError({ statusCode: 404, statusMessage: 'No results found' })
    }

    // Cache at the edge for 5 minutes — results change rarely once published.
    setResponseHeader(event, 'Cache-Control', 'public, max-age=300')

    return transform(resultList)
  }
)

function transform(resultList: Record<string, any>): RaceResultsResponse {
  const event = resultList.Event ?? {}
  const classes: RaceResultClass[] = asArray(resultList.ClassResult).map(
    toClass
  )

  return {
    event: {
      name: str(event?.Name),
      date: str(event?.StartTime?.Date)
    },
    classes
  }
}

function toClass(classResult: Record<string, any>): RaceResultClass {
  const course = classResult.Course ?? {}
  const results = asArray(classResult.PersonResult).map(toEntry)

  // OK results (with a position) first, ordered by position; the rest after.
  results.sort((a, b) => {
    const pa = a.position ?? Number.POSITIVE_INFINITY
    const pb = b.position ?? Number.POSITIVE_INFINITY
    if (pa !== pb) return pa - pb
    return a.fullName.localeCompare(b.fullName)
  })

  return {
    name: str(classResult.Class?.Name) ?? '—',
    course: {
      length: num(course.Length),
      climb: num(course.Climb),
      controls: num(course.NumberOfControls)
    },
    results
  }
}

function toEntry(personResult: Record<string, any>): RaceResultEntry {
  const person = personResult.Person ?? {}
  const result = personResult.Result ?? {}

  const firstName = str(person.Name?.Given) ?? ''
  const lastName = str(person.Name?.Family) ?? ''
  const birthYear = parseBirthYear(person.BirthDate)

  const splits: RaceResultSplit[] = asArray(result.SplitTime).map((s) => ({
    control: num(s?.ControlCode),
    time: num(s?.Time)
  }))

  const identifier = `${firstName}${lastName}`
    .replace(/\s+/g, '')
    .toLowerCase()
    .concat(birthYear ? String(birthYear) : '')

  return {
    position: num(result.Position),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    club: str(personResult.Organisation?.Name),
    birthYear,
    iofId: parseIofId(person.Id),
    timeInSeconds: num(result.Time),
    status: parseStatus(result.Status),
    startTime: str(result.StartTime),
    finishTime: str(result.FinishTime),
    splits,
    identifier
  }
}

function parseStatus(raw: unknown): ResultStatus {
  const s = str(raw)
  if (s && (KNOWN_STATUSES as string[]).includes(s)) {
    return s as ResultStatus
  }
  return 'Unknown'
}

function parseBirthYear(raw: unknown): number | null {
  const s = str(raw)
  if (!s) return null
  const year = parseInt(s.slice(0, 4), 10)
  return Number.isFinite(year) ? year : null
}

function parseIofId(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null
  // `<Id type="IOF">7134</Id>` -> { '#text': 7134, '@_type': 'IOF' }
  if (typeof raw === 'object') {
    const text = (raw as Record<string, unknown>)['#text']
    return text === undefined || text === null ? null : String(text)
  }
  return String(raw)
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function num(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'object') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function str(value: unknown): string | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'object') {
    const text = (value as Record<string, unknown>)['#text']
    return text === undefined || text === null ? null : String(text).trim()
  }
  const s = String(value).trim()
  return s === '' ? null : s
}
