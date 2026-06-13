<template>
  <div>
    <!-- prompt to complete the profile (when there is none, or while editing so
         it doesn't vanish mid-typing); reuses the shared UserForm -->
    <div
      v-if="(!hasProfile || formTouched) && !promptDismissed"
      class="profile-prompt q-mb-md"
      @focusin="formTouched = true"
      @input="formTouched = true"
    >
      <div class="row items-center justify-between no-wrap q-mb-xs">
        <div class="text-subtitle2">Finde dein Resultat</div>
        <q-btn
          dense
          flat
          round
          size="sm"
          icon="close"
          aria-label="Ausblenden"
          @click="dismissPrompt"
        />
      </div>
      <div class="text-body2 text-grey-7 q-mb-sm">
        Gib deinen Namen und Jahrgang ein, um dich in der Rangliste
        hervorzuheben.
      </div>
      <user-form />
    </div>

    <!-- swipeable categories (preselects the user's category, shows them as a
         4th entry there if they're not already on the podium) -->
    <race-category-carousel
      :results="results"
      :me-identifier="meIdentifier"
      :race-id="raceId"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue'
  import { useQuasar } from 'quasar'
  import type { RaceResultsResponse } from '@/types/RaceResults'
  import RaceCategoryCarousel from './RaceCategoryCarousel.vue'
  import UserForm from '@/components/user/UserForm.vue'

  const props = defineProps<{
    results: RaceResultsResponse
    meIdentifier: string | false
    raceId: string
  }>()

  const localStorage = useQuasar().localStorage
  const PROMPT_DISMISSED_KEY = 'results-profile-prompt-dismissed'

  const promptDismissed = ref<boolean>(false)
  // True once the user starts editing the profile form — keeps the form visible
  // so it doesn't disappear mid-typing when the identifier briefly becomes valid.
  const formTouched = ref<boolean>(false)

  const hasProfile = computed(() => props.meIdentifier !== false)

  function dismissPrompt(): void {
    promptDismissed.value = true
    localStorage.set(PROMPT_DISMISSED_KEY, true)
  }

  onMounted(() => {
    promptDismissed.value = !!localStorage.getItem(PROMPT_DISMISSED_KEY)
  })
</script>

<style lang="scss" scoped>
  .profile-prompt {
    background: rgba(38, 70, 83, 0.05);
    border-radius: 10px;
    padding: 12px;
  }
</style>
