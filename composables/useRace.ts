import { useSyncCenter } from '@/stores/syncCenter'
import type { Race, RaceInstruction } from '@/types/DirectusTypes'

type RaceLinkType =
  | 'event'
  | 'publication'
  | 'ranking'
  | 'inscription'
  | 'liveResult'
  | 'instruction'

export interface RaceResultButton {
  icon: string
  label: string
  /** in-app route (Rangliste) */
  to?: string
  /** external URL (Live-Resultate) */
  href?: string
}

export function useRace() {
  const syncCenter = useSyncCenter()

  /**
   * The result shortcut for a race: in-app **Rangliste** when a ranking link
   * exists, else external **Live-Resultate**. Callers decide *when* to show it
   * (e.g. race day on the overview, today-or-past on the detail page).
   */
  function getResultButton(
    race: Race | null | undefined
  ): RaceResultButton | null {
    if (!race) return null
    if (race.rankingLink) {
      return {
        icon: 'leaderboard',
        label: 'Rangliste',
        to: `/races/${race.id}/results`
      }
    }
    if (race.liveResultLink) {
      return {
        icon: 'live_tv',
        label: 'Live-Resultate',
        href: race.liveResultLink
      }
    }
    return null
  }

  function composeLink({
    race,
    linkType
  }: {
    race: Race
    linkType: RaceLinkType
  }): string | undefined {
    let linkToOpen: string | undefined | null = undefined
    const raceInstruction = (race.instruction as RaceInstruction[])?.[0]
    switch (linkType) {
      case 'event':
        linkToOpen = race.eventLink
        break
      case 'inscription':
        linkToOpen = race.inscriptionLink
        break
      case 'publication':
        linkToOpen = race.publicationLink
        break
      case 'ranking':
        linkToOpen = race.rankingLink
        break
      case 'liveResult':
        linkToOpen = race.liveResultLink
        break
      case 'instruction':
        linkToOpen =
          raceInstruction?.linkOverwritten || raceInstruction?.linkCrawled
        break
      default:
        break
    }

    return linkToOpen || undefined
  }

  function addOrRemoveRace(race: Race) {
    if (!syncCenter.myRaces) {
      return
    }
    const index = syncCenter.myRaces.findIndex((r) => r.id === race.id)
    if (index === -1) {
      syncCenter.myRaces.push(race)
    } else {
      syncCenter.myRaces.splice(index, 1)
    }
    syncCenter.incrementBookmarkCount()
  }

  return {
    composeLink,
    addOrRemoveRace,
    getResultButton
  }
}
