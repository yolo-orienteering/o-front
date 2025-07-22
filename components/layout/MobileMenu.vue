<template>
  <q-footer elevated class="bg-white">
    <div id="teleport-to-menu" />

    <!-- back button -->
    <div v-if="showBackButton" class="row justify-center border-bottom-primary">
      <div class="col-auto q-py-sm">
        <back-btn />
      </div>
    </div>
    <!-- menu entries -->
    <div class="row text-primary">
      <div
        v-for="(menuEntry, menuEntryId) in menuEntries"
        :key="menuEntryId"
        class="col-4 q-pt-sm text-center text-caption"
        :class="[{ 'active-menu-border': isActiveRoute(menuEntry.routeName) }]"
      >
        <nuxt-link :to="{ name: menuEntry.routeName }">
          <div>
            <q-icon :name="menuEntry.icon" size="sm" />
          </div>
          {{ menuEntry.name }}
        </nuxt-link>
      </div>
    </div>
  </q-footer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BackBtn from '../helper/BackBtn.vue'

  interface IMenuEntry {
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
      icon: 'directions_run',
      routeName: 'races-my-races',
    },
  ])
  const showBackButton = ref<boolean>(false)
  const router = useRouter()
  const route = useRoute()

  // decide whether to show the back button or not
  router.afterEach((to) => {
    const insideMenuEntries: boolean = !!menuEntries.value.find(
      (menuEntry: IMenuEntry) => {
        return menuEntry.routeName === to.name
      }
    )
    const isDeparturesByCategory = route.name === 'departures-by-category'
    if (!insideMenuEntries && !isDeparturesByCategory) {
      showBackButton.value = true
    } else {
      showBackButton.value = false
    }
  })

  function isActiveRoute(routeName: string): boolean {
    return route.name === routeName
  }
</script>

<style lang="scss">
  .active-menu-border {
    border-bottom: 2px solid var(--q-primary);
  }
</style>
