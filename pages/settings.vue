<template>
  <div class="q-pt-md">
    <!-- personal data -->
    <div class="row">
      <div class="col-12 text-h5">Persönliche Daten</div>
      <div class="col-12 q-px-sm q-pt-sm">
        <user-form />
      </div>
    </div>

    <!-- Feedback -->
    <div class="row q-my-xl">
      <div class="col-12 text-h5">Feedback</div>
      <p class="col-12 q-pt-sm q-px-sm">
        Hast Du Ideen oder Rückmeldungen zu dieser App? Möchtest Du den Betrieb,
        den Vertrieb oder die Entwicklung unterstützen, gar mitprogrammieren?
        <br />
        Was immer es ist. Schreib mir eine E-Mail oder kontaktiere mich via
        Telefonnummer.
      </p>
      <div class="col-12 text-center">
        <q-btn
          href="mailto:scheurer.michael@pm.me"
          target="_blank"
          flat
          size="md"
          ><q-icon name="mail" class="q-mr-sm" />
          <span style="text-transform: lowercase"
            >scheurer.michael@pm.me</span
          ></q-btn
        >
      </div>
      <div class="col-12 text-center">
        <q-btn href="tel:+41793456052" target="_blank" flat size="md"
          ><q-icon name="phone" class="q-mr-sm" />+41793456052</q-btn
        >
      </div>
    </div>

    <!-- Roadmap -->
    <div class="row q-my-xl">
      <div class="col-12 text-h5">Wunschliste</div>
      <div class="col-12 q-pt-sm q-px-sm">
        <p>
          Vielleicht steht deine Idee bereits auf unserer Wunschliste. Was wir
          bereits umgesetzt haben und gerne noch umsetzen möchten, findest Du in
          der Roadmap.
        </p>
      </div>
      <div class="col-12 text-center">
        <q-btn :to="{ name: 'roadmap' }" flat size="md"
          ><q-icon name="lightbulb" class="q-mr-sm" /> Roadmap öffnen</q-btn
        >
      </div>
    </div>

    <!-- Open Source -->
    <div class="row q-my-xl">
      <div class="col-12 text-h5">Open Source</div>
      <p class="col-12 q-pt-sm q-px-sm">
        Der Code von o-mate ist komplett offen. Hast Du Lust,
        mitzuprogrammieren? Nimm Kontakt mit uns auf oder erstelle direkt einen
        Pullrequest auf Github.
      </p>
      <div class="col-12 text-center">
        <q-btn
          href="https://github.com/orgs/yolo-orienteering/repositories"
          target="_blank"
          flat
          size="md"
        >
          <q-icon name="code" class="q-mr-sm" /> Code auf Github ansehen
        </q-btn>
      </div>
    </div>

    <!-- privacy policy -->
    <div class="row q-my-xl">
      <div class="col-12 text-h5">Datenschutz</div>
      <p>
        Wir legen grossen Wert darauf, dass der Umgang mit Personendaten
        transparent ist.
      </p>
      <div class="col-12 text-center">
        <q-btn :to="{ name: 'privacy-policy' }" flat size="md">
          <q-icon name="security" class="q-mr-sm" /> Datenschutzerklärung
        </q-btn>
      </div>
    </div>
  </div>
</template>
