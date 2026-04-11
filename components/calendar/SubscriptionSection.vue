<script setup lang="ts">
  import { ref } from 'vue'
  import { Notify } from 'quasar'

  const { hasSubscription, subscriptionUrl, createSubscription } =
    useCalendarSubscription()

  const loading = ref(false)
  const turnstileToken = ref<string | null>(null)
  const showUrl = ref(false)
  const turnstileRef = ref<{
    token: string | null
    loading: boolean
    error: boolean
  } | null>(null)

  function onTurnstileVerify(token: string) {
    turnstileToken.value = token
  }

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
    return !turnstileToken.value || !!turnstileRef.value?.error
  })
</script>

<template>
  <div>
    <p>
      Verknüpfe deine gemerkten Läufe mit deiner Kalender-App. Änderungen werden
      automatisch synchronisiert.
    </p>

    <cloudflare-turnstile
      v-if="!hasSubscription"
      ref="turnstileRef"
      class="q-mt-md"
      @verify="onTurnstileVerify"
    />

    <div class="q-mt-md">
      <q-btn
        color="primary"
        icon="event"
        label="Kalender verknüpfen"
        :loading="loading"
        :disable="buttonDisabled"
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
