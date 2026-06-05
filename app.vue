<script setup lang="ts">
  import oMateLogo from '~/assets/img/seo.webp'

  const route = useRoute()

  const baseUrl = computed<string>(() => {
    return typeof window === 'undefined'
      ? useRequestURL().origin
      : window.location.origin
  })

  useSeoMeta({
    ogTitle: 'O-MATE ORIENTEERING APP',
    ogDescription:
      'Alle wichtigen News aus dem OL. Alle Wettkämpfe und deine Startzeit auf einen Blick. Das Wichtigste aus den Weisungen zusammengefasst. Entdecke o-mate.',
    ogType: 'website',
    ogImage: `${baseUrl.value}${oMateLogo}`,
    ogUrl:
      typeof window === 'undefined'
        ? `${baseUrl.value}${route.fullPath}`
        : window.location.href,
    ogLocale: 'de_CH',
    ogSiteName: 'o-mate orienteering'
  })
</script>

<template>
  <NuxtLayout>
    <NuxtPage class="animate-up" />
  </NuxtLayout>

  <!-- Global gate: blocks the whole app when an outdated native wrapper is detected. -->
  <app-update-gate />
</template>
