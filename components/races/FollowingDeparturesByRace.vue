<template>
  <div>
    <div
      v-if="props.followingDepartures && props.followingDepartures.length"
      class="row"
    >
      <div
        v-for="(
          followingDeparture, followingIndex
        ) in props.followingDepartures"
        :key="followingIndex"
        class="col-12"
      >
        <div class="row">
          <div class="col-6">
            {{ (followingDeparture.user as DirectusUsers).first_name }}
            {{ (followingDeparture.user as DirectusUsers).last_name }}
          </div>
          <div class="col-3">
            <nuxt-link
              :to="`/races/${props.raceId}/departures/category/${(followingDeparture.raceCategory as RaceCategory).id}`"
              class="q-mt-md"
              style="color: unset"
            >
              {{ (followingDeparture.raceCategory as RaceCategory).name }}
            </nuxt-link>
          </div>
          <div class="col-3">
            <div class="row justify-between">
              <div class="col-auto">
                {{ formatDepartureTime(followingDeparture.startTimeInMinutes) }}
              </div>
              <div class="col-auto">
                <q-btn
                  icon="delete"
                  round
                  size="xs"
                  color="primary"
                  class="q-ml-xs"
                  @click="deleteFollow(followingDeparture)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- follow more departures -->
    <!-- <div class="row">
      <div class="col-12 q-pt-md">
        <q-btn outline>Weitere Startzeiten merken</q-btn>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
  import { useDeparture } from '@/composables/useDeparture'
  import { useFollowingUserDepartures } from '@/composables/useFollowingUserDepartures'
  import type {
    DirectusUsers,
    RaceCategory,
    UserDeparture
  } from '@/types/DirectusTypes'

  const { formatDepartureTime } = useDeparture()
  const { followOrUnfollowUserDepartures } = useFollowingUserDepartures()

  const props = defineProps<{
    raceId: string
    followingDepartures: UserDeparture[] | false
  }>()

  const emits = defineEmits<{
    (e: 'unfollow'): void
  }>()

  function deleteFollow(followingDeparture: UserDeparture): void {
    followOrUnfollowUserDepartures(followingDeparture)
    emits('unfollow')
  }
</script>
