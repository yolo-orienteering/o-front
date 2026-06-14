/**
 * Shape of the JSON returned by the `/api/race-results/[eventId]` Nitro route.
 * The route fetches the IOF Data Standard 3.0 XML from o-l.ch and transforms it
 * into this app-friendly structure (see server/api/race-results/[eventId].get.ts).
 */

export type ResultStatus =
  | 'OK'
  | 'DidNotFinish'
  | 'MissingPunch'
  | 'DidNotStart'
  | 'Disqualified'
  | 'OverTime'
  | 'NotCompeting'
  | 'Unknown'

export interface RaceResultSplit {
  /** Physical control code (e.g. 31). Same sequence for everyone in a class. */
  control: number | null
  /** Cumulative time from start to this control, in seconds. */
  time: number | null
}

export interface RaceResultEntry {
  position: number | null
  firstName: string
  lastName: string
  fullName: string
  club: string | null
  birthYear: number | null
  iofId: string | null
  timeInSeconds: number | null
  status: ResultStatus
  startTime: string | null
  finishTime: string | null
  splits: RaceResultSplit[]
  /**
   * Lowercased, whitespace-stripped `${firstName}${lastName}${birthYear}`.
   * Matches the `composedIdentifierSolv` scheme used for start lists, so the app
   * can recognise the current user (syncCenter.userIdentifier) and followed runners.
   */
  identifier: string
}

export interface RaceResultCourse {
  /** Course length in meters. */
  length: number | null
  /** Climb in meters. */
  climb: number | null
  /** Number of controls. */
  controls: number | null
}

export interface RaceResultClass {
  name: string
  course: RaceResultCourse
  results: RaceResultEntry[]
}

export interface RaceResultsResponse {
  event: {
    name: string | null
    date: string | null
  }
  classes: RaceResultClass[]
}
