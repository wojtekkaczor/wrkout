import { Card, Screen, isStandalone } from '@/ui'

const DATE_FORMAT = new Intl.DateTimeFormat('pl-PL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function formatToday(date: Date): string {
  const text = DATE_FORMAT.format(date)
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function TodayScreen() {
  return (
    <Screen title="Dziś" subtitle={formatToday(new Date())}>
      <Card title="Dziennik treningów">
        <p className="text-muted">
          Tu wybierzesz trening do wpisania. Ta część aplikacji jest w budowie.
        </p>
      </Card>
      {isStandalone() ? null : (
        <Card title="Zainstaluj aplikację">
          <p className="text-muted">
            W Safari wybierz Udostępnij, a potem „Do ekranu początkowego”. Zainstalowana
            aplikacja działa bez sieci i trzyma dane osobno od przeglądarki, więc treningi
            wpisuj już po instalacji.
          </p>
        </Card>
      )}
    </Screen>
  )
}
