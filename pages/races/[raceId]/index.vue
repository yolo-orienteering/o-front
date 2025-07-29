<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import SbbTimetable from '@/components/publicTransport/switzerland/SbbTimetable.vue'
  import FollowingDeparturesByRace from '~/components/races/FollowingDeparturesByRace.vue'

  import type {
    Race,
    RaceCategory,
    RaceInstruction,
    UserDeparture,
  } from '@/types/DirectusTypes'
  import { readItem } from '@directus/sdk'

  const route = useRoute()
  const { directus } = useApi()
  const raceCompose = useRace()
  const syncCenter = useSyncCenter()
  const { getFollowingUserDeparturesbyRace } = useFollowingUserDepartures()

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
            instruction: ['*'],
          },
        ],
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
    } | Alle Informationen zum Anlass findest du in der o-mate app.`,
  })

  onMounted(async () => {
    await loadFollowing()
  })

  async function loadFollowing() {
    followingDepartures.value = await getFollowingUserDeparturesbyRace(
      raceId.value
    )
  }

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
  <div v-if="race" class="row q-pt-md">
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

        <!-- ranking -->
        <div v-if="race.rankingLink" class="col-auto">
          <q-btn
            :href="raceCompose.composeLink({ race, linkType: 'ranking' })"
            target="_blank"
          >
            <q-icon class="q-mr-sm" name="list" />
            Rangliste
          </q-btn>
        </div>
      </div>
    </div>

    <!-- sbb -->
    <div class="col-12">
      <q-separator class="q-my-lg" />

      <sbb-timetable :race="race" />
    </div>
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
</style>
