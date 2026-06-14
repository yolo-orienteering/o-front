<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Notify } from 'quasar'
  import VueTurnstile from 'vue-turnstile'

  /**
   * Turnstile-gated "create a calendar subscription" control. Renders the bot check plus a
   * single button; on success it stores the new subscription id (via the composable) and
   * emits `created`. The parent decides what happens next — open `webcal://` (iOS/macOS/
   * Linux) or reveal the step-by-step how-to (everywhere else). Shared by
   * SubscriptionSection and the calendar-setup page.
   */
  const props = withDefaults(
    defineProps<{
      label?: string
      icon?: string
    }>(),
    {
      label: 'Kalender erstellen',
      icon: 'event'
    }
  )

  const emit = defineEmits<{ created: [] }>()

  const config = useRuntimeConfig()
  const siteKey = config.public.turnstileSiteKey as string

  const { createSubscription } = useCalendarSubscription()

  const loading = ref(false)
  const turnstileToken = ref<string>('')
  const turnstileError = ref<any | undefined>(undefined)

  const buttonDisabled = computed(
    () => !turnstileToken.value || !!turnstileError.value
  )

  async function handleCreate() {
    if (!turnstileToken.value) return
    loading.value = true
    try {
      await createSubscription(turnstileToken.value)
      emit('created')
    } catch (e) {
      Notify.create({
        message: 'Kalender konnte nicht erstellt werden.' + e,
        type: 'negative'
      })
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <div>
    <vue-turnstile
      :site-key="siteKey"
      v-model="turnstileToken"
      render-on-mount
      @error="(error) => (turnstileError = error)"
    />

    <div
      v-if="!turnstileToken && !turnstileError"
      class="q-mt-sm text-caption text-grey"
    >
      Sicherheitsüberprüfung wird geladen…
    </div>

    <div v-if="turnstileError" class="q-mt-sm text-negative text-caption">
      Sicherheitsüberprüfung fehlgeschlagen. Bitte lade die Seite neu und
      versuche es nochmals.
    </div>

    <div class="q-mt-md">
      <q-btn
        color="primary"
        :icon="props.icon"
        :label="props.label"
        :loading="loading || buttonDisabled"
        unelevated
        :outline="false"
        @click="handleCreate()"
      />
    </div>
  </div>
</template>
