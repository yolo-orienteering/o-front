<script setup lang="ts">
  import { readItems } from '@directus/sdk'

  const api = useApi()

  const { data: games, error } = await useAsyncData('games', () => {
    return api.directus.request(
      readItems('Game', {
        filter: {
          status: {
            _eq: 'published',
          },
        },
        fields: ['*', { image: ['*'] }],
        limit: -1,
      })
    )
  })
</script>

<template>
  <div class="row">
    {{ error }}
    <div
      v-for="(game, gameIndex) in games"
      :key="gameIndex"
      class="col-12 col-md-4 q-py-sm q-pa-md-sm"
    >
      <q-card bordered flat>
        <q-img :src="api.getImgUrl(game.image)" :ratio="16 / 9" />

        <q-card-section>
          <div class="text-h5">{{ game.title }}</div>
          <div class="text-subtitle2">{{ game.subtitle }}</div>
        </q-card-section>

        <q-card-section class="text-caption">
          {{ game.description }}
        </q-card-section>

        <q-separator dark />

        <q-card-actions class="justify-between">
          <nuxt-link :to="game.creditUrl as string" target="_blank">
            <q-btn flat size="x-small">By {{ game.creditName }}</q-btn>
          </nuxt-link>
          <nuxt-link
            :to="`/games/external?url=${game.externalUrl}`"
            class="col-6"
          >
            <q-btn class="full-width">
              <q-icon name="play_arrow" class="q-pr-xs" /> Spielen</q-btn
            >
          </nuxt-link>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
