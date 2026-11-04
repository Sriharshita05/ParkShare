// Token storage. "Remember me" keeps the token across browser restarts (localStorage);
// otherwise it lasts only for the tab session (sessionStorage).
// Note: tokens in web storage are readable by any script on the page. Moving to an httpOnly cookie
// is the safer production setup.
const KEY = 'parkshare_token'

const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export const getToken = () => safe(() => localStorage.getItem(KEY) || sessionStorage.getItem(KEY))

export const saveToken = (token, remember) =>
  safe(() => {
    clearToken()
    ;(remember ? localStorage : sessionStorage).setItem(KEY, token)
  })

export const clearToken = () =>
  safe(() => {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
  })
