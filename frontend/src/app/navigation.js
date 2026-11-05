import { useSyncExternalStore } from 'react'

const event = 'pantry:navigate'
const snapshot = () =>
  window.location.pathname + window.location.search + window.location.hash
function subscribe(callback) {
  window.addEventListener('popstate', callback)
  window.addEventListener('hashchange', callback)
  window.addEventListener(event, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener('hashchange', callback)
    window.removeEventListener(event, callback)
  }
}
export const useLocation = () => useSyncExternalStore(subscribe, snapshot)
export function navigate(url, { replace = false, state = {} } = {}) {
  window.history.replaceState(
    { ...window.history.state, scroll: window.scrollY },
    '',
  )
  window.history[replace ? 'replaceState' : 'pushState'](state, '', url)
  window.dispatchEvent(new Event(event))
  if (!url.includes('#')) window.scrollTo(0, state.scroll || 0)
}
export function catalogueOrigin() {
  if (window.location.pathname === '/products')
    return {
      url: window.location.pathname + window.location.search,
      scroll: window.scrollY,
    }
  return window.history.state?.catalogue || { url: '/products', scroll: 0 }
}
