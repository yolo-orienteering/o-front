import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { readItems } from '@directus/sdk'
import { useApi } from './useApi'
import { useSyncCenter } from './syncCenter'
import type { Post } from '@/types/DirectusTypes'

/**
 * Tracks whether the feed has posts the user hasn't seen yet, by comparing the
 * newest published post's date_created against the locally stored "last seen"
 * marker (see syncCenter.lastSeenPostDate). Drives the red dot on the feed menu
 * entry. There is no auth, so read-state lives purely on the device.
 */
export const useUnreadPosts = defineStore('useUnreadPosts', () => {
  const { directus } = useApi()
  const syncCenter = useSyncCenter()

  // date_created of the newest published post (remote)
  const latestPostDate = ref<string | null>(null)

  // fetch once on the client as soon as the store is used (the menu is
  // client-only, so this never runs during SSR)
  if (typeof window !== 'undefined') {
    fetchLatestPostDate()
  }

  async function fetchLatestPostDate(): Promise<void> {
    try {
      const posts = await directus.request<Post[]>(
        readItems('Post', {
          fields: ['date_created'],
          filter: { status: { _eq: 'published' } },
          sort: ['-date_created'],
          limit: 1
        })
      )
      latestPostDate.value = posts[0]?.date_created ?? null
    } catch (e) {
      console.error(e)
    }
  }

  const hasUnreadPosts = computed<boolean>(() => {
    if (!latestPostDate.value) {
      return false
    }
    const lastSeen = syncCenter.lastSeenPostDate
    if (!lastSeen) {
      return true
    }
    return (
      new Date(latestPostDate.value).getTime() > new Date(lastSeen).getTime()
    )
  })

  return {
    hasUnreadPosts,
    fetchLatestPostDate
  }
})
