<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import FollowingDeparturesByRace from '~/components/races/FollowingDeparturesByRace.vue'
  import RaceResultSummary from '~/components/races/results/RaceResultSummary.vue'

  import type {
    Race,
    RaceCategory,
    RaceInstruction,
    UserDeparture
  } from '@/types/DirectusTypes'
  import { readItem } from '@directus/sdk'

  const route = useRoute()
  const { directus } = useApi()
  const raceCompose = useRace()
  const syncCenter = useSyncCenter()
  const { getFollowingUserDeparturesbyRace } = useFollowingUserDepartures()
  const { results: raceResults, fetchByRankingLink } = useRaceResults()
  const { teleportElement: backBtnTeleport } = useTeleport(
    'teleport-right-to-back-btn'
  )
  const isDesktop = useIsDesktop()

  const followingDepartures = ref<UserDeparture[] | false>([])
  const expandedInstructions = ref<boolean>(false)

  const raceId = computed<string>(() => route.params.raceId as string)

  // load race
  const { data: race } = await useAsyncData('race-id', () => {
    return directus.request<Race>(
      readItem('Race', raceId.value, {
        fields: [
          '*',
          {
            instruction: ['*']
          }
        ]
      })
    )
  })

  useSeoMeta({
    ogTitle: `${race.value?.name}${
      race.value?.date
        ? ` | ${formatDate(race.value?.date, 'dd, DD.MM.YY')}`
        : ''
    }`,
    ogDescription: `${
      race.value?.city || race.value?.mapName
    } | Alle Informationen zum Anlass findest du in der o-mate app.`
  })

  const resultsLoaded = ref(false)

  onMounted(async () => {
    await loadFollowing()
    if (isPastOrToday.value && race.value?.rankingLink) {
      await fetchByRankingLink(race.value.rankingLink)
      resultsLoaded.value = true
    }
  })

  async function loadFollowing() {
    followingDepartures.value = await getFollowingUserDeparturesbyRace(
      raceId.value
    )
  }

  // race day flags (only used client-side via teleport / fetched results)
  function isSameOrPastDay(dateStr: string | null | undefined): {
    pastOrToday: boolean
    today: boolean
  } {
    if (!dateStr) return { pastOrToday: false, today: false }
    const raceDay = new Date(dateStr)
    raceDay.setHours(0, 0, 0, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return {
      pastOrToday: raceDay.getTime() <= today.getTime(),
      today: raceDay.getTime() === today.getTime()
    }
  }

  const isPastOrToday = computed(
    () => isSameOrPastDay(race.value?.date).pastOrToday
  )
  const isToday = computed(() => isSameOrPastDay(race.value?.date).today)

  const hasResults = computed(
    () =>
      !!raceResults.value &&
      raceResults.value.classes.some((c) => c.results.length > 0)
  )

  // We expect a Rangliste (so we can reserve space + show a skeleton while loading)
  // whenever the race is finished/ongoing and has a ranking link.
  const expectResults = computed(
    () => isPastOrToday.value && !!race.value?.rankingLink
  )
  // Show the section unless we've loaded and there are genuinely no results.
  const showResultsSection = computed(
    () => expectResults.value && !(resultsLoaded.value && !hasResults.value)
  )

  // Quick-access button next to the back button for finished/ongoing races —
  // shared Rangliste / Live-Resultate logic (see useRace.getResultButton).
  const resultButton = computed(() =>
    isPastOrToday.value ? raceCompose.getResultButton(race.value) : null
  )

  const myDeparture = computed<UserDeparture | undefined>(() =>
    syncCenter.myDepartures.getDepartureFor(race.value?.id)
  )
  const raceCategory = computed<RaceCategory | undefined | null>(
    () => myDeparture.value?.raceCategory as RaceCategory | null | undefined
  )

  function getInstruction(race: Race) {
    return (race?.instruction as RaceInstruction[])?.[0]
  }
</script>

<template>
  <div v-if="race" class="row q-py-md">
    <!-- title and race details -->
    <div class="col-10">
      <!-- title and favorite -->
      <div class="col-12">
        <div class="col-10 text-h5" style="line-height: 1.4em">
          {{ race.name }}
        </div>
      </div>
      <!-- deadline -->
      <div
        v-if="race.deadline && new Date(race.deadline) >= new Date()"
        class="col-12 q-pt-md"
      >
        <q-banner class="bg-secondary text-white" dense rounded>
          <span class="fal fa-bells" />
          Anmelden bis am
          {{ formatDate(race.deadline, 'dd, DD.MMM YYYY') }}
        </q-banner>
      </div>

      <!-- date, location, map name -->
      <div class="col-12 q-pt-md q-pl-sm text-body1">
        <div class="row">
          <!-- your departure -->
          <div v-if="myDeparture" class="col-12 q-pt-xs">
            <q-icon class="q-mr-xs" name="change_history" />
            {{ raceCategory?.name ? `${raceCategory.name} | ` : '' }}
            {{
              raceCategory?.distanceInMeter
                ? `${raceCategory.distanceInMeter / 1000} km | `
                : ''
            }}
            {{
              raceCategory?.equidistanceInMeter
                ? `${raceCategory.equidistanceInMeter} m | `
                : ''
            }}
            {{
              raceCategory?.amountOfControls
                ? `${raceCategory.amountOfControls} p`
                : ''
            }}
          </div>

          <!-- date -->
          <div class="col-12 q-pt-xs">
            <q-icon class="q-mr-xs" name="event" />
            {{ formatDate(race.date!, 'dd, DD.MMM YYYY') }}
          </div>
          <!-- location -->
          <div class="col-12 q-pt-xs">
            <q-icon class="q-mr-xs" name="location_on" />
            {{ race.city || race.mapName || 'vakant' }}
            {{ race.region ? `(${race.region}` : ''
            }}<span class="text-capitalize">{{
              race.country
                ? `,
            ${race.country})`
                : ')'
            }}</span>
          </div>
          <!-- map name -->
          <div class="col-12 q-pt-xs">
            <q-icon class="q-mr-xs" name="map" />
            {{ race.mapName }}
          </div>
        </div>
      </div>
    </div>

    <!-- share and bookmark btns -->
    <div class="col-2 text-right">
      <div>
        <q-btn
          :outline="
            !syncCenter.myRaces?.find((myRace) => myRace.id === race?.id)
          "
          color="primary"
          dense
          round
          @click="raceCompose.addOrRemoveRace(race)"
        >
          <q-icon name="bookmark_outline" />
        </q-btn>
      </div>
      <div class="q-pt-md">
        <client-only>
          <races-share-race-btn />
        </client-only>
      </div>
    </div>

    <!-- rangliste (in-app results) — shown with a skeleton while loading so it
         doesn't pop in late and shift the layout -->
    <div v-if="showResultsSection" class="col-12">
      <q-separator class="q-my-lg" />

      <div class="text-h5">Rangliste</div>

      <div class="q-pt-md q-pl-sm">
        <race-result-summary
          v-if="resultsLoaded && hasResults && raceResults"
          :results="raceResults"
          :me-identifier="syncCenter.userIdentifier"
          :race-id="race.id"
        />
        <!-- loading placeholder (reserves height) -->
        <div v-else class="results-skeleton">
          <q-skeleton type="QInput" class="q-mb-md" />
          <q-skeleton height="120px" class="rounded-borders q-mb-md" />
          <q-skeleton
            v-for="n in 5"
            :key="n"
            type="text"
            height="32px"
            class="q-mb-sm"
          />
        </div>
      </div>
    </div>

    <!-- my departure -->
    <!-- todo > also show, if I am not participating thus having no own departure -->
    <div v-if="myDeparture" class="col-12">
      <q-separator class="q-my-lg" />

      <div class="text-h5">
        {{
          followingDepartures && followingDepartures.length
            ? 'Startzeiten'
            : 'Deine Startzeit'
        }}
      </div>

      <div class="q-mt-md q-pl-sm text-body1">
        {{ syncCenter.user?.first_name }}, du startest um
        <nuxt-link
          v-if="myDeparture"
          :to="`/races/${raceId}/departures/category/${(myDeparture.raceCategory as UserDeparture).id}`"
          class="q-mt-md"
          style="color: unset"
        >
          <b>
            <u>
              {{ syncCenter.myDepartures.getFormatedDeparture(race.id) }}
            </u>
          </b>
        </nuxt-link>
      </div>

      <!-- following departures-->
      <following-departures-by-race
        class="q-pt-sm q-pl-sm text-body1"
        :race-id="race.id"
        :following-departures="followingDepartures"
        @unfollow="loadFollowing()"
      />
    </div>

    <!-- instruction & departure time -->
    <div v-if="!!race.instruction.length" class="col-12">
      <q-separator class="q-my-lg" />

      <div class="text-h5">Weisungen</div>

      <div
        v-if="getInstruction(race)?.summaryAI"
        class="row text-body1 q-col-gutter-sm q-pl-sm q-pt-md"
      >
        <div
          :class="{ 'text-fadeout': !expandedInstructions }"
          class="col-12"
          @click="expandedInstructions = true"
        >
          <p style="white-space: pre-wrap">
            {{ getInstruction(race)?.summaryAI }}
          </p>

          <b v-if="getInstruction(race)?.summaryAI"
            >Die Weisungen wurden von einer KI zusammengefasst. Angaben ohne
            Gewähr.</b
          >
        </div>
        <div
          class="col-12 text-center q-pt-none"
          @click="expandedInstructions = !expandedInstructions"
        >
          <q-btn flat round
            ><q-icon
              :name="
                expandedInstructions
                  ? 'keyboard_arrow_up'
                  : 'keyboard_arrow_down'
              "
              size="xl"
            />
          </q-btn>
        </div>
      </div>
      <!-- Instruction PDF -->
      <div
        v-if="raceCompose.composeLink({ race, linkType: 'instruction' })"
        class="row q-mt-md"
      >
        <div class="col-12 text-center">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'instruction' })"
            color="black"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="signpost" />
            Original-Weisungen lesen
          </q-btn>
        </div>
      </div>
    </div>

    <!-- map -->
    <div v-if="race.coordinates" class="col-12">
      <q-separator class="q-my-lg" />

      <div class="text-h5">Anreise</div>

      <div class="q-pt-md">
        <client-only>
          <races-race-location-map
            :coordinates="race.coordinates"
            :race="race"
          />
          <!-- reserve the map + buttons height so the layout doesn't jump -->
          <template #fallback>
            <q-skeleton
              class="rounded-borders"
              height="300px"
              style="margin: 0 -8px"
            />
            <div class="row q-pt-lg justify-center q-gutter-sm">
              <q-skeleton type="QBtn" width="130px" />
              <q-skeleton type="QBtn" width="120px" />
              <q-skeleton type="QBtn" width="80px" />
            </div>
          </template>
        </client-only>
      </div>
    </div>

    <!-- links -->
    <div class="col-12">
      <q-separator class="q-my-lg" />

      <div class="text-h5">Links</div>

      <div class="row q-col-gutter-sm q-pl-sm q-pt-md">
        <!-- Ausschreibung -->
        <div class="col-auto">
          <q-btn
            v-if="race.publicationLink"
            :href="raceCompose.composeLink({ race, linkType: 'publication' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="picture_as_pdf" />
            Ausschreibung
          </q-btn>
        </div>

        <!-- website -->
        <div v-if="race.eventLink" class="col-auto">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'event' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="open_in_new" />
            Webseite
          </q-btn>
        </div>

        <!-- inscription link -->
        <div v-if="race.inscriptionLink" class="col-auto">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'inscription' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="play_circle" />
            Anmelden
          </q-btn>
        </div>

        <!-- live results -->
        <div v-if="race.liveResultLink" class="col-auto">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'liveResult' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="live_tv" />
            Live-Resultate
          </q-btn>
        </div>

        <!-- ranking (external source) -->
        <div v-if="race.rankingLink" class="col-auto">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'ranking' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="list" />
            Rangliste auf o-l.ch
          </q-btn>
        </div>
      </div>
    </div>

    <calendar-subscription-dialog />

    <!-- quick-access result button, next to the "Zurück" button (mobile only) -->
    <Teleport
      v-if="backBtnTeleport && resultButton && !isDesktop"
      :to="backBtnTeleport"
    >
      <q-btn
        size="md"
        rounded
        :outline="false"
        color="primary"
        :icon="resultButton.icon"
        :label="resultButton.label"
        :to="resultButton.to"
        :href="resultButton.href"
        :target="resultButton.href ? '_blank' : undefined"
        :class="{ 'result-btn-blink': isToday }"
        no-caps
      />
    </Teleport>
  </div>
</template>

<style lang="scss">
  .text-fadeout {
    max-height: 100px;
    white-space: nowrap;
    overflow: hidden;
    position: relative;
    mask-image: linear-gradient(to bottom, black 10%, transparent 100%);
  }

  @keyframes resultBtnBlink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.45;
    }
  }

  .result-btn-blink {
    animation: resultBtnBlink 1.6s ease-in-out infinite;
  }
</style>
