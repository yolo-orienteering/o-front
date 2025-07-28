<script lang="ts" setup>
  import type { IMenuEntry } from './MenuContent.vue'

  const route = useRoute()

  const props = defineProps<{ menuEntries: IMenuEntry[] }>()

  function isActiveRoute(routeName: string): boolean {
    return route.name === routeName
  }
</script>

<template>
  <!-- desktop view -->
  <div class="desktop-only">
    <q-list class="q-pt-md">
      <div
        v-for="(menuEntry, menuEntryId) in props.menuEntries"
        :key="menuEntryId"
      >
        <nuxt-link :to="{ name: menuEntry.routeName }">
          <q-item
            v-ripple
            clickable
            :active="isActiveRoute(menuEntry.routeName)"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon :name="menuEntry.icon" size="sm" />
            </q-item-section>

            <q-item-section>{{ menuEntry.name }}</q-item-section>
          </q-item>
        </nuxt-link>
      </div>
    </q-list>

    <q-separator class="q-my-lg" />
  </div>

  <!-- mobile view -->
  <div class="row text-primary mobile-only">
    <div
      v-for="(menuEntry, menuEntryId) in props.menuEntries"
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
</template>

<style></style>
