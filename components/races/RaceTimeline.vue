<script lang="ts" setup>
  import moment from 'moment'
  import type { Race } from '@/types/DirectusTypes'
  import { formatDate } from '@/utils/DateUtils'
  import { useRace } from '@/composables/useRace'
  import { useRaceTerrain } from '@/composables/useRaceTerrain'
  import Mailchimp from '@/components/newsletter/mailchimp.vue'
  import { useNewsletter } from '@/composables/useNewsletter'

  const filter = useRaceFilter()
  const syncCenter = useSyncCenter()
  const raceCompose = useRace()
  const { getTerrainIcon } = useRaceTerrain()
  const { isSubscribed, rememberSubscription } = useNewsletter()

  const props = withDefaults(
    defineProps<{
      races?: Race[] | null
      hideLoadMore?: boolean
      loading: boolean
    }>(),
    {
      races: () => [],
      hideLoadMore: false,
    }
  )

  const emit = defineEmits<{
    (e: 'loadMore' | 'update:filter'): void
  }>()

  function loadMore() {
    emit('loadMore')
  }

  function resetFilter (): void {
    filter.resetFilter()
    emit('update:filter')
  }

  function shouldAddUser(race: Race): boolean {
    return !syncCenter.userIdentifier && !!race.departureLink
  }

  function getMonthlyDelimiter(date: string): string {
    const momentDate = moment(date)
    return momentDate.year() > moment().year()
      ? momentDate.locale('de-CH').format('MMMM YY')
      : momentDate.locale('de-CH').format('MMMM')
  }

  function monthChangeInArray(
    raceId: string,
    firstMonth: boolean = true
  ): boolean {
    if (!props.races) {
      return false
    }
    const foundIndex = props.races.findIndex((tmpRace) => tmpRace.id === raceId)
    // race doesn't exist
    if (foundIndex < 0 || !props.races) {
      return false
    }
    // beginning is always a month change
    if (foundIndex === 0) {
      return firstMonth
    }

    const sortByDeadline = filter.filter.deadline

    const previousRace = props.races[foundIndex - 1]
    const currentRace = props.races[foundIndex]

    const previousRaceDate = sortByDeadline
      ? previousRace?.deadline
      : previousRace?.date
    const currentRaceDate = sortByDeadline
      ? currentRace?.deadline
      : currentRace?.date

    const monthOfPreviousRace = previousRaceDate
      ? new Date(previousRaceDate).getMonth()
      : undefined
    const currentMonth = currentRaceDate
      ? new Date(currentRaceDate).getMonth()
      : undefined
    return monthOfPreviousRace !== currentMonth
  }
</script>

