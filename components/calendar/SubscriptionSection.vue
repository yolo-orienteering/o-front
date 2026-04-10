<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
  import { Notify } from 'quasar'

  const { hasSubscription, subscriptionUrl, createSubscription } =
    useCalendarSubscription()
  const config = useRuntimeConfig()

  const loading = ref(false)
  const turnstileToken = ref<string | null>(null)
  const turnstileWidgetId = ref<string | null>(null)
  const turnstileContainer = ref<HTMLElement | null>(null)

  const siteKey = config.public.turnstileSiteKey as string

  function renderTurnstile() {
    if (
      !turnstileContainer.value ||
      !(window as any).turnstile ||
      turnstileWidgetId.value
    ) {
      return
    }

    turnstileWidgetId.value = (window as any).turnstile.render(
      turnstileContainer.value,
      {
        sitekey: siteKey,
        callback: (token: string) => {
          turnstileToken.value = token
        }
      }
    )
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

  function loadTurnstileScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).turnstile) {
        resolve()
        return
      }
      const existing = document.querySelector(
        'script[src*="challenges.cloudflare.com/turnstile"]'
      )
      if (existing) {
        existing.addEventListener('load', () => resolve())
        if ((window as any).turnstile) resolve()
        return
      }
      const script = document.createElement('script')
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = () => resolve()
      document.head.appendChild(script)
    })
  }

  onMounted(async () => {
    if (!hasSubscription.value) {
      await loadTurnstileScript()
      nextTick(() => renderTurnstile())
    }
  })

  watch(hasSubscription, async (val, oldVal) => {
    if (!val && oldVal) {
      await loadTurnstileScript()
      nextTick(() => renderTurnstile())
    }
  })

  onBeforeUnmount(() => {
    if (turnstileWidgetId.value && (window as any).turnstile) {
      ;(window as any).turnstile.remove(turnstileWidgetId.value)
      turnstileWidgetId.value = null
    }
  })
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

    <div ref="turnstileContainer" class="q-mt-md" />

    <div class="q-mt-md text-right">
      <q-btn
        color="primary"
        label="Abo erstellen"
        :loading="loading"
        :disable="!turnstileToken"
        unelevated
        @click="handleCreate()"
      />
    </div>
  </div>
</template>
