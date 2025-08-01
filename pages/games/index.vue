<script setup lang="ts">
  import { readItems, type Query } from '@directus/sdk'
  import GameCard from '~/components/games/GameCard.vue'
  import type { Game, Schema } from '~/types/DirectusTypes'

  type GameQuery = Query<Schema, Game>

  const api = useApi()
  const { teleportElement } = useTeleport('teleport-to-filter-menu')

  const filter = ref<{
    inApp?: boolean
    categories?: Game['categories']
    author?: string
  }>({})

  const gameQuery = computed<GameQuery>(() => {
    const composedQuery = {
      fields: [
        '*',
        {
          author: ['*'],
          image: ['*'],
        },
      ],
      filter: {
        status: {
          _eq: 'published',
        },
      },
      limit: -1,
    } as GameQuery

    if (filter.value.inApp) {
      composedQuery.filter = {
        ...composedQuery.filter,
        openOutsideApp: {
          _eq: true,
        },
      }
    }
    return composedQuery
  })

  const { data: games, error } = await useLazyAsyncData(
    'games',
    () => {
      return api.directus.request(readItems('Game', gameQuery.value))
    },
    {
      watch: [gameQuery],
    }
  )
</script>

<template>
  <div class="row">
    <teleport v-if="teleportElement" :to="teleportElement">
      <filter-container filter-name="Games filtern">
        <div class="col-auto">
          <q-chip
            :outline="!filter.inApp"
            :text-color="filter.inApp ? 'white' : ''"
            color="primary"
            icon="mobile_friendly"
            icon-selected="mobile_friendly"
            :selected="filter.inApp"
            clickable
            @click="filter.inApp = filter.inApp ? undefined : true"
            >In-App</q-chip
          >
        </div>
      </filter-container>
    </teleport>

    <div v-if="error">{{ JSON.stringify(error) }}</div>
    <div
      v-for="(game, gameIndex) in games"
      :key="gameIndex"
      class="col-12 col-md-4 q-py-md q-pa-md-sm"
    >
      <game-card :game="game as Game" />
    </div>
  </div>
</template>
