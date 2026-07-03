<script setup lang="ts">
  import type { MagazineBlock } from '~/data/magazine'

  defineProps<{ block: MagazineBlock }>()
</script>

<template>
  <!-- paragraph -->
  <p
    v-if="block.kind === 'paragraph'"
    class="mag-paragraph"
    :class="{ 'mag-dropcap': block.dropcap }"
    v-html="block.html"
  />

  <!-- heading (optionally numbered) -->
  <h2 v-else-if="block.kind === 'heading'" class="mag-heading">
    <span v-if="block.num" class="mag-heading__num">{{ block.num }}</span>
    {{ block.text }}
  </h2>

  <!-- figure -->
  <figure v-else-if="block.kind === 'figure'" class="mag-figure">
    <q-img :src="block.src" no-spinner fit="cover" class="mag-figure__img" />
    <figcaption v-if="block.caption || block.credit" class="mag-figure__cap">
      <span v-if="block.caption">{{ block.caption }}</span>
      <span v-if="block.credit" class="mag-figure__credit">{{
        block.credit
      }}</span>
    </figcaption>
  </figure>

  <!-- pull quote -->
  <blockquote v-else-if="block.kind === 'pullquote'" class="mag-quote">
    {{ block.text }}
  </blockquote>

  <!-- list (training ideas) -->
  <div v-else-if="block.kind === 'list'" class="mag-list">
    <p v-if="block.title" class="mag-list__title">{{ block.title }}</p>
    <ul>
      <li v-for="(item, i) in block.items" :key="i">
        <strong v-if="item.label">{{ item.label }}: </strong>{{ item.text }}
      </li>
    </ul>
  </div>

  <!-- highlighted info box -->
  <aside v-else-if="block.kind === 'infobox'" class="mag-box">
    <p class="mag-box__title">{{ block.title }}</p>
    <p v-if="block.intro" class="mag-box__intro">{{ block.intro }}</p>
    <ul v-if="block.items?.length" class="mag-box__list">
      <li v-for="(item, i) in block.items" :key="i">
        <strong v-if="item.label">{{ item.label }}: </strong>{{ item.text }}
      </li>
    </ul>
  </aside>

  <!-- interview question + answer -->
  <div v-else-if="block.kind === 'qa'" class="mag-qa">
    <p class="mag-qa__q">{{ block.q }}</p>
    <p class="mag-qa__a">{{ block.a }}</p>
  </div>

  <!-- expert / author card -->
  <aside v-else-if="block.kind === 'expert'" class="mag-expert">
    <q-avatar size="72px">
      <img :src="block.image" :alt="block.name" />
    </q-avatar>
    <div>
      <p class="mag-expert__name">{{ block.name }}</p>
      <p class="mag-expert__text">{{ block.html }}</p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
  .mag-paragraph {
    font-size: 1.075rem;
    line-height: 1.72;
    color: #2b2b2b;
    margin: 0 0 1.15rem;
  }

  // oversized initial letter for the opening paragraph
  .mag-dropcap::first-letter {
    float: left;
    font-size: 3.4rem;
    line-height: 0.82;
    font-weight: 700;
    padding: 0.1rem 0.6rem 0 0;
    color: var(--q-primary);
  }

  .mag-heading {
    font-size: 1.45rem;
    line-height: 1.25;
    font-weight: 700;
    color: var(--q-primary);
    margin: 2.2rem 0 1rem;
    display: flex;
    align-items: center;
  }

  .mag-heading__num {
    flex: 0 0 auto;
    width: 2rem;
    height: 2rem;
    margin-right: 0.7rem;
    border-radius: 50%;
    background: var(--q-secondary);
    color: #fff;
    font-size: 1.05rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .mag-figure {
    margin: 1.8rem 0;
  }

  .mag-figure__img {
    width: 100%;
    border-radius: 14px;
  }

  .mag-figure__cap {
    margin-top: 0.5rem;
    font-size: 0.82rem;
    line-height: 1.4;
    color: #6b6b6b;
  }

  .mag-figure__credit {
    display: block;
    font-style: italic;
    opacity: 0.8;
  }

  .mag-quote {
    margin: 1.8rem 0;
    padding: 0.2rem 0 0.2rem 1.25rem;
    border-left: 4px solid var(--q-secondary);
    font-family: Georgia, 'Times New Roman', serif;
    font-style: italic;
    font-size: 1.5rem;
    line-height: 1.4;
    color: var(--q-primary);
  }

  .mag-list {
    margin: 0 0 1.3rem;

    ul {
      margin: 0;
      padding-left: 1.2rem;
    }
    li {
      font-size: 1.04rem;
      line-height: 1.6;
      color: #2b2b2b;
      margin-bottom: 0.55rem;
    }
  }

  .mag-list__title {
    font-weight: 700;
    color: var(--q-primary);
    margin: 0 0 0.6rem;
  }

  .mag-box {
    margin: 2rem 0;
    padding: 1.3rem 1.4rem;
    border-radius: 16px;
    background: rgba(38, 70, 83, 0.06);
    border: 1px solid rgba(38, 70, 83, 0.12);
  }

  .mag-box__title {
    font-weight: 700;
    color: var(--q-primary);
    font-size: 1.12rem;
    margin: 0 0 0.6rem;
  }

  .mag-box__intro {
    font-size: 0.98rem;
    line-height: 1.6;
    color: #3a3a3a;
    margin: 0 0 0.7rem;
  }

  .mag-box__list {
    margin: 0;
    padding-left: 1.1rem;

    li {
      font-size: 0.98rem;
      line-height: 1.55;
      color: #3a3a3a;
      margin-bottom: 0.45rem;
    }
  }

  .mag-qa {
    margin: 0 0 1.5rem;
  }

  .mag-qa__q {
    font-weight: 700;
    font-size: 1.12rem;
    line-height: 1.4;
    color: var(--q-primary);
    margin: 0 0 0.5rem;
  }

  .mag-qa__a {
    font-size: 1.06rem;
    line-height: 1.7;
    color: #2b2b2b;
    margin: 0;
  }

  .mag-expert {
    margin: 2rem 0 0.5rem;
    padding: 1.2rem 1.3rem;
    border-radius: 16px;
    background: rgba(38, 70, 83, 0.06);
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .mag-expert__name {
    font-weight: 700;
    color: var(--q-primary);
    margin: 0 0 0.25rem;
  }

  .mag-expert__text {
    font-size: 0.92rem;
    line-height: 1.5;
    color: #4a4a4a;
    margin: 0;
  }
</style>
