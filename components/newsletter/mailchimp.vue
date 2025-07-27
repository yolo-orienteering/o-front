<script lang="ts" setup>
  import { mailchimpHtmlCode } from '@/components/newsletter/mailchimpHtmlCode'
  import { ref } from 'vue'
  import { useNewsletter } from '@/composables/useNewsletter'

  const subscribed = ref<boolean>(false)
  const { rememberSubscription } = useNewsletter()

  function handleSubscription() {
    subscribed.value = true
    rememberSubscription()
  }
</script>

<template>
  <div class="row">
    <div v-show="subscribed" class="col-12">
      <h6>Cool. Du bist dabei!</h6>
    </div>

    <div v-show="!subscribed" class="col-12">
      <p class="text-h6">Orientiert bleiben!</p>
      <p class="text-body1">
        Wir informieren dich sporadisch, wenn o-mate neue Funktionen bekommt.
        Oder es interessante Neuigkeiten aus der OL-Welt gibt.
      </p>
      <div
        ref="mailchimpForm"
        @submit.capture="handleSubscription()"
        v-html="mailchimpHtmlCode"
      />
    </div>
  </div>
</template>
