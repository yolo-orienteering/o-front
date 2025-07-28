export const useIsDesktop = () => {
  const $q = useQuasar()

  return computed<boolean>(() => {
    return $q.screen.gt.md
  })
}
