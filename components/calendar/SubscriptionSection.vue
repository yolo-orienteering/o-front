<script setup lang="ts">
  import { ref } from 'vue'
  import { Notify } from 'quasar'
  import { copyToClipboard } from '@/utils/clipboard'

  const { hasSubscription, subscriptionUrl } = useCalendarSubscription()
  // iOS / macOS / Linux open `webcal://` natively → keep the one-click flow.
  // Everywhere else (Windows, Android, …) we send the user to the how-to page.
  // On mobile (any OS) the one-click flow is unreliable, so we always route to the
  // guided how-to page instead.
  const { supportsWebcal, resolved, isMobile } = useDevicePlatform()

  const showUrl = ref(false)

  function openWebcal() {
    if (subscriptionUrl.value) window.location.href = subscriptionUrl.value
  }

  async function copyUrl() {
    if (!subscriptionUrl.value) return
    try {
      await copyToClipboard(subscriptionUrl.value)
      Notify.create({ message: 'Kalender-Link kopiert!', type: 'positive' })
    } catch {
      Notify.create({ message: 'Kopieren fehlgeschlagen', type: 'negative' })
    }
  }
</script>

<template>
  <div>
    <p>
      Verknüpfe deine gemerkten Läufe mit deiner Kalender-App. Änderungen werden
      automatisch synchronisiert.
    </p>

    <!-- Wait for client-side platform detection so we never flash the wrong branch. -->
    <div v-if="!resolved" class="text-caption text-grey">Einen Moment…</div>

    <template v-else>
      <!-- iOS / macOS / Linux: hand the webcal:// link straight to the OS. -->
      <template v-if="supportsWebcal">
        <!-- Mobile: the one-click webcal flow is unreliable → go to the guided page. -->
        <q-btn
          v-if="isMobile"
          color="primary"
          icon="event"
          label="Kalender verknüpfen"
          unelevated
          :outline="false"
          :to="{ name: 'calendar-setup' }"
        />

        <!-- Desktop: hand webcal:// straight to the OS, with the how-to as a fallback. -->
        <template v-else>
          <calendar-subscription-creator
            v-if="!hasSubscription"
            label="Kalender verknüpfen"
            icon="event"
            @created="openWebcal"
          />

          <template v-else>
            <div class="q-mt-md">
              <q-btn
                color="primary"
                icon="event"
                label="Kalender verknüpfen"
                unelevated
                :outline="false"
                @click="openWebcal()"
              />
            </div>

            <q-slide-transition>
              <div v-if="showUrl">
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
          </template>

          <!-- Fallback / second chance: the step-by-step guide also helps here. -->
          <div class="q-mt-md">
            <q-btn
              flat
              dense
              no-caps
              size="md"
              color="primary"
              icon="help_outline"
              label="Hat nicht geklappt? Schritt-für-Schritt-Anleitung"
              :to="{ name: 'calendar-setup' }"
            />
          </div>
        </template>
      </template>

      <!-- Windows / Android / other: webcal:// is unreliable → guided how-to page. -->
      <template v-else>
        <p class="text-caption text-grey q-mb-md">
          Auf diesem Gerät muss der Kalender manuell abonniert werden. Unsere
          Anleitung führt dich Schritt für Schritt durch.
        </p>
        <q-btn
          color="primary"
          icon="event"
          label="Kalender einrichten"
          unelevated
          :outline="false"
          :to="{ name: 'calendar-setup' }"
        />
      </template>
    </template>
  </div>
</template>
