<script setup lang="ts">
  import { ref } from 'vue'
  import { Notify } from 'quasar'

  const { hasSubscription, subscriptionUrl, createSubscription } =
    useCalendarSubscription()

  const loading = ref(false)
  const turnstileToken = ref<string | null>(null)
  const turnstileRef = ref<{
    token: string | null
    loading: boolean
    error: boolean
  } | null>(null)

  function onTurnstileVerify(token: string) {
    turnstileToken.value = token
  }

  async function handleCreate() {
    if (!turnstileToken.value) return

    loading.value = true
    try {
      await createSubscription(turnstileToken.value)
      Notify.create({
        message: 'Kalender-Abo erstellt!',
        type: 'positive'
      })
    } catch {
      Notify.create({
        message: 'Fehler beim Erstellen des Kalender-Abos',
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
        message: 'Kalender-Link in Zwischenablage kopiert!',
        type: 'positive'
      })
    } catch {
      Notify.create({
        message: 'Kopieren fehlgeschlagen',
        type: 'negative'
      })
    }
  }
</script>

<template>
  <!-- Already has subscription — show URL -->
  <div v-if="hasSubscription">
    <p>
      Dein Kalender-Abo ist aktiv. Kopiere den Link und fuege ihn in deiner
      Kalender-App als Abo hinzu. Aenderungen an deinen gemerkten Laeufen werden
      automatisch synchronisiert.
    </p>

    <q-input
      :model-value="subscriptionUrl"
      readonly
      outlined
      dense
      class="q-mt-md"
    >
      <template #append>
        <q-btn flat round icon="content_copy" @click="copyUrl()" />
      </template>
    </q-input>
  </div>

  <!-- No subscription — Turnstile + Create -->
  <div v-else>
    <p>
      Erstelle ein Kalender-Abo fuer deine gemerkten Laeufe. Den Link kannst du
      dann in deiner Kalender-App abonnieren.
    </p>

    <cloudflare-turnstile
      ref="turnstileRef"
      class="q-mt-md"
      @verify="onTurnstileVerify"
    />

    <div class="q-mt-md text-right">
      <q-btn
        color="primary"
        label="Abo erstellen"
        :loading="loading"
        :disable="
          !turnstileToken || turnstileRef?.loading || turnstileRef?.error
        "
        unelevated
        @click="handleCreate()"
      />
    </div>
  </div>
</template>
