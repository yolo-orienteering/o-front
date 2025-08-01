<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import BackBtn from '../helper/BackBtn.vue'

  const route = useRoute()
  const isDesktop = useIsDesktop()

  export interface IMenuEntry {
    name: string
    icon: string
    routeName: string
    subRoutes?: string[]
  }

  const menuEntries = ref<IMenuEntry[]>([
    {
      name: 'Einstellungen',
      icon: 'settings',
      routeName: 'settings',
      subRoutes: ['/roadmap'],
    },
    {
      name: 'Games',
      icon: 'casino',
      routeName: 'games',
      subRoutes: ['/games/'],
    },
    {
      name: 'Entdecken',
      icon: 'search',
      routeName: 'index',
      subRoutes: ['/races/'],
    },
    {
      name: 'Meine Läufe',
      icon: 'bookmark_outline',
      routeName: 'my-races',
    },
  ])

  const hideBackBtnRoutes = ['/games/external']

  // decide whether to show the back button or not
  const showBackButton = computed<boolean>(() => {
    return (
      !menuEntries.value.find((menuEntry: IMenuEntry) => {
        return menuEntry.routeName === route.name
      }) &&
      !hideBackBtnRoutes.find((hideRoute) => route.path.includes(hideRoute))
    )
  })
</script>

<template>
  <div class="row">
    <!-- teleport (e.g. races filter ) -->
    <div class="col-12 q-px-md-md">
      <div id="teleport-to-filter-menu" />
    </div>

    <!-- back btn -->
    <div v-if="showBackButton" class="col-12 q-px-md-md">
      <div
        class="row justify-center items-center items-md-start"
        :class="isDesktop ? '' : 'border-bottom-primary'"
        :style="isDesktop ? {} : { overflowX: 'scroll' }"
      >
        <div class="col-auto col-md-12 q-py-sm">
          <back-btn />
        </div>

        <!-- teleport (e.g. category selection) -->
        <div class="col-auto col-md-12 q-py-sm q-pl-sm q-pl-md-none">
          <div id="teleport-right-to-back-btn" />
        </div>
      </div>
    </div>

    <!-- menu entries (routing) -->
    <div class="col-12 sort-order-md-first">
      <layout-menu-entries :menu-entries="menuEntries" />
    </div>
  </div>
</template>

<style lang="scss">
  @use 'quasar/src/css/variables' as *;

  @mixin mq-min($breakpoint) {
    @media (min-width: $breakpoint) {
      @content;
    }
  }

  .sort-order-md-first {
    @include mq-min($breakpoint-md) {
      order: -1;
    }
  }

  .active-menu-border {
    border-bottom: 2px solid var(--q-primary);
  }
</style>
