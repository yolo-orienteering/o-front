<template>
  <div class="row">
    <div class="col-12 q-pt-md">
      <div class="text-h5">{{ race?.name }}</div>

      <div class="row items-center q-pt-sm">
        <div class="col-7 text-h6">Rangliste {{ selectedClassName }}</div>
        <div class="col-5 text-right text-grey-7">
          {{ rankedCount }} klassiert
        </div>
      </div>

      <div v-if="courseLine" class="text-caption text-grey-7 q-pb-sm">
        {{ courseLine }}
      </div>
    </div>

    <!-- states -->
    <div v-if="loading" class="col-12 q-pt-md">
      <q-skeleton v-for="n in 8" :key="n" class="q-mb-sm" height="44px" />
    </div>

    <div v-else-if="failed" class="col-12 q-pt-lg text-center text-grey-7">
      <q-icon name="cloud_off" size="32px" class="q-mb-sm" />
      <div>Rangliste konnte nicht geladen werden.</div>
      <q-btn
        v-if="race?.rankingLink"
        class="q-mt-md"
        no-caps
        :href="race.rankingLink"
        target="_blank"
        icon="open_in_new"
        label="Auf o-l.ch ansehen"
      />
    </div>

    <div
      v-else-if="!raceClass || !raceClass.results.length"
      class="col-12 q-pt-lg text-center text-grey-7"
    >
      Keine Resultate für diese Kategorie.
    </div>

    <div v-else class="col-12 q-pt-sm">
      <race-result-list
        :race-class="raceClass"
        :analysis="analysis"
        :me-identifier="meIdentifier"
        :followed-identifiers="followedIdentifiers"
      />
    </div>

    <!-- category filter teleported next to the back button -->
    <Teleport
      v-if="teleportElement && categoryOptions.length"
      :to="teleportElement"
    >
      <q-select
        :model-value="selectedClassName"
        :options="categoryOptions"
        dense
        outlined
        rounded
        emit-value
        map-options
        @update:model-value="updateCategoryFilter"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
  import { readItem } from '@directus/sdk'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useApi } from '@/stores/useApi'
  import { useSyncCenter } from '@/stores/syncCenter'
  import { useRaceResults } from '@/composables/useRaceResults'
  import { useSplitAnalysis } from '@/composables/useSplitAnalysis'
  import { useFollowingUserDepartures } from '@/composables/useFollowingUserDepartures'
  import { useTeleport } from '@/composables/useTeleport'
  import RaceResultList from '@/components/races/results/RaceResultList.vue'
  import type {
    CustomDirectusUser,
    Race,
    UserDeparture
  } from '@/types/DirectusTypes'

  const { params } = useRoute()
  const router = useRouter()
  const { directus } = useApi()
  const syncCenter = useSyncCenter()
  const { results, loading, failed, fetchByRankingLink, getClass } =
    useRaceResults()
  const { analyse } = useSplitAnalysis()
  const { getFollowingUserDeparturesbyRace } = useFollowingUserDepartures()
  const { teleportElement } = useTeleport('teleport-right-to-back-btn')

  const race = ref<Race | undefined>(undefined)
  const followedIdentifiers = ref<string[]>([])

  const selectedClassName = computed(() =>
    decodeURIComponent(String(params.categoryName ?? ''))
  )
  const meIdentifier = computed(() => syncCenter.userIdentifier)

  const raceClass = computed(() => getClass(selectedClassName.value))
  const analysis = computed(() => analyse(raceClass.value))

  const rankedCount = computed(
    () => raceClass.value?.results.filter((r) => r.status === 'OK').length ?? 0
  )

  const categoryOptions = computed(() =>
    (results.value?.classes ?? []).map((c) => ({
      label: c.name,
      value: c.name
    }))
  )

  const courseLine = computed(() => {
    const course = raceClass.value?.course
    if (!course) return ''
    const parts: string[] = []
    if (course.length) parts.push(`${(course.length / 1000).toFixed(1)} km`)
    if (course.climb) parts.push(`${course.climb} Hm`)
    if (course.controls) parts.push(`${course.controls} Posten`)
    return parts.join(' · ')
  })

  onMounted(async () => {
    const raceId = params.raceId as string
    if (!raceId) return

    race.value = await directus.request<Race>(
      readItem('Race', raceId, {
        fields: ['id', 'name', 'rankingLink', 'date']
      })
    )

    await Promise.all([
      fetchByRankingLink(race.value?.rankingLink),
      loadFollowedIdentifiers(raceId)
    ])
  })

  async function loadFollowedIdentifiers(raceId: string): Promise<void> {
    const followed = await getFollowingUserDeparturesbyRace(raceId)
    if (!followed) return
    followedIdentifiers.value = followed
      .map((departure: UserDeparture) => {
        const user = departure.user as CustomDirectusUser | undefined
        if (!user?.first_name || !user.last_name || !user.birthYear) return null
        return `${user.first_name}${user.last_name}${user.birthYear}`
          .replace(/\s+/g, '')
          .toLowerCase()
      })
      .filter((id): id is string => id !== null)
  }

  function updateCategoryFilter(className: string): void {
    router.replace(
      `/races/${params.raceId}/results/category/${encodeURIComponent(className)}`
    )
  }
</script>
