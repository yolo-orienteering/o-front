<script setup lang="ts">
  import MagazineBadge from './MagazineBadge.vue'

  const props = defineProps<{ slug: string }>()

  const { login } = useMagazineSubscription()
  const { notify } = useQuasar()

  const showLogin = ref(false)
  const email = ref('')
  const password = ref('')

  function submitLogin() {
    // Mock: any input unlocks. Real auth would happen here.
    login()
    showLogin.value = false
    notify({
      message: 'Willkommen zurück! Beitrag freigeschaltet.',
      color: 'positive'
    })
  }
</script>

<template>
  <div class="paywall">
    <!-- fade-out over the content that sits behind the wall -->
    <div class="paywall__fade" />

    <q-card flat bordered class="paywall__card">
      <div class="paywall__icon">
        <q-icon name="lock" size="26px" color="primary" />
      </div>

      <magazine-badge class="q-mb-sm" />

      <p class="paywall__title">Jetzt weiterlesen</p>
      <p class="paywall__sub">
        Dieser Beitrag ist exklusiv für Abonnentinnen und Abonnenten. Mit einem
        Abo unterstützt du unabhängigen OL-Journalismus – und liest das ganze
        Swiss O Magazine online.
      </p>

      <ul class="paywall__benefits">
        <li>
          <q-icon name="check_circle" color="positive" size="18px" />
          Alle Beiträge des Swiss O Magazine online
        </li>
        <li>
          <q-icon name="check_circle" color="positive" size="18px" />
          Wahlweise zusätzlich als gedrucktes Heft
        </li>
        <li>
          <q-icon name="check_circle" color="positive" size="18px" />
          Jederzeit kündbar
        </li>
      </ul>

      <q-btn
        unelevated
        color="primary"
        class="full-width paywall__cta"
        :to="`/magazine/checkout?return=${slug}`"
      >
        Abo abschliessen – ab CHF 70.– / Jahr
      </q-btn>

      <div class="paywall__login">
        Bereits ein Abo?
        <a href="#" @click.prevent="showLogin = true">Anmelden</a>
      </div>

      <p class="paywall__demo">
        Demo: Dies ist ein Test der Online-Ausgabe. Es findet keine echte
        Zahlung statt.
      </p>
    </q-card>

    <!-- mock login dialog -->
    <q-dialog v-model="showLogin">
      <q-card class="paywall__dialog">
        <q-card-section class="row items-center q-pb-none">
          <magazine-badge />
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-h6 q-mb-md">Anmelden</p>
          <q-form @submit.prevent="submitLogin" class="q-gutter-md">
            <q-input
              v-model="email"
              type="email"
              label="E-Mail"
              outline
              dense
              autofocus
            />
            <q-input
              v-model="password"
              type="password"
              label="Passwort"
              outline
              dense
            />
            <q-btn
              type="submit"
              unelevated
              color="primary"
              class="full-width"
              label="Anmelden & weiterlesen"
            />
          </q-form>
          <p class="paywall__demo q-mt-md q-mb-none">
            Demo: Beliebige Eingabe schaltet den Beitrag frei.
          </p>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped lang="scss">
  .paywall {
    position: relative;
    margin-top: -120px; // pull up so the fade overlaps the last visible text
  }

  .paywall__fade {
    height: 120px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 0.92) 70%,
      #fff
    );
    pointer-events: none;
  }

  .paywall__card {
    border-radius: 20px;
    padding: 1.6rem 1.5rem 1.4rem;
    text-align: center;
    background: #fff;
    box-shadow: 0 12px 34px rgba(38, 70, 83, 0.14);
  }

  .paywall__icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(38, 70, 83, 0.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.6rem;
  }

  .paywall__title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--q-primary);
    margin: 0.3rem 0 0.5rem;
  }

  .paywall__sub {
    font-size: 0.98rem;
    line-height: 1.6;
    color: #4a4a4a;
    max-width: 460px;
    margin: 0 auto 1.1rem;
  }

  .paywall__benefits {
    list-style: none;
    margin: 0 auto 1.3rem;
    padding: 0;
    max-width: 360px;
    text-align: left;

    li {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      font-size: 0.95rem;
      color: #2b2b2b;
      margin-bottom: 0.55rem;
    }
  }

  .paywall__cta {
    border-radius: 12px;
    font-weight: 600;
    padding: 0.5rem 0;
  }

  .paywall__login {
    margin-top: 1rem;
    font-size: 0.92rem;
    color: #6b6b6b;

    a {
      color: var(--q-primary);
      font-weight: 600;
      text-decoration: underline;
    }
  }

  .paywall__demo {
    margin-top: 1rem;
    font-size: 0.75rem;
    line-height: 1.4;
    color: #9a9a9a;
  }

  .paywall__dialog {
    width: 360px;
    max-width: 92vw;
    border-radius: 18px;
  }
</style>
