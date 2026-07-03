<script setup lang="ts">
  import type { QForm } from 'quasar'
  import type { MagazinePlan } from '~/composables/useMagazineSubscription'
  import { getMagazineArticle } from '~/data/magazine'
  import MagazineBadge from '~/components/magazine/MagazineBadge.vue'

  const route = useRoute()
  const router = useRouter()
  const { notify } = useQuasar()
  const { subscribe, login, isSubscribed } = useMagazineSubscription()

  // where to return after a (mock) purchase
  const returnSlug = computed(() => (route.query.return as string) || '')
  const returnArticle = computed(() =>
    returnSlug.value ? getMagazineArticle(returnSlug.value) : undefined
  )
  function goBack() {
    if (returnSlug.value) router.push(`/magazine/${returnSlug.value}`)
    else router.push('/feed')
  }

  // ── plan selection ───────────────────────────────────────────────
  interface PlanOption {
    value: MagazinePlan
    title: string
    desc: string
    icon: string
    badge?: string
  }
  const plans: PlanOption[] = [
    {
      value: 'online',
      title: 'Online',
      desc: 'Alle Beiträge digital in o-mate und im Web – jederzeit, überall.',
      icon: 'mdi-cellphone'
    },
    {
      value: 'combo',
      title: 'Online & Print',
      desc: 'Das Beste aus beiden Welten: gedrucktes Heft plus digitaler Zugang.',
      icon: 'mdi-newspaper-variant-multiple-outline',
      badge: 'Bestes Angebot'
    },
    {
      value: 'print',
      title: 'Print',
      desc: 'Das gedruckte Magazin, viermal im Jahr bequem im Briefkasten.',
      icon: 'mdi-newspaper-variant-outline'
    }
  ]
  const selectedPlan = ref<MagazinePlan>('combo')
  const selectedPlanLabel = computed(
    () => plans.find((p) => p.value === selectedPlan.value)?.title ?? ''
  )

  // ── country → price ──────────────────────────────────────────────
  const countries = [
    { label: 'Schweiz', value: 'CH' },
    { label: 'Liechtenstein', value: 'CH' },
    { label: 'Deutschland', value: 'INT' },
    { label: 'Österreich', value: 'INT' },
    { label: 'Frankreich', value: 'INT' },
    { label: 'Anderes Land', value: 'INT' }
  ]
  const country = ref(countries[0])
  const price = computed(() => (country.value.value === 'CH' ? 70 : 85))

  // ── registration ─────────────────────────────────────────────────
  const firstName = ref('')
  const lastName = ref('')
  const email = ref('')
  const password = ref('')

  // ── payment ──────────────────────────────────────────────────────
  const paymentMethod = ref<'twint' | 'card'>('twint')
  const twintPhone = ref('')
  const cardNumber = ref('')
  const cardExpiry = ref('')
  const cardCvc = ref('')
  const cardHolder = ref('')

  const required = (v: string) => !!v?.trim() || 'Pflichtfeld'
  const emailRule = (v: string) =>
    /.+@.+\..+/.test(v) || 'Bitte gültige E-Mail eingeben'

  const formRef = ref<QForm>()
  const processing = ref(false)

  async function onSubmit() {
    const valid = await formRef.value?.validate()
    if (!valid) return

    // Mock payment processing — no real charge happens.
    processing.value = true
    setTimeout(() => {
      subscribe(selectedPlan.value)
      processing.value = false
      notify({
        message: 'Vielen Dank! Dein Abo ist aktiv.',
        caption: 'Demo – es wurde keine Zahlung ausgelöst.',
        color: 'positive',
        icon: 'check_circle'
      })
      goBack()
    }, 700)
  }

  function onLogin() {
    login()
    notify({ message: 'Willkommen zurück!', color: 'positive' })
    goBack()
  }

  useHead({ title: 'Abo abschliessen · Swiss O Magazine' })
</script>

