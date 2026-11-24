export type StorageStatus = {
  /** Whether the browser exposes the Storage API at all. */
  supported: boolean
  /** Whether the browser promised not to evict this app's data. */
  persisted: boolean
  usageBytes?: number
  quotaBytes?: number
}

/**
 * Asks the browser to keep local data even under storage pressure. On iOS the
 * answer is decided by heuristics; an app installed to the Home Screen is
 * normally granted it.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persist) {
    return false
  }
  if (await navigator.storage.persisted()) {
    return true
  }
  return navigator.storage.persist()
}

export async function getStorageStatus(): Promise<StorageStatus> {
  if (typeof navigator === 'undefined' || !navigator.storage?.persisted) {
    return { supported: false, persisted: false }
  }
  const persisted = await navigator.storage.persisted()
  const estimate = navigator.storage.estimate ? await navigator.storage.estimate() : undefined
  return {
    supported: true,
    persisted,
    usageBytes: estimate?.usage,
    quotaBytes: estimate?.quota,
  }
}
