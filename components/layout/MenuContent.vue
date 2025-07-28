<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import BackBtn from '../helper/BackBtn.vue'

  export interface IMenuEntry {
    name: string
    icon: string
    routeName: string
  }

  const menuEntries = ref<IMenuEntry[]>([
    {
      name: 'Einstellungen',
      icon: 'settings',
      routeName: 'settings',
    },
    {
      name: 'Entdecken',
      icon: 'search',
      routeName: 'index',
    },
    {
      name: 'Meine Läufe',
      icon: 'bookmark_outline',
      routeName: 'races-my-races',
    },
  ])

  const route = useRoute()

  // decide whether to show the back button or not
  const showBackButton = computed<boolean>(() => {
    return !menuEntries.value.find((menuEntry: IMenuEntry) => {
      return menuEntry.routeName === route.name
    })
  })
</script>

<template>
  <div class="row">
    <!-- teleport (e.g. races filter ) -->
    <div class="col-12">
      <div id="teleport-to-menu" />
    </div>

    <!-- back btn -->
    <div v-if="showBackButton" class="col-12">
      <div
        class="row justify-center items-center border-bottom-primary"
        style="overflow-x: scroll"
      >
        <div class="col-auto q-py-sm">
          <back-btn />
        </div>

        <!-- teleport (e.g. category selection) -->
        <div class="col-auto q-py-sm q-pl-sm">
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
