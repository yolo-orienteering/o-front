<script lang="ts" setup>
  import type {
    Game,
    GameAuthor,
    GameCategory,
    GameGameCategory,
    GameVariant,
  } from '~/types/DirectusTypes'

  const api = useApi()

  defineProps<{
    game: Game
  }>()

  function composeGameLink(variant: GameVariant): string {
    if (variant.openOutsideApp) {
      return variant.externalUrl!
    }
    return `/games/external?url=${variant.externalUrl}`
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

    <q-card-section class="q-py-none q-px-sm">
      <q-chip
        v-for="category in (game.categories.map(category => (category as GameGameCategory).GameCategory_id) as GameCategory[])"
        :key="category.id"
        :icon="category.icon"
        size="sm"
        >{{ category.name }}</q-chip
      >
    </q-card-section>

    <q-card-actions class="justify-between">
      <nuxt-link :to="(game.author as GameAuthor).url!" target="_blank">
        <q-btn flat size="x-small"
          >By {{ (game.author as GameAuthor).name }}</q-btn
        >
      </nuxt-link>

      <div class="col-6 text-right">
        <q-btn-dropdown
          v-if="game.variants.length > 1"
          label="Spielen"
          color="primary"
          icon="play_arrow"
          :outline="false"
        >
          <q-list>
            <div
              v-for="variant in (game.variants as GameVariant[])"
              :key="variant.id"
            >
              <q-item>
                <nuxt-link
                  :target="variant.openOutsideApp ? '_blank' : ''"
                  :to="composeGameLink(variant)"
                >
                  <q-item-section>
                    <q-item-label>{{ variant.title }}</q-item-label>
                  </q-item-section>
                </nuxt-link>
              </q-item>
            </div>
          </q-list>
        </q-btn-dropdown>

        <nuxt-link
          v-else-if="(game.variants as GameVariant[]).length === 1"
          :to="composeGameLink(game.variants[0] as GameVariant)"
          :target="(game.variants[0] as GameVariant).openOutsideApp ? '_blank' : ''"
          class="col-6"
        >
          <q-btn class="full-width" :outline="false" color="primary">
            <q-icon
              :name="(game.variants[0] as GameVariant).openOutsideApp ? 'open_in_new' : 'play_arrow'"
              class="q-mr-sm"
            />
            {{
              (game.variants[0] as GameVariant).openOutsideApp
                ? 'Öffnen'
                : 'Spielen'
            }}
          </q-btn>
        </nuxt-link>
      </div>
    </q-card-actions>
  </q-card>
</template>
