<script lang="ts" setup>
  import type { Game, GameAuthor } from '~/types/DirectusTypes'

  const api = useApi()

  defineProps<{
    game: Game
  }>()

  const iconMap: Record<string, string> = {
    desktop: 'desktop_windows',
    retro: 'atm',
    simulator: 'videogame_asset',
    route: 'alt_route',
    symbols: 'emoji_symbols',
  }

  function composeGameLink(game: Game): string {
    if (game.openOutsideApp) {
      return game.externalUrl!
    }
    return `/games/external?url=${game.externalUrl}`
  }
</script>

<template>
  <q-card bordered flat>
    <q-img :src="api.getImgUrl(game.image)" :ratio="16 / 9" />

    <q-card-section>
      <div class="text-h5">{{ game.title }}</div>
      <div class="text-subtitle2">{{ game.subtitle }}</div>
    </q-card-section>

    <q-card-section class="text-caption q-pt-none">
      {{ game.description }}
    </q-card-section>

    <q-card-section class="q-py-none">
      <q-chip
        v-for="category in game.categories"
        :key="category"
        :icon="iconMap[category]"
        size="sm"
        >{{ category }}</q-chip
      >
    </q-card-section>

    <q-card-actions class="justify-between">
      <nuxt-link :to="(game.author as GameAuthor).url!" target="_blank">
        <q-btn flat size="x-small"
          >By {{ (game.author as GameAuthor).name }}</q-btn
        >
      </nuxt-link>
      <nuxt-link
        :to="composeGameLink(game)"
        :target="game.openOutsideApp ? '_blank' : ''"
        class="col-6"
      >
        <q-btn class="full-width" :outline="false" color="primary">
          <q-icon
            :name="game.openOutsideApp ? 'open_in_new' : 'play_arrow'"
            class="q-mr-sm"
          />
          {{ game.openOutsideApp ? 'Öffnen' : 'Spielen' }}
        </q-btn>
      </nuxt-link>
    </q-card-actions>
  </q-card>
</template>

<style></style>
