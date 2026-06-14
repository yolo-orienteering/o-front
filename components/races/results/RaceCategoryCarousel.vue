<template>
  <div ref="catRow" class="cat-row">
    <div
      v-for="cat in results.classes"
      :key="cat.name"
      class="cat-card"
      :class="{ 'cat-card--mine': isOwnCategory(cat) }"
    >
      <div class="row items-baseline justify-between no-wrap">
        <div class="text-subtitle1 text-weight-bold ellipsis">
          {{ cat.name }}
        </div>
        <div class="text-caption text-grey-7 q-ml-sm">
          {{ rankedCount(cat) }} klassiert
        </div>
      </div>
      <div v-if="courseLine(cat)" class="text-caption text-grey-7 q-mb-xs">
        {{ courseLine(cat) }}
      </div>

      <!-- podium (top 3) -->
      <div
        v-for="(entry, i) in podium(cat)"
        :key="i"
        class="result-line"
        :class="{ 'result-line--mine': isMine(entry) }"
      >
        <q-icon
          name="emoji_events"
          :style="{ color: PODIUM_COLORS[i] }"
          size="18px"
          class="q-mr-sm"
        />
        <span class="result-name">{{ entry.fullName }}</span>
        <q-icon
          v-if="isMine(entry)"
          name="person"
          size="14px"
          class="q-mr-xs text-primary"
        />
        <span class="result-time" :class="isMine(entry) ? '' : 'text-grey-8'">
          {{ formatRaceTime(entry.timeInSeconds) }}
        </span>
      </div>

      <!-- the profile user as a 4th entry (only in their category, if not on podium) -->
      <template v-if="showUserExtra(cat)">
        <div v-if="ownHasGapToPodium" class="result-line dots-line">⋮</div>
        <div class="result-line user-line">
          <span class="user-pos">{{ ownPosLabel }}</span>
          <span class="result-name">{{ own!.entry.fullName }}</span>
          <span class="result-time">
            <template v-if="own!.entry.status === 'OK'">
              {{ formatRaceTime(own!.entry.timeInSeconds) }}
              <span v-if="ownGap" class="user-gap">{{
                formatGap(ownGap)
              }}</span>
            </template>
            <span v-else>{{ statusShort(own!.entry.status) }}</span>
          </span>
        </div>
      </template>

      <div
        v-if="!podium(cat).length && !showUserExtra(cat)"
        class="text-caption text-grey-6 q-py-sm"
      >
        Keine Resultate.
      </div>

      <q-btn
        class="q-mt-sm full-width"
        :outline="false"
        color="primary"
        no-caps
        dense
        icon="leaderboard"
        :to="`/races/${raceId}/results/category/${encodeURIComponent(cat.name)}`"
        label="Rangliste ansehen"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import type {
    RaceResultClass,
    RaceResultEntry,
    RaceResultsResponse
  } from '@/types/RaceResults'
  import {
    formatGap,
    formatRaceTime,
    statusShort
  } from '@/utils/raceResultFormat'

  const PODIUM_COLORS = ['#FFC107', '#B0BEC5', '#CD7F32']

  const props = defineProps<{
    results: RaceResultsResponse
    meIdentifier: string | false
    raceId: string
  }>()

  const catRow = ref<HTMLElement | null>(null)
  const hasAutoScrolled = ref(false)

  const own = computed<
    { entry: RaceResultEntry; raceClass: RaceResultClass } | undefined
  >(() => {
    if (props.meIdentifier === false) return undefined
    for (const raceClass of props.results.classes) {
      const entry = raceClass.results.find(
        (r) => r.identifier === props.meIdentifier
      )
      if (entry) return { entry, raceClass }
    }
    return undefined
  })

  function podium(cat: RaceResultClass): RaceResultEntry[] {
    return cat.results.filter((r) => r.status === 'OK').slice(0, 3)
  }
  function rankedCount(cat: RaceResultClass): number {
    return cat.results.filter((r) => r.status === 'OK').length
  }
  function courseLine(cat: RaceResultClass): string {
    const c = cat.course
    const parts: string[] = []
    if (c.length) parts.push(`${(c.length / 1000).toFixed(1)} km`)
    if (c.climb) parts.push(`${c.climb} Hm`)
    if (c.controls) parts.push(`${c.controls} Posten`)
    return parts.join(' · ')
  }

  function isMine(entry: RaceResultEntry): boolean {
    return (
      props.meIdentifier !== false && entry.identifier === props.meIdentifier
    )
  }
  function isOwnCategory(cat: RaceResultClass): boolean {
    return !!own.value && cat.name === own.value.raceClass.name
  }
  function userOnPodium(cat: RaceResultClass): boolean {
    return podium(cat).some((e) => e.identifier === props.meIdentifier)
  }
  function showUserExtra(cat: RaceResultClass): boolean {
    return isOwnCategory(cat) && !userOnPodium(cat)
  }

  const ownPosLabel = computed(() => {
    const e = own.value?.entry
    if (!e) return ''
    return e.position ? `${e.position}.` : statusShort(e.status)
  })
  const ownHasGapToPodium = computed(() => {
    const pos = own.value?.entry.position
    return !!pos && pos > 4
  })
  const ownGap = computed(() => {
    const e = own.value?.entry
    if (!e || e.status !== 'OK' || e.timeInSeconds === null) return null
    const leader = own.value?.raceClass.results.find(
      (r) => r.status === 'OK'
    )?.timeInSeconds
    if (leader === null || leader === undefined) return null
    return e.timeInSeconds - leader
  })

  // Preselect (scroll to) the user's category; otherwise start on a random one.
  function scrollToIndex(index: number): void {
    nextTick(() => {
      const row = catRow.value
      const card = row?.children[index] as HTMLElement | undefined
      if (row && card) row.scrollLeft = card.offsetLeft
    })
  }
  function autoScroll(): void {
    if (hasAutoScrolled.value || !catRow.value) return
    if (own.value) {
      const idx = props.results.classes.findIndex(
        (c) => c.name === own.value?.raceClass.name
      )
      if (idx >= 0) {
        scrollToIndex(idx)
        hasAutoScrolled.value = true
        return
      }
    }
    if (props.results.classes.length >= 2) {
      scrollToIndex(Math.floor(Math.random() * props.results.classes.length))
      hasAutoScrolled.value = true
    }
  }

  onMounted(autoScroll)
  // own may resolve slightly after mount (profile loaded from storage)
  watch(own, () => {
    if (!hasAutoScrolled.value) autoScroll()
  })
