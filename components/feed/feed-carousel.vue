<script lang="ts" setup>
  import type { PostMedia } from '~/types/DirectusTypes'

  const props = defineProps<{
    medias: PostMedia[]
  }>()

  const slide = ref<number>(1)
  const carousel = ref()
</script>

<template>
  <q-carousel
    ref="carousel"
    v-model="slide"
    animated
    infinite
    swipeable
    navigation
    style="margin-left: -8px; margin-right: -8px"
  >
    <template v-slot:control>
      <q-carousel-control
        v-if="medias.length > 1"
        position="left"
        class="content-center"
      >
        <q-btn
          round
          dense
          flat
          color="white"
          icon="chevron_left"
          size="30px"
          style="margin-left: -24px"
          @click.stop.prevent="carousel?.previous()"
        />
      </q-carousel-control>
      <q-carousel-control
        v-if="medias.length > 1"
        position="right"
        class="content-center"
      >
        <q-btn
          round
          dense
          flat
          color="white"
          icon="chevron_right"
          size="30px"
          style="margin-right: -24px"
          @click.stop.prevent="carousel?.next()"
        />
      </q-carousel-control>
    </template>
    <q-carousel-slide
      v-for="(media, mediaIndex) in medias"
      :key="mediaIndex"
      :name="mediaIndex + 1"
      :img-src="media.imageUrl as string"
      class="q-ma-none q-pa-none"
    />
  </q-carousel>
</template>
