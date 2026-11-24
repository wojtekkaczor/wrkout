import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { requestPersistentStorage, useSettings } from '@/data'
import { PlanScreen } from '@/features/plan/PlanScreen'
import { ProfileScreen } from '@/features/profile/ProfileScreen'
import { ProgressScreen } from '@/features/progress/ProgressScreen'
import { TodayScreen } from '@/features/today/TodayScreen'
import { PlanIcon, ProfileIcon, ProgressIcon, TabBar, TodayIcon, type TabItem } from '@/ui'
import { applyTheme } from './theme'
import { UpdateBanner } from './UpdateBanner'

const TABS: TabItem[] = [
  { to: '/', label: 'Dziś', icon: <TodayIcon /> },
  { to: '/plan', label: 'Plan', icon: <PlanIcon /> },
  { to: '/postepy', label: 'Postępy', icon: <ProgressIcon /> },
  { to: '/profil', label: 'Profil', icon: <ProfileIcon /> },
]

export function App() {
  const theme = useSettings()?.theme

  useEffect(() => {
    if (!theme) {
      return
    }
    applyTheme(theme)
    if (theme !== 'system') {
      return
    }
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  useEffect(() => {
    void requestPersistentStorage()
  }, [])

  return (
    <BrowserRouter>
      <div className="flex h-full flex-col">
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<TodayScreen />} />
            <Route path="/plan" element={<PlanScreen />} />
            <Route path="/postepy" element={<ProgressScreen />} />
            <Route path="/profil" element={<ProfileScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <UpdateBanner />
        <TabBar items={TABS} />
      </div>
    </BrowserRouter>
  )
}
