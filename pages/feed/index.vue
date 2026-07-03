<script setup lang="ts">
  import { readItems } from '@directus/sdk'
  import type { Post, PostMedia } from '~/types/DirectusTypes'

  import { magazineArticles } from '~/data/magazine'
  import MagazineTeaser from '~/components/magazine/MagazineTeaser.vue'

  import solv from '@/assets/img/newsSources/solv_logo.jpg'
  import srf from '@/assets/img/newsSources/srf_logo.png'
  import tamedia from '@/assets/img/newsSources/tamedia_logo.png'
  import blick from '@/assets/img/newsSources/blick_logo.png'
  import az from '@/assets/img/newsSources/aargauerzeitung_logo.svg'

  const { directus } = useApi()
  const { notify } = useQuasar()
  const filter = usePostsFilter()

  const { data: posts } = await useAsyncData<Post[]>('fetchPosts', () => {
    const query = filter.composePostsQuery({ initialLoad: true })
    return directus.request<Post[]>(readItems('Post', query))
  })

  async function loadMore() {
    filter.filter.page += 1
    const query = filter.composePostsQuery({})
    const newPosts = await directus.request<Post[]>(readItems('Post', query))

    // no new posts
    if (!newPosts.length) {
      filter.filter.page -= 1
      Notify.create({
        message: 'Keine weiteren News verfügbar'
      })
      return
    }
    posts.value = [...(posts.value || []), ...newPosts]
  }

  function getSourceLogo(post: Post): string {
    if (post.sourceUrl?.includes('swiss-orienteering.ch')) return solv
    if (post.sourceUrl?.includes('srf.ch')) return srf
    if (post.sourceUrl?.includes('tagesanzeiger.ch')) return tamedia
    if (post.sourceUrl?.includes('blick.ch')) return blick
    if (post.sourceUrl?.includes('aargauerzeitung.ch')) return az

    return solv
  }

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
    <!-- Swiss O Magazine — online articles (test) -->
    <div class="col-12" style="max-width: 600px">
      <div class="row items-center justify-between q-mb-md">
        <div class="text-overline text-primary">Aus dem Swiss O Magazine</div>
        <q-chip
          dense
          square
          color="secondary"
          text-color="white"
          class="text-caption"
        >
          Neu
        </q-chip>
      </div>

      <div class="q-gutter-y-md">
        <magazine-teaser
          v-for="mag in magazineArticles"
          :key="mag.slug"
          :article="mag"
        />
      </div>

      <q-separator class="q-my-lg" />
    </div>

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
            <div class="row items-center justify-between q-pb-sm">
              <div class="col-auto flex items-center">
                <!-- forum post -->
                <div v-if="post.type === 'forum-post'">
                  <div class="row items-center">
                    <div class="col-auto">
                      <q-avatar color="grey" text-color="white" size="30px">
                      </q-avatar>
                    </div>
                    <div class="col-auto q-pl-md">
                      <div class="text-subtitle2" style="margin-top: 1px">
                        {{ post.forumUserName || 'Unbekannt' }}
                      </div>
                      <div class="text-caption" style="margin-top: -5px">
                        Swiss Orienteering Forum
                      </div>
                    </div>
                  </div>
                </div>
                <!-- news post -->
                <img
                  v-else
                  :src="getSourceLogo(post)"
                  style="max-height: 30px; max-width: 180px"
                />
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
              size="md"
              class="q-ml-sm"
              style="margin-top: -4px"
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

    <!-- load more -->
    <div class="col-12 text-center q-pb-lg q-pt-xl">
      <q-btn @click="loadMore()"> Mehr News laden </q-btn>
    </div>
  </div>
</template>
