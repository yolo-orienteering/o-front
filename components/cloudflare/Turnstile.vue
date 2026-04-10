<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'

  const emit = defineEmits<{
    (e: 'verify', token: string): void
  }>()

  const config = useRuntimeConfig()
  const siteKey = config.public.turnstileSiteKey as string

  const container = ref<HTMLElement | null>(null)
  const widgetId = ref<string | null>(null)
  const loading = ref(true)
  const error = ref(false)
  const token = ref<string | null>(null)

  function renderWidget() {
    if (!container.value || !(window as any).turnstile || widgetId.value) return

    widgetId.value = (window as any).turnstile.render(container.value, {
      sitekey: siteKey,
      callback: (t: string) => {
        token.value = t
        emit('verify', t)
      },
      'error-callback': () => {
        error.value = true
      }
    })

    loading.value = false
  }

  onMounted(() => {
    if ((window as any).turnstile) {
      renderWidget()
      return
    }

    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    )

    if (existing) {
      if ((window as any).turnstile) {
        renderWidget()
      } else {
        existing.addEventListener('load', () => renderWidget())
        setTimeout(() => {
          if (loading.value) error.value = true
        }, 10000)
      }
      return
    }

    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => renderWidget()
    script.onerror = () => {
      loading.value = false
      error.value = true
    }
    document.head.appendChild(script)

    setTimeout(() => {
      if (loading.value) {
        loading.value = false
        error.value = true
      }
    }, 10000)
  })

  onBeforeUnmount(() => {
    if (widgetId.value && (window as any).turnstile) {
      ;(window as any).turnstile.remove(widgetId.value)
      widgetId.value = null
    }
  })

  defineExpose({ token, loading, error })
</script>

<template>
  <div>
    <div v-if="loading" class="row items-center q-gutter-sm">
      <q-spinner color="primary" size="sm" />
      <span class="text-body2 text-grey">Sicherheitscheck wird geladen...</span>
    </div>

    <div
      v-else-if="error"
      class="row items-center q-gutter-sm text-negative text-body2"
    >
      <q-icon name="error_outline" />
      <span>Sicherheitscheck konnte nicht geladen werden.</span>
    </div>

    <div ref="container" />
  </div>
</template>
