import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router'
import { requestPersistentStorage, useSettings } from '@/data'
import { PlanScreen } from '@/features/plan/PlanScreen'
import { TemplateScreen } from '@/features/plan/TemplateScreen'
import { ProfileScreen } from '@/features/profile/ProfileScreen'
import { ExerciseScreen } from '@/features/progress/ExerciseScreen'
import { ProgressScreen } from '@/features/progress/ProgressScreen'
import { WorkoutScreen } from '@/features/progress/WorkoutScreen'
import { RunFormScreen } from '@/features/run/RunFormScreen'
import { SessionScreen } from '@/features/session/SessionScreen'
import { TodayScreen } from '@/features/today/TodayScreen'
import { PlanIcon, ProfileIcon, ProgressIcon, TabBar, TodayIcon, type TabItem } from '@/ui'
import { applyTheme } from './theme'
import { UpdateBanner } from './UpdateBanner'

const TABS: TabItem[] = [
  { to: '/', label: 'Dziś', icon: <TodayIcon /> },
  { to: '/plan', label: 'Treningi', icon: <PlanIcon /> },
  { to: '/postepy', label: 'Postępy', icon: <ProgressIcon /> },
  { to: '/profil', label: 'Profil', icon: <ProfileIcon /> },
]

/** Logging a workout or a run takes the whole screen, without the tab bar. */
const FOCUSED_ROUTE = /^\/(trening|bieg)\//

function Shell() {
  const { pathname } = useLocation()
  return (
    <div className="flex h-full flex-col">
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/trening/:logId" element={<SessionScreen />} />
          <Route path="/bieg/nowy" element={<RunFormScreen />} />
          <Route path="/bieg/:runId" element={<RunFormScreen />} />
          <Route path="/plan" element={<PlanScreen />} />
          <Route path="/plan/trening/nowy" element={<TemplateScreen />} />
          <Route path="/plan/trening/:templateId" element={<TemplateScreen />} />
          <Route path="/postepy" element={<ProgressScreen />} />
          <Route path="/postepy/cwiczenie/:exerciseId" element={<ExerciseScreen />} />
          <Route path="/postepy/trening/:logId" element={<WorkoutScreen />} />
          <Route path="/profil" element={<ProfileScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <UpdateBanner />
      {FOCUSED_ROUTE.test(pathname) ? null : <TabBar items={TABS} />}
    </div>
  )
}

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
      <Shell />
    </BrowserRouter>
  )
}
