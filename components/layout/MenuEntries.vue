<script lang="ts" setup>
  import type { IMenuEntry } from './MenuContent.vue'
  import { useUnreadPosts } from '@/stores/useUnreadPosts'

  const route = useRoute()
  const unreadPosts = useUnreadPosts()

  const props = defineProps<{ menuEntries: IMenuEntry[] }>()

  function isActiveRoute(menuEntry: IMenuEntry): boolean {
    return (
      route.name === menuEntry.routeName ||
      !!menuEntry.subRoutes?.find((subRoute) => route.path.includes(subRoute))
    )
  }

  // red dot for the feed entry when there are unseen published posts
  function showUnreadDot(menuEntry: IMenuEntry): boolean {
    return menuEntry.routeName === 'feed' && unreadPosts.hasUnreadPosts
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
              <div class="relative-position">
                <q-icon :name="'o_' + menuEntry.icon" size="md" />
                <q-badge
                  v-if="showUnreadDot(menuEntry)"
                  class="unread-dot"
                  color="red"
                  rounded
                  floating
                />
              </div>
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
          <span class="relative-position">
            <q-icon :name="'o_' + menuEntry.icon" size="sm" />
            <q-badge
              v-if="showUnreadDot(menuEntry)"
              class="unread-dot"
              color="red"
              rounded
              floating
            />
          </span>
        </div>
        {{ menuEntry.name }}
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  // small round notification dot on a menu icon (feed unread posts).
  // Compound selector to beat Quasar's default .q-badge padding/min-width,
  // which would otherwise render it as a wider-than-tall oval.
  .q-badge.unread-dot {
    margin-top: -4px;
    margin-right: -4px;
    width: 12px;
    height: 12px;
    padding: 0;
    border-radius: 50%;
  }
</style>
