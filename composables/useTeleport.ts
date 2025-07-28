export function useTeleport(teleportToId: string) {
  const teleportElement = ref<HTMLElement | null>(null)

  onMounted(async () => {
    // unfortunately not working with nextTick() instead using ugly set timeout
    setTimeout(() => {
      teleportElement.value = document.getElementById(teleportToId)
    }, 100)
  })

  return {
    teleportElement,
  }
}
