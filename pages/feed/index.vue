<script setup lang="ts">
  import mainImg1 from '@/assets/img/tmp_feed/main1.png'
  import mainImg2 from '@/assets/img/tmp_feed/main2.jpeg'
  import solv from '@/assets/img/tmp_feed/solv_logo.jpg'

  interface Feed {
    date: string
    title: string
    lead?: string
    mainImg?: string
    mainVideo?: string
    html?: string
  }

  const feedEntries: Feed[] = [
    {
      date: '2025-10-19',
      title: 'Simona Aebersold und Daniel Hubmann in der Nacht am schnellsten',
      lead: 'Heute Samstagabend wurde die Schweizer Meisterschaft im Nacht-Orientierungslauf über den Lichtern der Stadt Zürich, im Zürichberg, ausgetragen. Simona Aebersold und Daniel Hubmann heissen die neue Schweizer Meisterin, beziehungsweise der neue Schweizer Meister.',
      mainImg: mainImg1,
    },
    {
      date: '2025-10-13',
      title: 'NOM 2025: Wer gewinnt den Titel der letzten Einzel-Schweizer-Meisterschaft der Saison?',
      lead: 'Mit der Schweizer Meisterschaft im Nacht-OL steht am kommenden Samstag die letzte Einzel-SM der Saison 2025 auf dem Programm. Bei der Elite und den Junior*innen D/H20 geht es auch um den Einzug in den Grand-Slam-Final.',
      mainVideo: 'fOJHmlCh-wk'
    },
    {
      date: '2025-10-06',
      title: 'Bewerbung für das Elitekader 2026 verfügbar',
    },
    {
      date: '2025-10-05',
      title: 'Zwei Mal Silber zum Abschluss',
      lead: 'Beim letzten Wettkampf des Jugend Europa Cups (JEC) in Schottland belegten die Schweizer Teams sowohl bei den Juniorinnen als auch bei den Junioren den zweiten Platz. In der Nationenwertung schloss die Schweiz ebenfalls auf dem zweiten Platz ab. Der Sieg ging an Schweden, Finnland war die drittbeste Nation. ',
      mainImg: mainImg2
    },
  ]
</script>

<template>
  <div class="row q-mt-lg" style="max-width: 600px;">
    <div v-for="(feedEntry, entryId) in feedEntries" :key="entryId" class="col-12">
      <div class="row">
        <div class="col-12">
          <q-separator v-if="entryId > 0" class="q-my-lg" />
        </div>
        <div class="col-12">
          <div class="row items-center justify-between">
            <div class="col-auto">
              <img :src="solv" style="height: 30px;"  />
            </div>
            <div class="col-auto text-grey">
              {{ new Date(feedEntry.date).toLocaleDateString('de', {dateStyle: 'long'}) }}
            </div>
          </div>
        </div>
        <div v-if="feedEntry.mainImg" class="col-12"><img :src="feedEntry.mainImg" style="max-width: calc(100% + (2*8px)); margin-left: -8px; margin-right: -8px;" /></div>
        <div v-if="feedEntry.mainVideo" class="col-12">
          <iframe
            :src="`https://www.youtube-nocookie.com/embed/${feedEntry.mainVideo}?controls=0&fs=0&modestbranding=1&playsinline=1&color=white&iv_load_policy=3`"
            loading="lazy"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            style="width: calc(100% + (2 * 8px)); margin-left: -8px; margin-right: -8px; height: calc(100vw * 9 / 16);"
          />
        </div>
        <div class="col-12 q-py-sm"><q-icon name="favorite_outline" size="sm" /> <q-icon name="chat_bubble_outline" size="sm" class="q-ml-sm" /> <q-icon name="mdi-share-outline" size="sm" class="q-ml-sm" /></div>
        <div class="col-12"><p class="text-subtitle1 q-mb-none">{{ feedEntry.title }}</p></div>
        <div v-if="feedEntry.lead" class="col-12"><p class="text-caption q-mt-xs q-mb-none" >{{ feedEntry.lead }}</p></div>
      </div>
    </div>
  </div>
</template>
