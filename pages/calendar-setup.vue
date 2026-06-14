<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { Notify } from 'quasar'
  import { copyToClipboard } from '@/utils/clipboard'

  /**
   * Guided "subscribe to your calendar" page for platforms where `webcal://` is unreliable
   * (Windows, Android, …). iOS/macOS/Linux reach it too, as a fallback when the one-click
   * webcal link didn't work. Steps:
   *   1. On mobile, nudge the user to continue on a desktop (the `?sub=<id>` link carries
   *      the subscription so it works on a device without our localStorage).
   *   2. Pick a calendar provider → show tailored "subscribe by URL" instructions.
   * See useDevicePlatform / useCalendarSubscription and the frontend CLAUDE.md.
   */
  const route = useRoute()
  const syncCenter = useSyncCenter()
  const { urlsForId } = useCalendarSubscription()
  const { isMobile, resolved } = useDevicePlatform()
  const { canNativeShare, nativeShare, whatsappHref } = useShareLink()

  // The subscription id can come from a cross-device link (?sub=…) or from local state.
  const effectiveId = computed<string | null>(() => {
    const q = route.query.sub
    const fromQuery = Array.isArray(q) ? q[0] : q
    return (fromQuery || syncCenter.calendarSubscriptionId || null) as
      | string
      | null
  })

  const urls = computed(() =>
    effectiveId.value ? urlsForId(effectiveId.value) : null
  )

  const baseUrl = computed<string>(() =>
    typeof window === 'undefined'
      ? useRequestURL().origin
      : window.location.origin
  )

  /** Self-referential link that carries the subscription, for opening on a computer. */
  const desktopLink = computed<string | null>(() =>
    effectiveId.value
      ? `${baseUrl.value}${route.path}?sub=${effectiveId.value}`
      : null
  )

  const mailtoHref = computed<string>(() => {
    if (!desktopLink.value) return '#'
    const subject = encodeURIComponent('o-mate Kalender am Computer einrichten')
    const body = encodeURIComponent(
      `Öffne diesen Link an deinem Computer, um deinen o-mate-Kalender zu abonnieren:\n\n${desktopLink.value}`
    )
    return `mailto:?subject=${subject}&body=${body}`
  })

  const whatsappShareHref = computed<string>(() =>
    desktopLink.value
      ? whatsappHref(desktopLink.value, 'Mein o-mate-Kalender:')
      : '#'
  )

  /** Number of the provider-selection step (the desktop nudge is step 1 on mobile). */
  const providerStepNo = computed<number>(() => (isMobile.value ? 2 : 1))

  // On mobile we show the "continue on a computer" step first and only reveal the provider
  // step once the user actively chooses to carry on here.
  const continuedOnDevice = ref(false)
  const showProviderStep = computed<boolean>(
    () => resolved.value && (!isMobile.value || continuedOnDevice.value)
  )

  const selected = ref<string | null>(null)
  const showWebcal = ref(false)

  function select(id: string) {
    selected.value = selected.value === id ? null : id
  }

  async function copyText(text: string | null | undefined, message: string) {
    if (!text) return
    try {
      await copyToClipboard(text)
      Notify.create({ message, type: 'positive' })
    } catch {
      Notify.create({ message: 'Kopieren fehlgeschlagen', type: 'negative' })
    }
  }

  /**
   * Step-by-step instructions for the calendar providers most common in Switzerland, plus a
   * generic fallback. All use the "subscribe by URL" path so events stay in sync (not a
   * one-off import). Menu labels can drift between app versions — keep these reviewed.
   */
  interface Provider {
    id: string
    name: string
    icon: string
    color: string
    steps: string[]
    note?: string
  }

  const providers: Provider[] = [
    {
      id: 'google',
      name: 'Google Kalender',
      icon: 'mdi-google',
      color: 'red-6',
      steps: [
        'Öffne calendar.google.com an einem Computer.',
        'Klicke links neben «Weitere Kalender» auf das Plus-Symbol (+).',
        'Wähle «Per URL».',
        'Füge die unten stehende Kalender-URL ein und klicke auf «Kalender hinzufügen».'
      ]
    },
    {
      id: 'apple',
      name: 'Apple Kalender',
      icon: 'mdi-apple',
      color: 'grey-9',
      steps: [
        'Mac: App «Kalender» öffnen → Menü «Ablage» → «Neues Kalenderabonnement…».',
        'iPhone/iPad: Einstellungen → «Apps» → «Kalender» → «Accounts» → «Account hinzufügen» → «Andere» → «Kalenderabo hinzufügen».',
        'Füge die unten stehende Kalender-URL ein und bestätige.'
      ]
    },
    {
      id: 'outlook-web',
      name: 'Outlook im Web',
      icon: 'mdi-microsoft-outlook',
      color: 'blue-7',
      steps: [
        'Öffne outlook.com an einem Computer und wechsle zum Kalender.',
        'Klicke auf «Kalender hinzufügen» → «Aus dem Internet abonnieren».',
        'Füge die unten stehende Kalender-URL ein, vergib einen Namen und klicke auf «Importieren».'
      ]
    },
    {
      id: 'outlook-desktop',
      name: 'Outlook (Windows-App)',
      icon: 'mdi-microsoft-outlook',
      color: 'blue-9',
      steps: [
        'Öffne Outlook und wechsle unten links zum Kalender.',
        'Wähle «Kalender hinzufügen» → «Aus dem Internet abonnieren» (im neuen Outlook) bzw. Start → «Kalender öffnen» → «Aus dem Internet…» (im klassischen Outlook).',
        'Füge die unten stehende Kalender-URL ein und bestätige.'
      ]
    },
    {
      id: 'samsung',
      name: 'Samsung Kalender',
      icon: 'mdi-cellphone',
      color: 'indigo-7',
      steps: [
        'Die Samsung-Kalender-App kann keine URL direkt abonnieren – sie zeigt die Kalender deines Google-Kontos an.',
        'Abonniere die URL einmalig in Google Kalender an einem Computer (siehe «Google Kalender»).',
        'Öffne danach in der Samsung-Kalender-App «Menü» → «Kalender verwalten» und aktiviere den neuen Kalender.'
      ],
      note: 'Achte darauf, dass die Samsung-App mit demselben Google-Konto synchronisiert.'
    },
    {
      id: 'proton',
      name: 'Proton Calendar',
      icon: 'mdi-shield-lock-outline',
      color: 'deep-purple-6',
      steps: [
        'Öffne calendar.proton.me an einem Computer.',
        'Gehe zu «Einstellungen» → «Kalender» → «Andere Kalender» → «Abonnieren».',
        'Füge die unten stehende Kalender-URL ein und bestätige.'
      ]
    },
    {
      id: 'infomaniak',
      name: 'Infomaniak Kalender',
      icon: 'mdi-calendar-account',
      color: 'blue-grey-7',
      steps: [
        'Öffne deinen Infomaniak-Kalender (ksuite.infomaniak.com → «Kalender»).',
        'Klicke beim Bereich «Kalender abonniert» / «Andere Kalender» auf das «+» und wähle «Per URL abonnieren».',
        'Füge die unten stehende Kalender-URL ein und bestätige.'
      ]
    },
    {
      id: 'thunderbird',
      name: 'Mozilla Thunderbird',
      icon: 'mdi-bird',
      color: 'light-blue-7',
      steps: [
        'Öffne Thunderbird und wechsle zum Kalender.',
        'Rechtsklick in die Kalenderliste → «Neuer Kalender» → «Im Netzwerk».',
        'Wähle das Format «iCalendar (ICS)», füge die unten stehende Kalender-URL ein und klicke auf «Weiter».'
      ]
    },
    {
      id: 'bluewin',
      name: 'Bluewin / Swisscom',
      icon: 'mdi-email-outline',
      color: 'blue-8',
      steps: [
        'Melde dich an einem Computer bei der Bluewin-Webmail (bluewin.ch) an und öffne den Kalender.',
        'Wähle «Neuer Kalender» bzw. «Kalender abonnieren» → «Abonnieren via URL».',
        'Füge die unten stehende Kalender-URL ein und bestätige.'
      ]
    }
  ]

  const fallback: Provider = {
    id: 'other',
    name: 'Anderer Kalender',
    icon: 'mdi-help-circle-outline',
    color: 'grey-7',
    steps: [
      'Öffne deine Kalender-App oder das Kalendermodul deines Webmails an einem Computer.',
      'Suche nach «Kalender abonnieren», «Kalender hinzufügen» oder «Per URL abonnieren» – oft unter «Andere Kalender» oder einem «+»-Symbol.',
      'Wähle die Option, einen Kalender über eine Internet-Adresse (URL / Webcal / ICS) zu abonnieren – nicht «importieren».',
      'Füge die unten stehende Kalender-URL ein und bestätige.'
    ],
    note: 'Wähle wenn möglich «abonnieren» statt «importieren», damit Änderungen automatisch synchronisiert werden.'
  }

  const allProviders = computed<Provider[]>(() => [...providers, fallback])
  const selectedProvider = computed<Provider | null>(
    () => allProviders.value.find((p) => p.id === selected.value) ?? null
  )

  useSeoMeta({
    title: 'Kalender abonnieren – o-mate',
    robots: 'noindex'
  })
