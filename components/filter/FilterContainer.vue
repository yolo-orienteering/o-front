<script setup lang="ts">
  const isDesktop = useIsDesktop()

  defineProps<{ filterName: string }>()
</script>

<template>
  <div
    class="row bg-white q-py-sm q-px-sm q-px-md-none"
    :class="
      isDesktop ? 'q-gutter-xs' : 'no-wrap items-center border-bottom-primary'
    "
    :style="isDesktop ? {} : { overflowX: 'scroll' }"
  >
    <div class="col-12 desktop-only">
      <p class="text-h6 q-mt-sm q-mb-xs q-pl-xs text-primary">
        <q-icon name="filter_alt" class="q-mb-xs q-mr-xs" />{{ filterName }}
      </p>
    </div>

    <slot />
  </div>
</template>
