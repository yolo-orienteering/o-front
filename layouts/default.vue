<template>
  <q-layout view="lHh Lpr lFf" class="background">
    <!-- header -->
    <myol-header @click="router.push('/')" />

    <!-- content -->
    <q-page-container class="page-container">
      <q-page padding class="page">
        <slot />
      </q-page>
    </q-page-container>

    <!-- mobile bottom menu -->
    <mobile-menu />
  </q-layout>
</template>

<script setup lang="ts">
  import MobileMenu from '@/components/layout/MobileMenu.vue'
  import MyolHeader from '@/components/layout/MyolHeader.vue'

  const router = useRouter()
</script>

<style lang="scss">
  .page-container {
    display: flex;
    justify-content: center;
  }

  .page {
    max-width: 860px;
  }
</style>
