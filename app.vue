<script setup lang="ts">
  import oMateLogo from '~/assets/img/o-mate-logo.webp'

  const route = useRoute()

  const baseUrl = computed<string>(() => {
    return typeof window === 'undefined'
      ? useRequestURL().origin
      : window.location.origin
  })

  useSeoMeta({
    ogTitle: 'o-mate',
    ogDescription: 'Die o-mate App bringt dich an den Start.',
    ogImage: `${baseUrl.value}${oMateLogo}`,
    ogUrl:
      typeof window === 'undefined'
        ? `${baseUrl.value}${route.fullPath}`
        : window.location.href,
  })
</script>

<template>
  <NuxtLayout>
    <NuxtPage class="animate-up" />
  </NuxtLayout>
</template>
