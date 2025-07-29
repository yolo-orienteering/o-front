<script setup lang="ts">
  const route = useRoute()
</script>

<template>
  <iframe
    :src="route.query.url as string"
    style="border: none; height: 100%; width: 100%; overflow: hidden"
  />
</template>
