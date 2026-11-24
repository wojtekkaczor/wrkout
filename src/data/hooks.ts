import { useLiveQuery } from 'dexie-react-hooks'
import type { Settings } from '@/domain'
import { loadSettings } from './settings'

/** Live settings; `undefined` until the first read from IndexedDB completes. */
export function useSettings(): Settings | undefined {
  return useLiveQuery(() => loadSettings(), [])
}
