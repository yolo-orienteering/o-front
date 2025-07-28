<script setup lang="ts">
  import MyolHeader from '@/components/layout/MyolHeader.vue'
  import { useQuasar } from 'quasar'

  const router = useRouter()
  const $q = useQuasar()

  const isDesktop = computed<boolean>(() => {
    return $q.screen.gt.md
  })
</script>

<template>
  <q-layout view="hHh lpR fFf" class="background">
    <!-- header -->
    <myol-header :reveal="!isDesktop" @click="router.push('/')" />

    <!-- desktop menu -->
    <client-only>
      <q-drawer
        :model-value="isDesktop"
        side="left"
        touchless
        bordered
        no-swipe-open
        :overlay="false"
        show-if-above
      >
        <layout-menu-content />
      </q-drawer>
    </client-only>

    <!-- content -->
    <q-page-container class="page-container">
      <q-page padding class="page">
        <slot />
      </q-page>
    </q-page-container>

    <!-- mobile menu -->
    <client-only>
      <q-footer :model-value="!isDesktop" elevated class="bg-white">
        <layout-menu-content />
      </q-footer>
    </client-only>
  </q-layout>
</template>

<style lang="scss">
  .page-container {
    display: flex;
    justify-content: center;
  }

  .page {
    max-width: 860px;
    width: 100%;
  }

  .q-drawer-container {
    position: fixed;
    height: 100vh;
  }
</style>
