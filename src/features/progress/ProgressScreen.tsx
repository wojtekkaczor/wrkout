import { useSearchParams } from 'react-router'
import { Screen, Segmented } from '@/ui'
import { HistoryTab } from './HistoryTab'
import { ReportsTab } from './ReportsTab'
import { RunningTab } from './RunningTab'
import { StrengthTab } from './StrengthTab'
import { useProgressData } from './useProgressData'

const VIEWS = [
  { value: 'sila', label: 'Siła' },
  { value: 'bieganie', label: 'Bieganie' },
  { value: 'raporty', label: 'Raporty' },
  { value: 'historia', label: 'Historia' },
] as const

type View = (typeof VIEWS)[number]['value']

function isView(value: string | null): value is View {
  return VIEWS.some((view) => view.value === value)
}

export function ProgressScreen() {
  const data = useProgressData()
  // The chosen view lives in the URL so that "back" from a detail screen returns to it.
  const [params, setParams] = useSearchParams()
  const requested = params.get('widok')
  const view: View = isView(requested) ? requested : 'sila'

  return (
    <Screen title="Postępy">
      <Segmented
        label="Widok postępów"
        options={[...VIEWS]}
        value={view}
        onChange={(next) => setParams({ widok: next }, { replace: true })}
      />
      {!data.ready ? null : view === 'sila' ? (
        <StrengthTab data={data} />
      ) : view === 'bieganie' ? (
        <RunningTab data={data} />
      ) : view === 'raporty' ? (
        <ReportsTab data={data} />
      ) : (
        <HistoryTab data={data} />
      )}
    </Screen>
  )
}
