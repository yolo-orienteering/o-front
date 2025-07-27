const NEWSLETTER_COOKIE_KEY = 'NEWSLETTER'

export function useNewsletter() {
  const newsletterCookie = useCookie(NEWSLETTER_COOKIE_KEY, {
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 365,
  })

  function rememberSubscription() {
    newsletterCookie.value = 'true'
  }

  function isSubscribed(): boolean {
    return !!newsletterCookie.value
  }

  return {
    rememberSubscription,
    isSubscribed,
  }
}
