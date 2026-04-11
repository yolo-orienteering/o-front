<script setup lang="ts">
  import { ref } from 'vue'
  import { Notify } from 'quasar'
  import VueTurnstile from 'vue-turnstile'

  const config = useRuntimeConfig()
  const siteKey = config.public.turnstileSiteKey as string

  const { hasSubscription, subscriptionUrl, createSubscription } =
    useCalendarSubscription()

  const loading = ref(false)
  const showUrl = ref(false)
  const turnstileToken = ref<string>('')
  const turnstileError = ref<any | undefined>(undefined)

  async function handleConnect() {
    if (hasSubscription.value && subscriptionUrl.value) {
      window.location.href = subscriptionUrl.value
      return
    }

    if (!turnstileToken.value) return

    loading.value = true
    try {
      await createSubscription(turnstileToken.value)
      if (subscriptionUrl.value) {
        window.location.href = subscriptionUrl.value
      }
    } catch {
      Notify.create({
        message: 'Kalender konnte nicht erstellt werden.',
        type: 'negative'
      })
    } finally {
      loading.value = false
    }
  }

  async function copyUrl() {
    if (!subscriptionUrl.value) return
    try {
      await navigator.clipboard.writeText(subscriptionUrl.value)
      Notify.create({
        message: 'Kalender-Link kopiert!',
        type: 'positive'
      })
    } catch {
      Notify.create({
        message: 'Kopieren fehlgeschlagen',
        type: 'negative'
      })
    }
  }

  const buttonDisabled = computed(() => {
    if (hasSubscription.value) return false
    return !turnstileToken.value || !!turnstileError.value
  })
</script>

<template>
  <div>
    <p>
      Verknüpfe deine gemerkten Läufe mit deiner Kalender-App. Änderungen werden
      automatisch synchronisiert.
    </p>

    <vue-turnstile
      v-if="!hasSubscription"
      :site-key="siteKey"
      v-model="turnstileToken"
      render-on-mount
      @error="(error) => (turnstileError = error)"
    />

    <div
      v-if="!hasSubscription && !turnstileToken && !turnstileError"
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
        icon="event"
        label="Kalender verknüpfen"
        :loading="loading || buttonDisabled"
        unelevated
        :outline="false"
        @click="handleConnect()"
      />
    </div>

    <div class="q-mt-md" v-if="hasSubscription">
      <a
        class="text-primary text-caption cursor-pointer"
        @click.prevent="showUrl = !showUrl"
      >
        {{
          showUrl
            ? 'Link ausblenden'
            : 'Kalender-App hat sich nicht geöffnet? Oder webcal-Link manuell kopieren?'
        }}
      </a>
    </div>

    <q-slide-transition>
      <div v-if="showUrl && hasSubscription">
        <q-input
          :model-value="subscriptionUrl"
          readonly
          outlined
          dense
          class="q-mt-sm"
        >
          <template #append>
            <q-btn flat round icon="content_copy" @click="copyUrl()" />
          </template>
        </q-input>
      </div>
    </q-slide-transition>
  </div>
</template>
