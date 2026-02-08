<script lang="ts" setup>
  import type { IMenuEntry } from './MenuContent.vue'

  const route = useRoute()

  const props = defineProps<{ menuEntries: IMenuEntry[] }>()

  function isActiveRoute(menuEntry: IMenuEntry): boolean {
    return (
      route.name === menuEntry.routeName ||
      !!menuEntry.subRoutes?.find((subRoute) => route.path.includes(subRoute))
    )
  }
</script>

<template>
  <!-- desktop view -->
  <div class="xs-hide sm-hide">
    <q-list class="q-pt-md">
      <div
        v-for="(menuEntry, menuEntryId) in props.menuEntries"
        :key="menuEntryId"
      >
        <nuxt-link :to="{ name: menuEntry.routeName }">
          <q-item
            v-ripple
            clickable
            :active="isActiveRoute(menuEntry)"
            active-class="bg-primary text-white"
          >
            <q-item-section avatar>
              <q-icon :name="'o_' + menuEntry.icon" size="sm" />
            </q-item-section>

            <q-item-section>{{ menuEntry.name }}</q-item-section>
          </q-item>
        </nuxt-link>
      </div>
    </q-list>

    <q-separator spaced inset />
  </div>

  <!-- mobile view -->
  <div class="row text-primary md-hide lg-hide xl-hide">
    <div
      v-for="(menuEntry, menuEntryId) in props.menuEntries"
      :key="menuEntryId"
      class="col-3 q-pt-sm text-center text-caption"
      :class="[{ 'active-menu-border': isActiveRoute(menuEntry) }]"
    >
      <nuxt-link :to="{ name: menuEntry.routeName }">
        <div>
          <q-icon :name="'o_' + menuEntry.icon" size="sm" />
        </div>
        {{ menuEntry.name }}
      </nuxt-link>
    </div>
  </div>
</template>

<style></style>
