<script setup lang="ts">
  import { Notify } from 'quasar'
  import { copyToClipboard } from '@/utils/clipboard'

  interface SocialMedia {
    name: string
    color: string
    href: string
    icon: string
    action?: 'copy'
  }

  const socialMediaPlattforms: SocialMedia[] = [
    {
      name: 'Link kopieren',
      color: '',
      href: window.location.href,
      icon: 'mdi-content-copy',
      action: 'copy'
    },
    {
      name: 'Whatsapp',
      color: '#25D366',
      href: `https://wa.me/?text=${window.location.href}`,
      icon: 'mdi-whatsapp'
    },
    {
      name: 'Linkedin',
      color: '#0A66C2',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
      icon: 'mdi-linkedin'
    },
    {
      name: 'X',
      color: '#1DA1F2',
      href: `https://x.com/share?url=${window.location.href}`,
      icon: 'mdi-twitter'
    },
    {
      name: 'E-Mail',
      color: 'black',
      href: `mailto:?body=${window.location.href}`,
      icon: 'mail'
    },
    {
      name: 'Facebook',
      color: '#4267B2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
      icon: 'mdi-facebook'
    }
  ]

  async function copyUrlToClipboard(url: string) {
    try {
      await copyToClipboard(url)
      Notify.create({
        message: 'Link in Zwischenablage kopiert!',
        type: 'positive'
      })
    } catch {
      Notify.create({
        message: 'Kopieren fehlgeschlagen',
        type: 'negative'
      })
    }
  }

  // Signal has no share-URL scheme; the Web Share API (when available) is the way to reach
  // it — it opens the OS share sheet where Signal/Telegram/… appear. See useShareLink.
  const { canNativeShare, nativeShare } = useShareLink()
  function shareNative() {
    nativeShare(window.location.href, { title: 'o-mate' })
  }
</script>

<template>
  <q-btn dense round>
    <q-icon name="share">
      <q-menu anchor="bottom left" :offset="[4, 8]">
        <q-list>
          <q-item
            v-if="canNativeShare"
            v-close-popup
            clickable
            @click="shareNative()"
          >
            <q-item-section avatar>
              <q-icon name="mdi-share-variant" color="light-blue-7" />
            </q-item-section>
            <q-item-section>Signal &amp; mehr</q-item-section>
          </q-item>
          <nuxt-link
            v-for="plattform in socialMediaPlattforms"
            :key="plattform.name"
            :to="plattform.action !== 'copy' ? plattform.href : undefined"
            :target="plattform.action !== 'copy' ? '_blank' : '_self'"
          >
            <q-item
              v-close-popup
              clickable
              @click="
                plattform.action === 'copy'
                  ? copyUrlToClipboard(plattform.href)
                  : ''
              "
            >
              <q-item-section avatar>
                <q-icon :name="plattform.icon" :color="plattform.color" />
              </q-item-section>
              <q-item-section>{{ plattform.name }}</q-item-section>
            </q-item>
          </nuxt-link>
        </q-list>
      </q-menu>
    </q-icon>
  </q-btn>
</template>