<template>
  <div class="q-pt-md checkout">
    <div class="checkout__inner">
      <!-- header -->
      <div class="text-center q-mb-lg">
        <magazine-badge class="q-mb-sm" />
        <h1 class="checkout__title">Abo abschliessen</h1>
        <p class="checkout__sub">
          Unterstütze unabhängigen OL-Journalismus – und lies das ganze Swiss O
          Magazine online.
          <template v-if="returnArticle">
            Danach geht es zurück zu «{{ returnArticle.title }}».
          </template>
        </p>
      </div>

      <!-- already subscribed -->
      <q-card v-if="isSubscribed" flat bordered class="checkout__done">
        <q-icon name="check_circle" color="positive" size="42px" />
        <p class="checkout__done-title">Du hast bereits ein Abo</p>
        <p class="checkout__done-text">
          Alle Beiträge sind für dich freigeschaltet.
        </p>
        <q-btn unelevated color="primary" class="q-mt-sm" @click="goBack">
          {{ returnArticle ? 'Zurück zum Beitrag' : 'Zum Feed' }}
        </q-btn>
      </q-card>

      <q-form v-else ref="formRef" @submit.prevent="onSubmit">
        <div class="row q-col-gutter-lg">
          <!-- ── left: steps ── -->
          <div class="col-12 col-md-7">
            <!-- 1. plan -->
            <section class="checkout__section">
              <p class="checkout__step">1 · Abo wählen</p>
              <div class="row q-col-gutter-sm">
                <div
                  v-for="plan in plans"
                  :key="plan.value"
                  class="col-12 col-sm-4"
                >
                  <q-card
                    flat
                    bordered
                    class="plan"
                    :class="{ 'plan--active': selectedPlan === plan.value }"
                    @click="selectedPlan = plan.value"
                  >
                    <q-badge
                      v-if="plan.badge"
                      color="secondary"
                      class="plan__badge"
                      >{{ plan.badge }}</q-badge
                    >
                    <q-icon :name="plan.icon" size="28px" color="primary" />
                    <p class="plan__title">{{ plan.title }}</p>
                    <p class="plan__desc">{{ plan.desc }}</p>
                    <p class="plan__price">
                      CHF {{ price }}.–<span>/Jahr</span>
                    </p>
                    <q-icon
                      :name="
                        selectedPlan === plan.value
                          ? 'radio_button_checked'
                          : 'radio_button_unchecked'
                      "
                      :color="
                        selectedPlan === plan.value ? 'primary' : 'grey-5'
                      "
                      size="22px"
                      class="plan__radio"
                    />
                  </q-card>
                </div>
              </div>

              <q-select
                v-model="country"
                :options="countries"
                outlined
                dense
                label="Land der Rechnungsadresse"
                class="q-mt-md"
              />
              <p class="checkout__hint">
                Preis in der Schweiz CHF 70.– / Jahr, im Ausland CHF 85.– /
                Jahr.
              </p>
            </section>

            <!-- 2. account -->
            <section class="checkout__section">
              <p class="checkout__step">2 · Konto erstellen</p>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="firstName"
                    outlined
                    dense
                    label="Vorname"
                    :rules="[required]"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="lastName"
                    outlined
                    dense
                    label="Nachname"
                    :rules="[required]"
                  />
                </div>
              </div>
              <q-input
                v-model="email"
                outlined
                dense
                type="email"
                label="E-Mail"
                class="q-mt-sm"
                :rules="[required, emailRule]"
              />
              <q-input
                v-model="password"
                outlined
                dense
                type="password"
                label="Passwort"
                class="q-mt-sm"
                :rules="[required]"
              />
            </section>

            <!-- 3. payment -->
            <section class="checkout__section">
              <p class="checkout__step">3 · Zahlungsmittel</p>
              <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-6">
                  <q-card
                    flat
                    bordered
                    class="pay"
                    :class="{ 'pay--active': paymentMethod === 'twint' }"
                    @click="paymentMethod = 'twint'"
                  >
                    <span class="pay__twint">TWINT</span>
                    <q-icon
                      v-if="paymentMethod === 'twint'"
                      name="check_circle"
                      color="primary"
                      size="20px"
                      class="pay__check"
                    />
                  </q-card>
                </div>
                <div class="col-6">
                  <q-card
                    flat
                    bordered
                    class="pay"
                    :class="{ 'pay--active': paymentMethod === 'card' }"
                    @click="paymentMethod = 'card'"
                  >
                    <q-icon name="credit_card" size="22px" color="primary" />
                    <span class="pay__label">Kreditkarte</span>
                    <q-icon
                      v-if="paymentMethod === 'card'"
                      name="check_circle"
                      color="primary"
                      size="20px"
                      class="pay__check"
                    />
                  </q-card>
                </div>
              </div>

              <!-- TWINT -->
              <div v-if="paymentMethod === 'twint'">
                <q-input
                  v-model="twintPhone"
                  outlined
                  dense
                  type="tel"
                  label="Handynummer (für TWINT)"
                  mask="### ### ## ##"
                  fill-mask="_"
                  :rules="[required]"
                >
                  <template #prepend>
                    <span class="text-grey-7">+41</span>
                  </template>
                </q-input>
                <p class="checkout__hint">
                  Du wirst zur Bestätigung in die TWINT-App weitergeleitet.
                </p>
              </div>

              <!-- Credit card -->
              <div v-else>
                <q-input
                  v-model="cardNumber"
                  outlined
                  dense
                  label="Kartennummer"
                  mask="#### #### #### ####"
                  fill-mask="_"
                  :rules="[required]"
                >
                  <template #append>
                    <q-icon name="credit_card" color="grey-6" />
                  </template>
                </q-input>
                <div class="row q-col-gutter-sm q-mt-none">
                  <div class="col-6">
                    <q-input
                      v-model="cardExpiry"
                      outlined
                      dense
                      label="Gültig bis"
                      mask="##/##"
                      fill-mask="_"
                      :rules="[required]"
                    />
                  </div>
                  <div class="col-6">
                    <q-input
                      v-model="cardCvc"
                      outlined
                      dense
                      label="CVC"
                      mask="###"
                      fill-mask="_"
                      :rules="[required]"
                    />
                  </div>
                </div>
                <q-input
                  v-model="cardHolder"
                  outlined
                  dense
                  label="Karteninhaber"
                  class="q-mt-sm"
                  :rules="[required]"
                />
              </div>
            </section>
          </div>

          <!-- ── right: summary ── -->
          <div class="col-12 col-md-5">
            <q-card flat bordered class="summary">
              <p class="summary__title">Übersicht</p>

              <div class="summary__row">
                <span>Abo</span>
                <span class="text-weight-medium">{{ selectedPlanLabel }}</span>
              </div>
              <div class="summary__row">
                <span>Land</span>
                <span class="text-weight-medium">{{ country.label }}</span>
              </div>
              <div class="summary__row">
                <span>Laufzeit</span>
                <span class="text-weight-medium">12 Monate</span>
              </div>

              <q-separator class="q-my-sm" />

              <div class="summary__row summary__total">
                <span>Total</span>
                <span>CHF {{ price }}.–</span>
              </div>
              <p class="summary__note">
                inkl. MwSt. · jährlich · jederzeit kündbar
              </p>

              <q-btn
                type="submit"
                unelevated
                color="primary"
                class="full-width summary__cta"
                :loading="processing"
              >
                Zahlungspflichtig abonnieren
              </q-btn>

              <div class="summary__secure">
                <q-icon name="lock" size="14px" />
                Sichere Bezahlung · SSL-verschlüsselt
              </div>

              <div class="summary__login">
                Bereits Abonnent?
                <a href="#" @click.prevent="onLogin">Anmelden</a>
              </div>

              <p class="checkout__demo">
                Demo: Dies ist ein Test der Online-Ausgabe. Es findet keine
                echte Registrierung und keine Zahlung statt.
              </p>
            </q-card>
          </div>
        </div>
      </q-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .checkout__inner {
    max-width: 920px;
    margin: 0 auto;
  }

  .checkout__title {
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--q-primary);
    margin: 0.3rem 0 0.4rem;
  }

  .checkout__sub {
    font-size: 1rem;
    line-height: 1.55;
    color: #5a5a5a;
    max-width: 540px;
    margin: 0 auto;
  }

  .checkout__section {
    margin-bottom: 1.8rem;
  }

  .checkout__step {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--q-secondary);
    margin: 0 0 0.7rem;
  }

  .checkout__hint {
    font-size: 0.8rem;
    color: #8a8a8a;
    margin: 0.5rem 0 0;
  }

  .checkout__demo {
    font-size: 0.74rem;
    line-height: 1.4;
    color: #9a9a9a;
    margin: 1rem 0 0;
  }

  // ── plan cards ──
  .plan {
    position: relative;
    height: 100%;
    border-radius: 14px;
    padding: 1rem 0.9rem 0.9rem;
    cursor: pointer;
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;
    border-width: 1.5px;
  }

  .plan--active {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 1px var(--q-primary);
  }

  .plan__badge {
    position: absolute;
    top: -9px;
    right: 10px;
    font-size: 0.65rem;
    font-weight: 700;
    border-radius: 6px;
  }

  .plan__title {
    font-weight: 700;
    color: var(--q-primary);
    font-size: 1.05rem;
    margin: 0.45rem 0 0.25rem;
  }

  .plan__desc {
    font-size: 0.82rem;
    line-height: 1.45;
    color: #6a6a6a;
    margin: 0 0 0.6rem;
    min-height: 2.6em;
  }

  .plan__price {
    font-weight: 700;
    color: #2b2b2b;
    margin: 0;

    span {
      font-weight: 400;
      font-size: 0.8rem;
      color: #8a8a8a;
    }
  }

  .plan__radio {
    position: absolute;
    top: 0.7rem;
    right: 0.7rem;
  }

  // ── payment method cards ──
  .pay {
    position: relative;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    cursor: pointer;
    border-width: 1.5px;
  }

  .pay--active {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 1px var(--q-primary);
  }

  .pay__label {
    font-weight: 600;
    color: #333;
  }

  // mimic the TWINT wordmark look
  .pay__twint {
    background: #000;
    color: #fff;
    font-weight: 800;
    letter-spacing: 0.03em;
    font-size: 0.95rem;
    padding: 0.2rem 0.55rem;
    border-radius: 6px;
  }

  .pay__check {
    position: absolute;
    top: 6px;
    right: 6px;
  }

  // ── summary ──
  .summary {
    border-radius: 16px;
    padding: 1.3rem 1.3rem 1.2rem;
    position: sticky;
    top: 1rem;
  }

  .summary__title {
    font-weight: 700;
    color: var(--q-primary);
    font-size: 1.1rem;
    margin: 0 0 0.9rem;
  }

  .summary__row {
    display: flex;
    justify-content: space-between;
    font-size: 0.92rem;
    color: #4a4a4a;
    margin-bottom: 0.5rem;
  }

  .summary__total {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--q-primary);
    margin-bottom: 0.2rem;
  }

  .summary__note {
    font-size: 0.76rem;
    color: #9a9a9a;
    margin: 0 0 1rem;
  }

  .summary__cta {
    border-radius: 12px;
    font-weight: 600;
    padding: 0.55rem 0;
  }

  .summary__secure {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    font-size: 0.78rem;
    color: #8a8a8a;
    margin-top: 0.8rem;
  }

  .summary__login {
    text-align: center;
    margin-top: 0.9rem;
    font-size: 0.9rem;
    color: #6b6b6b;

    a {
      color: var(--q-primary);
      font-weight: 600;
      text-decoration: underline;
    }
  }

  // ── already subscribed ──
  .checkout__done {
    border-radius: 18px;
    padding: 2rem 1.5rem;
    text-align: center;
    max-width: 460px;
    margin: 0 auto;
  }

  .checkout__done-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--q-primary);
    margin: 0.6rem 0 0.3rem;
  }

  .checkout__done-text {
    color: #5a5a5a;
    margin: 0;
  }
</style>
