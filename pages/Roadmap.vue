<script lang="ts" setup>
const milestones: { text: string, done: boolean }[] = [
  {
    text: 'Zeige deine Startzeit automatisch an, wenn Du an einem Lauf angemeldet bist. (01.04.2025)',
    done: true
  }, {
    text: 'Android App (05.04.2025)',
    done: true
  }, {
    text: 'IOS App (07.04.2025)',
    done: true
  }, {
    text: 'Ältere OLs anzeigen (07.04.2025)',
    done: true
  }, {
    text: 'Weisungen automatisch von den Veranstaltungswebseiten abgreifen. (10.04.2025)',
    done: true
  }, {
    text: 'Nach Terrain (Urban / Wald) filtern. (05.05.2025)',
    done: true
  }, {
    text: 'Informationen aus den Weisungen mit KI als strukturierte Daten übersichtlich zur Verfügung stellen. (06.05.2025)',
    done: true
  }, {
    text: 'Newsletter-Anmeldung (21.06.2025)',
    done: true
  }, {
    text: 'Startlisten anzeigen: auch für nicht Angemeldete / suche nach Namen / zeige alle Kategorien / merke Startzeiten anderer Läufer:innen',
    done: false
  }, {
    text: 'Teile-Button für Läufe > SSR',
    done: false
  }, {
    text: 'Einbindung von relevanten OL-News',
    done: false
  }, {
    text: 'Social-App-Elemente (Fahrgemeinschaften, Posts, Following, Freundeskreise usw.)',
    done: false
  }, {
    text: 'Front-end auf Nuxtjs/Vuetify umschreiben für SSR-Untersützung und SEO-Optimierung.',
    done: false
  }, {
    text: 'Desktop-Version programmieren.',
    done: false
  }, {
    text: 'Übersetze die App in andere Sprachen.',
    done: false
  }, {
    text: 'Resultate in der App darstellen.',
    done: false
  }, {
    text: 'Synchronisiere die vorgemerkten Läufe automatisch mit Kalender.',
    done: false
  }, {
    text: 'Plane deine Anreise mit einer integrierten Karte und dem genauem Standort des OLs.',
    done: false
  }, {
    text: 'Erhalte Erinnerungen bei Anmeldeschlüssen.',
    done: false
  }, {
    text: 'Bilde Freundeskreise und sehe, welche Freunde an welchen OLs teilnehmen.',
    done: false
  }, {
    text: 'Bilde Fahrgemeinschaften an OLs.',
    done: false
  }, {
    text: 'Suche nach internationalen OLs.',
    done: false
  }
]
</script>

<template>
  <div>
    <div class="row q-pt-md">
      <div class="col-12 text-h5">
        Roadmap
      </div>
      <div class="col-12 q-px-sm q-pt-sm text-body1">
        <div v-for="(milestone, milestoneIndex) in milestones" :key="milestoneIndex" class="q-pb-sm">
          <q-icon :name="milestone.done ? 'check_box' : 'check_box_outline_blank'" class="q-mr-xs" size="sm" /> {{
            milestone.text }}
        </div>
      </div>
    </div>
  </div>
</template>
