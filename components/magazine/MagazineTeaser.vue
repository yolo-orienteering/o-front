<script setup lang="ts">
  import type { MagazineArticle } from '~/data/magazine'
  import MagazineBadge from './MagazineBadge.vue'

  const props = defineProps<{ article: MagazineArticle }>()

  const dateLabel = computed(() =>
    new Date(props.article.date).toLocaleDateString('de-CH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  )
</script>

<template>
  <nuxt-link :to="`/magazine/${article.slug}`" class="mag-teaser">
    <q-card flat bordered class="mag-teaser__card">
      <div class="mag-teaser__imgwrap">
        <q-img
          :src="article.hero"
          :ratio="16 / 9"
          fit="cover"
          no-spinner
          class="mag-teaser__img"
        />
        <q-chip
          v-if="article.premium"
          dense
          square
          color="primary"
          text-color="white"
          icon="lock"
          class="mag-teaser__lock"
        >
          Abo
        </q-chip>
      </div>

      <q-card-section class="q-pb-sm">
        <div class="row items-center justify-between q-mb-xs no-wrap">
          <magazine-badge />
          <span class="mag-teaser__kicker">{{ article.kicker }}</span>
        </div>

        <p class="mag-teaser__title">{{ article.title }}</p>
        <p class="mag-teaser__lead">{{ article.lead }}</p>

        <div class="mag-teaser__meta">
          <span>{{ article.author }}</span>
          <span class="mag-teaser__dot">·</span>
          <span>{{ dateLabel }}</span>
          <span class="mag-teaser__dot">·</span>
          <span>{{ article.readingMinutes }} Min. Lesezeit</span>
        </div>
      </q-card-section>
    </q-card>
  </nuxt-link>
</template>

<style scoped lang="scss">
  .mag-teaser {
    display: block;
    color: unset;
  }

  .mag-teaser__card {
    border-radius: 18px;
    overflow: hidden;
    transition:
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  // subtle lift on hover (desktop pointers only)
  @media (hover: hover) {
    .mag-teaser:hover .mag-teaser__card {
      box-shadow: 0 10px 26px rgba(38, 70, 83, 0.16);
      transform: translateY(-2px);
    }
  }

  .mag-teaser__imgwrap {
    position: relative;
  }

  .mag-teaser__lock {
    position: absolute;
    top: 10px;
    left: 10px;
    border-radius: 8px;
    font-weight: 600;
    opacity: 0.95;
  }

  .mag-teaser__kicker {
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

  .mag-teaser__title {
    font-size: 1.3rem;
    line-height: 1.25;
    font-weight: 700;
    color: var(--q-primary);
    margin: 0.2rem 0 0.45rem;
  }

  .mag-teaser__lead {
    font-size: 0.96rem;
    line-height: 1.55;
    color: #4a4a4a;
    margin: 0 0 0.8rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mag-teaser__meta {
    font-size: 0.8rem;
    color: #8a8a8a;
  }

  .mag-teaser__dot {
    margin: 0 0.4rem;
  }
</style>
