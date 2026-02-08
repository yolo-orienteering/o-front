<script setup lang="ts">
  import { readItems } from '@directus/sdk'
  import type { Post, PostMedia } from '~/types/DirectusTypes'

  import solv from '@/assets/img/solv_logo.jpg'

  const { directus } = useApi()
  const { notify } = useQuasar()

  const { data: posts } = await useAsyncData<Post[]>('fetchPosts', () => {
    return directus.request<Post[]>(
      readItems('Post', {
        fields: [
          '*',
          {
            medias: ['*']
          }
        ],
        sort: ['-date_created']
      })
    )
  })

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
  <div class="row q-mt-lg justify-center">
    <div
      v-for="(post, postId) in posts"
      :key="postId"
      class="col-12"
      style="max-width: 600px"
    >
      <a v-if="post.sourceUrl" :href="post.sourceUrl" target="_blank">
        <div class="row">
          <div class="col-12">
            <q-separator v-if="postId > 0" class="q-my-lg" />
          </div>
          <div class="col-12">
            <div class="row items-center justify-between">
              <div class="col-auto">
                <img :src="solv" style="height: 30px" />
              </div>
              <div class="col-auto text-grey">
                {{
                  new Date(post.date_created as string).toLocaleDateString(
                    'de',
                    { dateStyle: 'long' }
                  )
                }}
              </div>
            </div>
          </div>
          <div v-if="post.medias.length" class="col-12 text-center">
            <feed-carousel :medias="post.medias as PostMedia[]" />
          </div>
          <!-- <div v-if="post.mainVideo" class="col-12">
            <iframe
              :src="`https://www.youtube-nocookie.com/embed/${post.mainVideo}?controls=0&fs=0&modestbranding=1&playsinline=1&color=white&iv_load_policy=3`"
              loading="lazy"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              style="width: calc(100% + (2 * 8px)); margin-left: -8px; margin-right: -8px; height: calc(100vw * 9 / 16);"
            />
          </div> -->
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
              size="sm"
              class="q-ml-sm"
              @click.prevent="notifyNotImplemented()"
            />
          </div>
          <div class="col-12">
            <p class="text-subtitle1 q-mb-none">{{ post.title }}</p>
          </div>
          <div v-if="post.lead" class="col-12">
            <p class="text-caption q-mt-xs q-mb-none">{{ post.lead }}</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
