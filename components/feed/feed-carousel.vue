<script lang="ts" setup>
  import type { PostMedia } from '~/types/DirectusTypes'

  const props = defineProps<{
    medias: PostMedia[]
  }>()

  const carousel = ref()
  const slide = ref<number>(1)
</script>

<template>
  <div>
    <q-carousel
      ref="carousel"
      v-model="slide"
      animated
      infinite
      swipeable
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
    <div v-if="medias.length > 1" class="row justify-center q-mt-xs">
      <q-icon
        v-for="(media, index) in medias"
        :key="index"
        name="circle"
        size="8px"
        class="q-mx-xs cursor-pointer"
        :color="slide === index + 1 ? 'primary' : 'grey-4'"
        @click.stop.prevent="slide = index + 1"
      />
    </div>
  </div>
</template>