<template>
  <!-- loading animation -->
  <div v-if="props.loading" class="row">
    <div v-for="i in [...Array(10).keys()]" :key="i" class="col-12 q-pb-md">
      <q-item>
        <q-item-section avatar>
          <q-skeleton type="QAvatar" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton type="text" width="65%" />
          </q-item-label>
        </q-item-section>
      </q-item>
    </div>
  </div>

  <!-- races list -->
  <div v-else class="row justify-center">
    <div class="col-12">
      <q-timeline layout="dense">
        <template v-for="(race, raceIndex) in races" :key="race.id">
          <!-- monthly delimiter -->
          <q-timeline-entry v-if="monthChangeInArray(race.id)" heading>
            <div class="row">
              <!-- month name -->
              <div class="col-8">
                {{
                  getMonthlyDelimiter(
                    filter.filter.deadline ? race.deadline! : race.date!
                  )
                }}
              </div>
            </div>
          </q-timeline-entry>

          <!-- no bookmarked races -->
          <div v-if="raceIndex === 0 && filter.filter.myRaces && !syncCenter.myRaces?.length" class="col-12 q-pb-lg">
            <q-banner dark>
              Du hast noch keine Läufe vorgemerkt. Klicke auf die <q-icon name="bookmark"/>-Symbole, um Dir Deine Liste
              zusammenzustellen.
              <template #avatar>
                <q-icon name="bookmark" size="md" class="q-pr-sm" />
              </template>
            </q-banner>
          </div>

          <!-- newsletter -->
          <q-timeline-entry
            v-if="raceIndex === 4 && !isSubscribed()"
            class="bg-dark text-white q-pr-sm newsletter-container"
            color="white"
          >
            <template #subtitle>
              <div class="text-right q-pt-sm">
                <q-btn
                  icon="close"
                  size="x-small"
                  round
                  color="white"
                  text-color="white"
                  @click="rememberSubscription()"
                />
              </div>
            </template>
            <mailchimp style="margin-top: -16px" />
          </q-timeline-entry>

          <!-- races -->
          <q-timeline-entry
            :title="race.name!"
            class="cursor-pointer"
            @click="$router.push(`/races/${race.id}`)"
          >
            <!-- date & deadline -->
            <template #subtitle>
              <div class="row items-center">
                <div class="col-6">
                  {{ formatDate(race.date!, 'dd, DD.MM yyyy') }}
                </div>
                <!-- deadline -->
                <div v-if="race.deadline" class="col-6 text-right">
                  <q-btn
                    v-if="shouldAddUser(race)"
                    color="secondary"
                    href="/settings"
                    rounded
                    size="sm"
                    unelevated
                  >
                    Deine Startzeit
                  </q-btn>

                  <q-chip
                    v-else-if="syncCenter.myDepartures.getDepartureFor(race.id)"
                    color="secondary"
                    rounded
                    size="md"
                    unelevated
                  >
                    {{ syncCenter.myDepartures.getFormatedDeparture(race.id) }}
                  </q-chip>

                  <q-chip
                    v-else
                    :class="[{ 'text-strike': new Date() > new Date(race.deadline!) }]"
                    :outline="!filter.filter.deadline"
                    color="secondary"
                    dense
                  >
                    {{ formatDate(race.deadline!, 'dd, DD.MMM') }}
                  </q-chip>
                </div>
              </div>
            </template>
            <!-- title & favorites -->
            <template #title>
              <div class="row items-center">
                <div class="col-10">
                  {{ race.name }}
                </div>
                <div class="col-2 text-right">
                  <q-btn
                    :outline="
                      !syncCenter.myRaces?.find(
                        (myRace) => myRace.id === race.id
                      )
                    "
                    color="primary"
                    dense
                    round
                    @click.stop="raceCompose.addOrRemoveRace(race)"
                  >
                    <q-icon name="bookmark_outline" />
                  </q-btn>
                </div>
              </div>
            </template>
            <!-- text body -->
            <div class="row justify-between items-center">
              <div class="col-auto">
                <span v-if="!!race?.terrain" class="q-mr-xs">
                  <q-icon
                    :name="getTerrainIcon(race.terrain as RaceTerrain)"
                    size="xs"
                    style="margin-top: -4px"
                  />
                </span>
                {{ race.city || race.mapName || 'vakant' }}
                {{ race.region ? `(${race.region})` : '' }}
              </div>
            </div>
          </q-timeline-entry>
        </template>
      </q-timeline>
    </div>

    <!-- no results -->
    <div v-if="!races?.length" class="col-12">
      <q-banner dark>
        Keine Läufe gefunden. Das liegt womöglich an Deiner Filterung.
        <template #avatar>
          <q-icon name="battery_0_bar" size="md" class="q-pr-sm" />
        </template>
        <template #action>
          <q-btn icon="replay" @click="resetFilter()">Filter zurücksetzen</q-btn>
        </template>
      </q-banner>
    </div>

    <!-- pagination -->
    <div v-else-if="!hideLoadMore && !!races?.length" class="col-12 text-center q-pb-lg">
      <q-btn @click="loadMore()"> Mehr Läufe laden </q-btn>
    </div>
  </div>
</template>

<style lang="scss">
  .newsletter-container {
    margin-left: -8px;
    margin-right: -8px;
    margin-bottom: 8px;
    margin-top: 8px;
  }

  .newsletter-container > .q-timeline__dot {
    left: 8px;
    margin-top: 8px;
    margin-bottom: 16px;
  }
</style>
