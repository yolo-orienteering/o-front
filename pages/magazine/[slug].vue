<script setup lang="ts">
  import { getMagazineArticle } from '~/data/magazine'
  import MagazineBadge from '~/components/magazine/MagazineBadge.vue'
  import MagazineArticleBlock from '~/components/magazine/MagazineArticleBlock.vue'
  import MagazinePaywall from '~/components/magazine/MagazinePaywall.vue'

  const route = useRoute()
  const slug = computed(() => route.params.slug as string)

  const article = computed(() => getMagazineArticle(slug.value))

  if (!article.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Beitrag nicht gefunden',
      fatal: true
    })
  }

  const { isSubscribed, reset } = useMagazineSubscription()
  const { canNativeShare, nativeShare } = useShareLink()

  const dateLabel = computed(() =>
    new Date(article.value!.date).toLocaleDateString('de-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  )

  // Premium articles show only the first `previewBlocks` blocks until unlocked.
  const previewBlocks = computed(() =>
    article.value!.premium
      ? article.value!.blocks.slice(0, article.value!.previewBlocks)
      : article.value!.blocks
  )
  const lockedBlocks = computed(() =>
    article.value!.premium
      ? article.value!.blocks.slice(article.value!.previewBlocks)
      : []
  )

  function share() {
    nativeShare(window.location.href, {
      title: article.value!.title,
      text: article.value!.lead
    })
  }

  useHead({ title: `${article.value.title} · Swiss O Magazine` })
</script>

<template>
  <article v-if="article" class="q-pt-md mag-article">
    <div class="mag-article__inner">
      <!-- header -->
      <header class="mag-article__head">
        <div class="row items-center justify-between q-mb-sm no-wrap">
          <magazine-badge />
          <span class="mag-article__kicker">{{ article.kicker }}</span>
        </div>

        <h1 class="mag-article__title">{{ article.title }}</h1>
        <p class="mag-article__lead">{{ article.lead }}</p>

        <div class="row items-center justify-between q-mt-md">
          <div class="mag-article__meta">
            <span class="mag-article__author">{{ article.author }}</span>
            <span class="mag-article__dot">·</span>
            <span>{{ dateLabel }}</span>
            <span class="mag-article__dot">·</span>
            <span>{{ article.readingMinutes }} Min.</span>
          </div>
          <client-only>
            <q-btn
              v-if="canNativeShare"
              flat
              round
              dense
              icon="mdi-share-outline"
              color="primary"
              @click="share"
            />
          </client-only>
        </div>
      </header>

      <!-- hero -->
      <figure class="mag-article__hero">
        <img :src="article.hero" :alt="article.title" />
        <figcaption
          v-if="article.heroCaption || article.heroCredit"
          class="mag-article__herocap"
        >
          <span v-if="article.heroCaption">{{ article.heroCaption }}</span>
          <span v-if="article.heroCredit" class="mag-article__herocredit">{{
            article.heroCredit
          }}</span>
        </figcaption>
      </figure>

      <!-- body -->
      <div class="mag-article__body">
        <magazine-article-block
          v-for="(block, i) in previewBlocks"
          :key="i"
          :block="block"
        />

        <!-- premium gate: SSR/locked shows the paywall, unlocked shows rest -->
        <template v-if="article.premium">
          <client-only>
            <template v-if="isSubscribed">
              <magazine-article-block
                v-for="(block, i) in lockedBlocks"
                :key="`l-${i}`"
                :block="block"
              />
            </template>
            <magazine-paywall v-else :slug="article.slug" />

            <template #fallback>
              <magazine-paywall :slug="article.slug" />
            </template>
          </client-only>
        </template>
      </div>

      <!-- footer / source attribution -->
      <footer class="mag-article__foot">
        <q-separator class="q-mb-md" />
        <p>
          Dieser Beitrag erschien im <strong>Swiss O Magazine</strong> (Ausgabe
          02–26) und wird im Rahmen einer Kooperation online in o-mate
          veröffentlicht. Text: {{ article.author }}.
        </p>
        <client-only>
          <p v-if="article.premium && isSubscribed" class="mag-article__reset">
            <a href="#" @click.prevent="reset">Abo-Demo zurücksetzen</a>
          </p>
        </client-only>
      </footer>
    </div>
  </article>
</template>

<style scoped lang="scss">
  .mag-article__inner {
    max-width: 720px;
    margin: 0 auto;
  }

  .mag-article__kicker {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--q-secondary);
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 0.5rem;
  }

  .mag-article__title {
    font-size: 2.1rem;
    line-height: 1.15;
    font-weight: 800;
    color: var(--q-primary);
    margin: 0.4rem 0 0.8rem;
    letter-spacing: -0.01em;
  }

  .mag-article__lead {
    font-size: 1.22rem;
    line-height: 1.5;
    font-weight: 500;
    color: #3a3a3a;
    margin: 0;
  }

  .mag-article__meta {
    font-size: 0.85rem;
    color: #8a8a8a;
  }

  .mag-article__author {
    font-weight: 600;
    color: #555;
  }

  .mag-article__dot {
    margin: 0 0.4rem;
  }

  .mag-article__hero {
    margin: 1.4rem 0 1.8rem;

    img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 16px;
    }
  }

  .mag-article__herocap {
    margin-top: 0.5rem;
    font-size: 0.82rem;
    line-height: 1.4;
    color: #6b6b6b;
  }

  .mag-article__herocredit {
    display: block;
    font-style: italic;
    opacity: 0.8;
  }

  .mag-article__foot {
    margin-top: 2.5rem;

    p {
      font-size: 0.85rem;
      line-height: 1.6;
      color: #8a8a8a;
    }
  }

  .mag-article__reset a {
    color: var(--q-secondary);
    text-decoration: underline;
  }

  @media (min-width: 600px) {
    .mag-article__title {
      font-size: 2.6rem;
    }
  }
</style>
