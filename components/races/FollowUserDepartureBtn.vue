<template>
  <q-btn
    size="xs"
    :outline="amIFollowing(props.followingUserDeparture.id) ? false : true"
    color="primary"
    @click="followOrUnfollowUserDepartures(props.followingUserDeparture)"
  >
    <q-icon
      v-if="amIFollowing(props.followingUserDeparture.id)"
      name="check"
      class="q-mr-xs"
    />
    <span v-else>Merken</span></q-btn
  >
</template>

<script setup lang="ts">
  import { useFollowingUserDepartures } from '@/composables/useFollowingUserDepartures'
  import type { FollowingUserDeparture } from '@/stores/syncCenter'

  const syncCenter = useSyncCenter()
  const { followOrUnfollowUserDepartures } = useFollowingUserDepartures()

  const props = defineProps<{
    followingUserDeparture: FollowingUserDeparture
  }>()

  function amIFollowing(userDepartureId: string): boolean {
    return !!syncCenter.followingUserDepartures?.find(
      (following) => following.id === userDepartureId
    )
  }
</script>
