<script lang="ts" setup>
  import type { PostMedia } from '~/types/DirectusTypes'

  const props = defineProps<{
    medias: PostMedia[]
  }>()

  const slide = ref<number>(1)
</script>

<template>
  <q-carousel
    v-model="slide"
    animated
    arrows
    infinite
    swipeable
    navigation
    style="margin-left: -8px; margin-right: -8px"
  >
    <q-carousel-slide
      v-for="(media, mediaIndex) in medias"
      :key="mediaIndex"
      :name="mediaIndex + 1"
      :img-src="media.imageUrl as string"
      class="q-ma-none q-pa-none"
    />
  </q-carousel>
</template>
