import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * Shown when a new app version has been downloaded. The new version only
 * takes over after the user taps the button, so an update never interrupts
 * what they are doing (FR-SYS-2).
 */
export function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // An installed app can stay open for days, so look for a new version
      // whenever it returns to the foreground.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          void registration?.update()
        }
      })
    },
  })

  if (!needRefresh) {
    return null
  }

  return (
    <div
      role="status"
      className="flex items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-2"
    >
      <span className="text-base">Dostępna aktualizacja</span>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="min-h-12 rounded-xl bg-accent px-4 text-base font-semibold text-accent-contrast"
      >
        Odśwież
      </button>
    </div>
  )
}
