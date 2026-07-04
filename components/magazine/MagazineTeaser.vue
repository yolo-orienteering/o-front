<script setup lang="ts">
  import type { MagazineArticle } from '~/data/magazine'
  import type { PostMedia } from '~/types/DirectusTypes'
  import FeedCarousel from '~/components/feed/feed-carousel.vue'
  import MagazineBadge from './MagazineBadge.vue'

  const props = defineProps<{ article: MagazineArticle }>()
  const { notify } = useQuasar()

  // reuse the exact feed image treatment (edge-to-edge carousel) with one image
  const medias = computed<PostMedia[]>(() => [
    { imageUrl: props.article.hero } as PostMedia
  ])

  const dateLabel = computed(() =>
    new Date(props.article.date).toLocaleDateString('de', { dateStyle: 'long' })
  )

  function notifyNotImplemented() {
    notify({
      message: 'Funktioniert bald.',
      caption:
        'o-mate ist ein Freizeitprojekt. Es gibt also mehr Ideen als Zeit, sie in Programmiercode zu giessen. Lust und Zeit mitzuhelfen? Schreib mir: scheurer.michael@pm.me Oder schauf auf Github vorbei.',
      color: 'accent',
      closeBtn: true
    })
  }
</script>

<template>
  <nuxt-link :to="`/magazine/${article.slug}`">
    <div class="row">
      <div class="col-12">
        <div class="row items-center justify-between q-pb-sm">
          <div class="col-auto flex items-center">
            <magazine-badge />
          </div>
          <div class="col-auto text-grey">{{ dateLabel }}</div>
        </div>
      </div>

      <div class="col-12 text-center">
        <feed-carousel :medias="medias" />
      </div>

      <div class="col-12 q-py-sm">
        <q-icon
          name="favorite_outline"
          size="sm"
          @click.prevent="notifyNotImplemented()"
        />
        <q-icon
          name="chat_bubble_outline"
          size="sm"
          class="q-ml-sm"
          @click.prevent="notifyNotImplemented()"
        />
        <q-icon
          name="mdi-share-outline"
          size="md"
          class="q-ml-sm"
          style="margin-top: -4px"
          @click.prevent="notifyNotImplemented()"
        />
      </div>

      <div class="col-12">
        <p class="text-subtitle1 q-mb-none">
          <q-icon
            v-if="article.premium"
            name="lock"
            size="16px"
            class="q-mr-xs"
            style="margin-top: -2px"
          />{{ article.title }}
        </p>
      </div>
      <div class="col-12">
        <p class="text-caption q-mt-xs q-mb-none">{{ article.lead }}</p>
      </div>
    </div>
  </nuxt-link>
</template>
