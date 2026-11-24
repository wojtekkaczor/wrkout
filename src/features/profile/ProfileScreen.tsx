import { useEffect, useState } from 'react'
import { getStorageStatus, updateSettings, useSettings, type StorageStatus } from '@/data'
import type { Theme } from '@/domain'
import { Card, Screen, Segmented, isStandalone } from '@/ui'

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'dark', label: 'Ciemny' },
  { value: 'light', label: 'Jasny' },
  { value: 'system', label: 'Systemowy' },
]

const MEGABYTE = 1024 * 1024

function describeStorage(status: StorageStatus | undefined): string {
  if (!status) {
    return 'Sprawdzam…'
  }
  if (!status.supported) {
    return 'Ta przeglądarka nie podaje informacji o magazynie danych.'
  }
  const used =
    status.usageBytes === undefined
      ? ''
      : ` Zajęte: ${(status.usageBytes / MEGABYTE).toLocaleString('pl-PL', { maximumFractionDigits: 1 })} MB.`
  return status.persisted
    ? `Trwały magazyn danych: włączony.${used}`
    : `Trwały magazyn danych: niewłączony. Przeglądarka może wyczyścić dane, gdy zabraknie miejsca.${used}`
}

export function ProfileScreen() {
  const settings = useSettings()
  const [storage, setStorage] = useState<StorageStatus>()

  useEffect(() => {
    let active = true
    void getStorageStatus().then((status) => {
      if (active) {
        setStorage(status)
      }
    })
    return () => {
      active = false
    }
  }, [])

  return (
    <Screen title="Profil">
      <Card title="Wygląd">
        <Segmented
          label="Motyw"
          options={THEME_OPTIONS}
          value={settings?.theme}
          onChange={(theme) => void updateSettings({ theme })}
        />
      </Card>
      <Card title="Dane na urządzeniu">
        <p className="text-muted">{describeStorage(storage)}</p>
        {isStandalone() ? null : (
          <p className="mt-2 text-muted">
            Aplikacja działa teraz w przeglądarce. Po instalacji na ekranie głównym ma własny,
            osobny magazyn danych.
          </p>
        )}
      </Card>
      <Card title="O aplikacji">
        <p className="tabular text-muted">Wersja {__APP_VERSION__}</p>
      </Card>
    </Screen>
  )
}
