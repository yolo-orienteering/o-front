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

  useHead({ title: `${article.value.title} · Swiss O Magazine` })
</script>

<template>
  <article v-if="article" class="mag-article">
    <!-- full-bleed hero -->
    <figure class="mag-article__hero">
      <img :src="article.hero" :alt="article.title" />
    </figure>

    <div class="mag-article__inner">
      <p v-if="article.heroCredit" class="mag-article__credit">
        {{ article.heroCredit }}
      </p>

      <!-- header -->
      <header class="mag-article__head">
        <div class="row items-center justify-between no-wrap q-mb-md">
          <magazine-badge />
          <span class="mag-article__kicker">{{ article.kicker }}</span>
        </div>

        <h1 class="mag-article__title">{{ article.title }}</h1>
        <p class="mag-article__lead">{{ article.lead }}</p>

        <p class="mag-article__meta">
          <span class="mag-article__author">{{ article.author }}</span>
          <span class="mag-article__dot">·</span>
          <span>{{ dateLabel }}</span>
        </p>
      </header>

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

      <!-- footer -->
      <footer class="mag-article__foot">
        <span>Swiss O Magazine · 02–26</span>
        <client-only>
          <a
            v-if="article.premium && isSubscribed"
            href="#"
            class="mag-article__reset"
            @click.prevent="reset"
            >Abo-Demo zurücksetzen</a
          >
        </client-only>
      </footer>
    </div>
  </article>
</template>

<style scoped lang="scss">
  // bleed past the q-page padding (8px) so the hero is edge-to-edge
  .mag-article__hero {
    margin: -8px -8px 0;
    width: calc(100% + 16px);

    img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }
  }

  .mag-article__inner {
    max-width: 700px;
    margin: 0 auto;
  }

  .mag-article__credit {
    margin: 0.5rem 0 0;
    font-size: 0.72rem;
    color: #b0b0b0;
    text-align: right;
  }

  .mag-article__head {
    margin: 1.6rem 0 2rem;
  }

  .mag-article__kicker {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--mag-red);
    text-align: right;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-left: 0.5rem;
  }

  .mag-article__title {
    font-size: 2rem;
    line-height: 1.14;
    font-weight: 300;
    color: #1a1a1a;
    margin: 0 0 0.8rem;
    letter-spacing: -0.02em;
  }

  .mag-article__lead {
    font-size: 1.12rem;
    line-height: 1.6;
    font-weight: 400;
    color: #666;
    margin: 0 0 1.2rem;
  }

  .mag-article__meta {
    font-size: 0.8rem;
    color: #a0a0a0;
    margin: 0;
  }

  .mag-article__author {
    font-weight: 500;
    color: #666;
  }

  .mag-article__dot {
    margin: 0 0.4rem;
  }

  .mag-article__foot {
    margin-top: 3rem;
    padding-top: 1.2rem;
    border-top: 1px solid #ececec;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.75rem;
    color: #b0b0b0;
  }

  .mag-article__reset {
    color: var(--mag-red);
    text-decoration: underline;
  }

  @media (min-width: 600px) {
    .mag-article__title {
      font-size: 2.7rem;
    }

    .mag-article__lead {
      font-size: 1.2rem;
    }
  }
</style>
