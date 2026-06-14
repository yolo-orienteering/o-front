<template>
  <div class="row q-py-md">
    <div class="col-12">
      <!-- resolving: fetching + deciding whether to redirect -->
      <div v-if="resolving" class="text-center q-py-xl text-grey-7">
        <q-spinner-dots size="32px" color="primary" />
        <div class="q-mt-sm">Rangliste wird geladen …</div>
      </div>

      <!-- no results at all -->
      <div
        v-else-if="failed || !hasResults"
        class="text-center q-py-xl text-grey-7"
      >
        <q-icon name="emoji_events" size="32px" class="q-mb-sm" />
        <div>Noch keine Rangliste verfügbar.</div>
        <q-btn
          class="q-mt-md"
          no-caps
          icon="chevron_left"
          label="Zurück zum Lauf"
          :to="`/races/${raceId}`"
        />
      </div>

      <!-- user not found → let them pick a category from the slider -->
      <template v-else-if="results">
        <div class="text-h5">{{ race?.name }}</div>
        <race-category-carousel
          class="q-pt-lg"
          :results="results"
          :me-identifier="syncCenter.userIdentifier"
          :race-id="raceId"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { readItem } from '@directus/sdk'
  import { computed, onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useApi } from '@/stores/useApi'
  import { useSyncCenter } from '@/stores/syncCenter'
  import { useRaceResults } from '@/composables/useRaceResults'
  import RaceCategoryCarousel from '@/components/races/results/RaceCategoryCarousel.vue'
  import type { Race } from '@/types/DirectusTypes'

  /**
   * Category-less entry point for the Rangliste (the "Rangliste" quick button):
   * if we can identify the user's own result, jump straight to their category;
   * otherwise show the category slider so they can pick one themselves.
   */
  const { params } = useRoute()
  const router = useRouter()
  const { directus } = useApi()
  const syncCenter = useSyncCenter()
  const { results, failed, fetchByRankingLink, findByIdentifier } =
    useRaceResults()

  const raceId = computed(() => params.raceId as string)
  const race = ref<Race | undefined>(undefined)
  const resolving = ref(true)

  const hasResults = computed(
    () =>
      !!results.value && results.value.classes.some((c) => c.results.length > 0)
  )

  onMounted(async () => {
    race.value = await directus
      .request<Race>(
        readItem('Race', raceId.value, {
          fields: ['id', 'name', 'rankingLink']
        })
      )
      .catch(() => undefined)

    await fetchByRankingLink(race.value?.rankingLink)

    // user's own result found → go directly to their category
    const own = findByIdentifier(syncCenter.userIdentifier)
    if (own) {
      router.replace(
        `/races/${raceId.value}/results/category/${encodeURIComponent(own.raceClass.name)}`
      )
      return // keep the spinner until navigation completes
    }

    resolving.value = false
  })
</script>
