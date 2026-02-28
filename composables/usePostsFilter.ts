import type { Query } from '@directus/sdk'
import type { Schema, Post } from '@/types/DirectusTypes'

export type PostsQuery = Query<Schema, Post>

export interface PostsFilter {
  limit: number
  page: number
}

export const usePostsFilter = defineStore('usePostsFilter', () => {
  const defaultPostsFilter: PostsFilter = {
    limit: 25,
    page: 1
  }

  const filter = ref<PostsFilter>({ ...defaultPostsFilter })

  function resetFilter(): void {
    filter.value = { ...defaultPostsFilter }
  }

  function composePostsQuery({
    initialLoad
  }: {
    initialLoad?: boolean
  }): PostsQuery {
    let limit = filter.value.limit
    let page = filter.value.page

    // in case of initial load
    if (initialLoad && page > 1) {
      limit = page * limit
      page = 1
    }

    // base query
    const composedFilter: PostsQuery = {
      fields: [
        '*',
        {
          medias: ['*']
        }
      ],
      filter: {
        status: {
          _eq: 'published'
        }
      },
      sort: ['-date_created'],
      limit,
      page
    } as PostsQuery

    return composedFilter
  }

  return {
    filter,
    composePostsQuery,
    resetFilter
  }
})
