<script setup lang="ts">
  import MyolHeader from '@/components/layout/MyolHeader.vue'
  import { useQuasar } from 'quasar'

  const router = useRouter()
  const $q = useQuasar()

  const desktopMenuOpen = computed<boolean>(() => {
    return $q.screen.gt.md
  })
</script>

<template>
  <q-layout view="hHh lpR fFf" class="background">
    <!-- header -->
    <myol-header :reveal="true" @click="router.push('/')" />

    <!-- desktop menu -->
    <q-drawer
      :model-value="desktopMenuOpen"
      side="left"
      touchless
      bordered
      no-swipe-open
      :overlay="false"
    >
      <layout-menu-content />
    </q-drawer>

    <!-- content -->
    <q-page-container class="page-container">
      <q-page padding class="page">
        <slot />
      </q-page>
    </q-page-container>

    <!-- mobile menu -->
    <q-footer :model-value="!desktopMenuOpen" elevated class="bg-white">
      <layout-menu-content />
    </q-footer>
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
</style>
