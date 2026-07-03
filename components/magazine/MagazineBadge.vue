<script setup lang="ts">
  withDefaults(defineProps<{ dark?: boolean }>(), { dark: false })
</script>

<template>
  <span class="mag-badge" :class="{ 'mag-badge--dark': dark }">
    <span class="mag-badge__mark">O</span>
    <span class="mag-badge__text">Swiss&nbsp;O&nbsp;Magazine</span>
  </span>
</template>

<style scoped lang="scss">
  .mag-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: var(--q-primary);
  }

  .mag-badge__mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: var(--q-secondary);
    color: #fff;
    font-size: 0.78rem;
    letter-spacing: 0;
  }

  .mag-badge--dark {
    color: #fff;
  }
</style>