</script>

<template>
  <div class="q-pt-md">
    <h1 class="text-h5 q-mt-none q-mb-sm">Kalender abonnieren</h1>
    <p class="text-body2 text-grey-8">
      Hier kannst du deine gemerkten Läufe in wenigen Schritten abonnieren.
      Einmal eingerichtet, synchronisieren sich Änderungen automatisch. Für
      Iphone-User ist ein Update geplant, mit dem die Läufe mit einem Klick
      abonniert werden können.
    </p>

    <client-only>
      <template #fallback>
        <div class="text-caption text-grey q-mt-md">Einen Moment…</div>
      </template>

      <!-- Step 0: there is no subscription yet → create one first. -->
      <q-card v-if="!effectiveId" flat bordered class="q-pa-md q-mt-md">
        <div class="text-subtitle1 q-mb-xs">
          Zuerst dein Kalender-Abo erstellen
        </div>
        <p class="text-body2 text-grey-8 q-mb-sm">
          Damit wir dir eine Abo-Adresse geben können, erstellen wir kurz dein
          persönliches Kalender-Abo.
        </p>
        <calendar-subscription-creator label="Kalender-Abo erstellen" />
      </q-card>

      <template v-else>
        <!-- Step 1 (mobile only): continue on a desktop. -->
        <q-card
          v-if="resolved && isMobile"
          flat
          bordered
          class="q-pa-md q-mt-md bg-orange-1"
        >
          <div class="row items-center q-mb-xs no-wrap">
            <q-icon name="computer" size="sm" class="q-mr-sm text-orange-9" />
            <div class="text-subtitle1">Schritt 1: Am Computer fortfahren</div>
          </div>
          <p class="text-body2 text-grey-8 q-mb-sm">
            Das Abonnieren eines Kalenders klappt auf dem Handy oft nicht
            zuverlässig. Öffne diese Seite am besten an einem Computer – über
            den folgenden Link bleibt dein Abo erhalten.
          </p>

          <q-input
            :model-value="desktopLink"
            readonly
            outlined
            dense
            label="Link für den Computer"
          >
            <template #append>
              <q-btn
                flat
                round
                icon="content_copy"
                @click="copyText(desktopLink, 'Link kopiert!')"
              />
            </template>
          </q-input>

          <div class="text-caption text-weight-medium q-mt-md q-mb-xs">
            Link senden
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-auto">
              <q-btn
                unelevated
                :outline="false"
                no-caps
                color="green-6"
                icon="mdi-whatsapp"
                label="WhatsApp"
                :href="whatsappShareHref"
                target="_blank"
              />
            </div>
            <div v-if="canNativeShare" class="col-auto">
              <q-btn
                unelevated
                :outline="false"
                no-caps
                color="light-blue-7"
                icon="mdi-share-variant"
                label="Signal"
                @click="
                  nativeShare(desktopLink ?? '', { title: 'o-mate Kalender' })
                "
              />
            </div>
            <div class="col-auto">
              <q-btn
                unelevated
                :outline="false"
                no-caps
                color="primary"
                icon="mail"
                label="E-Mail"
                :href="mailtoHref"
              />
            </div>
          </div>
          <div v-if="canNativeShare" class="text-caption text-grey q-mt-xs">
            «Signal» öffnet die Teilen-Funktion deines Geräts (Signal, Telegram,
            …).
          </div>

          <!-- Make the user actively decide to continue on this (mobile) device. -->
          <div v-if="!continuedOnDevice" class="q-mt-md">
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              icon="arrow_downward"
              label="Trotzdem auf diesem Gerät weitermachen"
              @click="continuedOnDevice = true"
            />
          </div>
        </q-card>

        <!-- Step (provider): pick a calendar and follow the instructions. -->
        <div v-if="showProviderStep" class="q-mt-lg">
          <div class="text-subtitle1 q-mb-sm">
            Schritt {{ providerStepNo }}: Welchen Kalender nutzt du?
          </div>

          <div class="row q-col-gutter-sm">
            <div v-for="p in allProviders" :key="p.id" class="col-6 col-sm-4">
              <q-btn
                stack
                no-caps
                class="full-width"
                :icon="p.icon"
                :label="p.name"
                :color="selected === p.id ? 'primary' : p.color"
                :outline="selected !== p.id"
                @click="select(p.id)"
              />
            </div>
          </div>
        </div>

        <!-- Selected provider instructions + the URL to paste. -->
        <q-slide-transition v-if="showProviderStep">
          <q-card v-if="selectedProvider" flat bordered class="q-pa-md q-mt-md">
            <div class="row items-center q-mb-sm no-wrap">
              <q-icon
                :name="selectedProvider.icon"
                size="sm"
                class="q-mr-sm text-primary"
              />
              <div class="text-subtitle1">{{ selectedProvider.name }}</div>
            </div>

            <ol class="q-pl-md q-my-none">
              <li
                v-for="(step, i) in selectedProvider.steps"
                :key="i"
                class="q-mb-xs text-body2"
              >
                {{ step }}
              </li>
            </ol>

            <q-banner
              v-if="selectedProvider.note"
              dense
              class="bg-blue-1 text-body2 q-mb-md rounded-borders"
            >
              <template #avatar>
                <q-icon name="info" color="blue-8" />
              </template>
              {{ selectedProvider.note }}
            </q-banner>

            <div class="text-caption text-weight-medium q-mb-xs">
              Deine Kalender-URL
            </div>
            <q-input :model-value="urls?.https" readonly outlined dense>
              <template #append>
                <q-btn
                  flat
                  round
                  icon="content_copy"
                  @click="copyText(urls?.https, 'Kalender-URL kopiert!')"
                />
              </template>
            </q-input>

            <div class="q-mt-sm">
              <a
                class="text-primary text-caption cursor-pointer"
                @click.prevent="showWebcal = !showWebcal"
              >
                {{
                  showWebcal
                    ? 'webcal://-Variante ausblenden'
                    : 'App verlangt eine webcal://-Adresse? Hier anzeigen'
                }}
              </a>
            </div>
            <q-slide-transition>
              <q-input
                v-if="showWebcal"
                :model-value="urls?.webcal"
                readonly
                outlined
                dense
                class="q-mt-sm"
              >
                <template #append>
                  <q-btn
                    flat
                    round
                    icon="content_copy"
                    @click="copyText(urls?.webcal, 'webcal-Link kopiert!')"
                  />
                </template>
              </q-input>
            </q-slide-transition>
          </q-card>
        </q-slide-transition>
      </template>
    </client-only>
  </div>
</template>
