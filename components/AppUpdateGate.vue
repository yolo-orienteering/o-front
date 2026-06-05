<script setup lang="ts">
  const { updateRequired, storeUrl } = useNativeApp()

  function openStore() {
    if (storeUrl.value) {
      window.location.href = storeUrl.value
    }
  }
</script>

<template>
  <!-- Full-screen, non-dismissable gate shown when the native app is too old. A normal
       browser (mobile or desktop) never triggers this. -->
  <q-dialog :model-value="updateRequired">
    <q-card
      class="app-update-gate text-center q-pa-md"
      style="max-width: 420px"
    >
      <q-card-section>
        <div class="text-h6 q-mb-md">Es gibt was Neues! 🎉🧭</div>
        <p class="q-mb-sm">Eine frische Version der o-mate App ist da.</p>
        <p class="q-mb-none">
          Kurz aktualisieren, dann läuft alles rund und du bist startklar für
          die nächste Karte! 🗺️✨
        </p>
      </q-card-section>

      <q-card-section>
        <q-btn
          color="primary"
          icon="system_update"
          label="Jetzt aktualisieren"
          unelevated
          :outline="false"
          :disable="!storeUrl"
          @click="openStore()"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
  // Sit above every other layer (drawers, footers, other dialogs).
  .app-update-gate {
    z-index: 10000;
  }

  .app-update-gate__logo {
    height: 60px;
    width: auto;
    display: block;
    margin: 0 auto;
  }
</style>
