<script setup lang="ts">
  import MyolHeader from '@/components/layout/MyolHeader.vue'
  import { QDrawer, QFooter } from 'quasar'

  const router = useRouter()
  const route = useRoute()

  const isDesktop = useIsDesktop()

  const menuProps = computed(() => {
    if (isDesktop.value) {
      return {
        'model-value': true,
        side: 'left',
        touchless: true,
        bordered: true,
        'no-swipe-open': true,
        overlay: false,
        'show-if-above': true,
      }
    } else {
      return {
        'model-value': true,
        class: 'bg-white',
        elevated: true,
      }
    }
  })
</script>

<template>
  <q-layout view="hHh lpR fFf" class="background">
    <!-- header -->
    <myol-header :reveal="!isDesktop" @click="router.push('/')" />

    <!-- menu (mobile and desktop) -->
    <client-only>
      <component :is="isDesktop ? QDrawer : QFooter" v-bind="menuProps">
        <layout-menu-content />
      </component>
    </client-only>

    <!-- content -->
    <q-page-container class="page-container">
      <q-page
        padding
        class="page"
        :class="route.path.includes('/games/external') ? 'full-page-width' : ''"
      >
        <slot />
      </q-page>
    </q-page-container>
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

  .full-page-width {
    max-width: 100%;
  }

  .q-drawer-container {
    position: fixed;
    height: 100vh;
  }
</style>
