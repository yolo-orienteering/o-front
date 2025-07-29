<script setup lang="ts">
  import photoMemoryImage from '@/assets/img/games/external/benBrown/photoMemory.png'

  interface GameDescription {
    title: string
    subtitle: string
    description: string
    img: string
    externalUrl: string
    credits: GameCredit
  }

  interface GameCredit {
    name: string
    url: string
  }

  const games: GameDescription[] = [
    {
      title: 'Photo Memory O',
      subtitle: 'Remember the Map!',
      description: `Du siehst eine Karte mit einem Kontrollpunkt und der Laufrichtung. Erinnere dich auf der nächsten Seite,
      welches der vier Bilder die Karte zeigt.`,
      img: photoMemoryImage,
      externalUrl:
        'https://orienteering-games.vercel.app/game/photomemory/play',
      credits: {
        name: 'Ben Brown',
        url: 'https://benbrown.dev/',
      },
    },
  ]
</script>

<template>
  <div class="row">
    <div v-for="(game, gameIndex) in games" :key="gameIndex" class="col-12">
      <q-card bordered flat>
        <q-img :src="game.img" :ratio="1" />

        <q-card-section>
          <div class="text-h6">{{ game.title }}</div>
          <div class="text-subtitle2">{{ game.subtitle }}</div>
        </q-card-section>

        <q-card-section>
          {{ game.description }}
        </q-card-section>

        <q-separator dark />

        <q-card-actions class="justify-between">
          <nuxt-link :to="game.credits.url" target="_blank">
            <q-btn flat size="x-small">Credits {{ game.credits.name }}</q-btn>
          </nuxt-link>
          <nuxt-link
            :to="`/games/external?url=${game.externalUrl}`"
            class="col-6"
          >
            <q-btn class="full-width"
              ><q-icon name="play_arrow" class="q-pr-xs" /> Spielen</q-btn
            >
          </nuxt-link>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>
