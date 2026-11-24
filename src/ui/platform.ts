/**
 * True when the app runs from the Home Screen rather than in a browser tab.
 * On iOS an installed app has its own storage, separate from Safari, so data
 * entered in the browser does not carry over to the installed app.
 */
export function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
  return iosStandalone || window.matchMedia('(display-mode: standalone)').matches
}