</script>

<style lang="scss" scoped>
  .cat-row {
    position: relative; // so card.offsetLeft is relative to this scroller
    display: flex;
    gap: 12px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 4px 0 10px;
    scrollbar-width: none;
  }
  .cat-row::-webkit-scrollbar {
    display: none;
  }

  .cat-card {
    flex: 0 0 86%;
    max-width: 86%;
    scroll-snap-align: start;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    padding: 12px;
  }
  .cat-card--mine {
    border-color: var(--q-primary);
    box-shadow: 0 0 0 1px var(--q-primary) inset;
  }

  .result-line {
    display: flex;
    align-items: center;
    padding: 3px 0;
  }
  .result-line--mine {
    margin: 2px -4px;
    padding: 3px 4px;
    border-radius: 8px;
    background: rgba(38, 70, 83, 0.1);
    font-weight: 600;
  }
  .result-name {
    flex: 1 1 auto;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .result-time {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
  }

  .dots-line {
    color: var(--q-dark);
    opacity: 0.4;
    justify-content: center;
    line-height: 0.6;
    padding: 0;
  }

  .user-line {
    margin-top: 2px;
    padding: 4px 6px;
    border-radius: 8px;
    background: rgba(38, 70, 83, 0.1);
    font-weight: 600;
  }
  .user-pos {
    flex: 0 0 auto;
    min-width: 28px;
    color: var(--q-primary);
  }
  .user-gap {
    color: var(--q-secondary);
    font-weight: 500;
  }
</style>
