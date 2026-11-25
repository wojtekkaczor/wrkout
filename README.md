# wrkout

Prywatna aplikacja do treningu hybrydowego: siłownia i bieganie w jednym planie. Jest planerem i dziennikiem z raportami postępów; wpisanie serii zajmuje jedno dotknięcie, a czas i przerwy odmierza zegarek. Docelowo sama programuje kolejne jednostki na podstawie celów, wyników i samopoczucia.

## Stan projektu

| Etap | Stan |
|---|---|
| Specyfikacja | Wersja 1.2 w [`docs/`](docs/README.md) |
| M0 Fundament | Kod gotowy i przetestowany lokalnie; czeka na wdrożenie na Cloudflare i sprawdzenie na iPhonie |
| M1 Dziennik | Gotowy w kodzie: import wyników, „Moje treningi” (własne i z gotowych zestawów), wpisywanie treningów i biegów, notatki i ustawienia ćwiczeń, waga ciała, postępy z rekordami, raport tygodnia, historia, kopia z przypomnieniem. Czeka na wdrożenie i sprawdzenie na iPhonie |
| M2 Programowanie siły | Następny |

Kolejność: najpierw dziennik treningów i raporty postępów (M1), potem automatyczne programowanie (M2 siła, M3 bieganie i hybryda). Szczegóły w [planie wdrożenia](docs/09-plan-wdrozenia.md).

## Uruchomienie

Wymagania: Node 22 lub nowszy, pnpm 10.

```bash
pnpm install
pnpm dev          # aplikacja i API pod jednym adresem, z odświeżaniem na żywo
```

| Komenda | Co robi |
|---|---|
| `pnpm dev` | Serwer deweloperski (Vite + lokalny Worker) |
| `pnpm build` | Wersja produkcyjna w `dist/` |
| `pnpm preview` | Podgląd wersji produkcyjnej, z service workerem |
| `pnpm check` | Lint, typy i testy jednostkowe |
| `pnpm test` | Testy jednostkowe (Vitest) |
| `pnpm test:e2e` | Testy przeglądarkowe (Playwright) na wersji produkcyjnej |
| `pnpm deploy` | Budowa i wdrożenie na Cloudflare |

`pnpm test:e2e` zawsze buduje świeżą wersję i wymaga wolnego portu 4173.

Testy przeglądarkowe wymagają jednorazowo `pnpm exec playwright install chromium`. Lokalnie działają w Chromium z ekranem iPhone'a; CI dodaje WebKit, czyli silnik Safari. Pracę offline na WebKit sprawdza się na prawdziwym iPhonie.

## Wdrożenie

Aplikacja to jeden Cloudflare Worker: serwuje pliki i obsługuje `/api/*`. Konfiguracja jest w `wrangler.jsonc`.

**Automatycznie (zalecane).** W panelu Cloudflare: Workers & Pages → Create → Import a repository, wybierz to repozytorium. Polecenie budowania: `pnpm build`, polecenie wdrożenia: `npx wrangler deploy`. Każde wypchnięcie do gałęzi produkcyjnej wdraża nową wersję.

**Ręcznie.** `pnpm deploy` z ustawionym `CLOUDFLARE_API_TOKEN` (uprawnienie do edycji Workers) albo po `pnpm exec wrangler login`.

Adres aplikacji powinien pozostać stały od pierwszej instalacji na telefonie. Dane zainstalowanej aplikacji są przypisane do adresu, więc jego zmiana wymaga eksportu i importu danych.

Po wdrożeniu: otwórz adres w Safari na iPhonie, wybierz Udostępnij → „Do ekranu początkowego” i uruchamiaj aplikację z ikony.

## Import wyników z arkusza

Dotychczasowe wyniki z arkusza (`dane`: treningi siłowe, `bieganie`: biegi) zamienia na plik kopii aplikacji skrypt:

```bash
python3 scripts/import-results/convert.py wyniki.xlsx wrkout-import.json
```

Plik wczytuje się w aplikacji: Profil → Importuj kopię. Konwersję można powtarzać po dopisaniu kolejnych treningów do arkusza: import dodaje tylko nowe wpisy i nie nadpisuje zmian zrobionych w aplikacji. Arkusz i plik kopii zawierają dane osobiste i nie należą do repozytorium.

## Struktura

```
src/
  domain/     typy i schematy Zod wspólne dla aplikacji i API
  engine/     czyste obliczenia: e1RM, historia ćwiczeń, rekordy, raport tygodnia, szkic sesji „jak ostatnio”
  data/       IndexedDB (Dexie), repozytoria dokumentów, eksport i import
  ui/         komponenty bazowe i motyw
  catalog/    wbudowane ćwiczenia i gotowe zestawy treningów
  features/   ekrany: today, session, run, plan, exercises, progress, profile
  app/        powłoka, routing, aktualizacje
worker/       API (Hono) uruchamiane na Cloudflare
scripts/      ikony, konwerter arkusza z wynikami
tests/e2e/    testy przeglądarkowe
docs/         specyfikacja
```

Granice między modułami pilnuje ESLint (`eslint.config.js`); opis w [architekturze](docs/05-architektura.md). Programowanie treningów w `src/engine` i pełna biblioteka ćwiczeń w `src/catalog` powstaną w kolejnych etapach.

## Dokumentacja

- [Wizja i wymagania biznesowe](docs/01-wizja-i-wymagania-biznesowe.md)
- [Wymagania funkcjonalne](docs/02-wymagania-funkcjonalne.md)
- [Silnik treningowy](docs/03-silnik-treningowy.md)
- [UX i UI](docs/04-ux-ui.md)
- [Architektura](docs/05-architektura.md)
- [Model danych i synchronizacja](docs/06-model-danych.md)
- [Trener AI](docs/07-trener-ai.md)
- [Integracje](docs/08-integracje.md)
- [Plan wdrożenia](docs/09-plan-wdrozenia.md)
