<script lang="ts" setup>
  const route = useRoute()

  const props = defineProps<{
    reveal: boolean
  }>()

  const hideHeader = computed<boolean>(() =>
    route.path.includes('/games/external')
  )
</script>

<template>
  <q-header
    v-show="!hideHeader"
    class="text-primary bg-white"
    elevated
    :reveal="props.reveal"
    :reveal-offset="5"
  >
    <div class="row items-center q-ma-sm">
      <div class="col-auto">
        <img src="@/assets/img/o-mate-logo.webp" class="header-logo" />
      </div>
    </div>
  </q-header>
</template>

<style lang="scss">
  @import 'quasar/src/css/variables.sass';

  .header-logo {
    height: 45px;
    width: auto;
    display: block;
    margin: auto;

    @media (min-width: $breakpoint-xs-max) {
      height: 55px;
    }

    @media (min-width: $breakpoint-sm-max) {
      height: 65px;
    }
  }

  .title {
    margin: 0;
    font-weight: 300;
    font-size: 48px;
    line-height: 0.95;
  }

  .claim {
    margin-left: 45px;
    margin-bottom: 0;
    font-size: 15px;
    color: var(--q-secondary);
    font-weight: 400;
  }
</style>
