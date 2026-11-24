import { Card, Screen } from '@/ui'

export function ProgressScreen() {
  return (
    <Screen title="Postępy">
      <Card title="Brak danych">
        <p className="text-muted">
          Historia, rekordy i raport tygodnia pojawią się po wpisaniu pierwszych treningów.
        </p>
      </Card>
    </Screen>
  )
}
