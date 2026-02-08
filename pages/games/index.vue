<script setup lang="ts">
  import { readItems, type Query } from '@directus/sdk'
  import GameCard from '~/components/games/GameCard.vue'
  import type {
    Game,
    GameAuthor,
    GameCategory,
    Schema
  } from '~/types/DirectusTypes'

  type GameQuery = Query<Schema, Game>

  const api = useApi()
  const { teleportElement } = useTeleport('teleport-to-filter-menu')

  const filter = ref<{
    inApp?: boolean
    categories?: GameCategory[]
    author?: GameAuthor
  }>({})

  const gameQuery = computed<GameQuery>(() => {
    const composedQuery = {
      fields: [
        '*',
        {
          author: ['*'],
          image: ['*'],
          categories: [
            {
              GameCategory_id: ['*']
            }
          ],
          variants: ['*']
        }
      ],
      filter: {
        status: {
          _eq: 'published'
        }
      },
      deep: {
        categories: {
          _sort: ['sort']
        }
      },
      sort: ['-date_created'],
      limit: -1
    } as GameQuery

    // game author
    if (filter.value.author) {
      composedQuery.filter = {
        ...composedQuery.filter,
        author: {
          _eq: filter.value.author.id
        }
      }
    }

    // game categories
    if (filter.value.categories?.length) {
      composedQuery.filter = {
        ...composedQuery.filter,
        categories: {
          GameCategory_id: {
            _in: filter.value.categories.map((category) => category.id)
          }
        }
      }
    }

    return composedQuery
  })

  const { data: games, error } = await useAsyncData(
    'games',
    () => {
      return api.directus.request<Game[]>(readItems('Game', gameQuery.value))
    },
    {
      watch: [gameQuery]
    }
  )

  const { data: options, pending } = await useAsyncData(
    'game-authors',
    () =>
      Promise.all([
        api.directus.request<GameAuthor>(
          readItems('GameAuthor', { fields: ['*'] })
        ),
        api.directus.request<GameCategory>(
          readItems('GameCategory', { fields: ['*'] })
        )
      ]),
    {
      server: false,
      lazy: true
    }
  )
</script>

<template>
  <div class="row">
    <teleport v-if="teleportElement" :to="teleportElement">
      <filter-container filter-name="Games filtern">
        <div class="col-6 col-md-12 q-pr-xs">
          <q-select
            v-model="filter.categories"
            :options="options?.[1] || []"
            option-label="name"
            multiple
            clearable
            outlined
            dense
            rounded
            color="primary"
            label="Kategorien"
            :loading="pending"
          >
            <template #option="{ opt, selected, toggleOption }">
              <q-item
                clickable
                :class="selected ? 'bg-primary text-white' : ''"
                @click="toggleOption(opt)"
              >
                <q-item-section avatar>
                  <q-icon :name="opt.icon" />
                </q-item-section>
                <q-item-section>
                  {{ opt.name }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div class="col-6 col-md-12 q-pr-xs">
          <q-select
            v-model="filter.author"
            :options="options?.[0] || []"
            option-label="name"
            clearable
            outlined
            dense
            rounded
            color="primary"
            label="Autor"
            :loading="pending"
          />
        </div>
      </filter-container>
    </teleport>

    <div v-if="error">{{ JSON.stringify(error) }}</div>
    <div
      v-for="(game, gameIndex) in games || []"
      :key="gameIndex"
      class="col-12 col-md-6 q-py-md q-pa-md-sm"
    >
      <game-card :game="game as Game" />
    </div>
    <div class="col-12 col-md-6">
      <q-card bordered flat>
        <q-card-section>
          <div class="text-h5 text-center">Spiel fehlt? Jetzt hinzufügen.</div>
        </q-card-section>

        <q-card-section class="text-center">
          <q-btn
            icon="add"
            fab
            color="primary"
            href="mailto:scheurer.michael@pm.me"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>
