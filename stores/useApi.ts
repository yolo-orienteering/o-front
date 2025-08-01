import { defineStore } from 'pinia'
import { createDirectus, rest, type DirectusFile } from '@directus/sdk'
import type { Schema } from '~/types/DirectusTypes'

export const useApi = defineStore('useApi', () => {
  const config = useRuntimeConfig()
  const API_URL = config.public.apiUrl as string

  const directus = createDirectus<Schema>(API_URL).with(rest())

  function getImgUrl(img: DirectusFile | null | undefined | string): string {
    if (!img || typeof img === 'string') {
      throw new Error('Image is not of type Directus File!')
    }
    if (!img.id) {
      throw new Error('image id is not available.')
    }
    return `${API_URL}/assets/${img.id}`
  }

  return {
    directus,
    getImgUrl,
  }
})
