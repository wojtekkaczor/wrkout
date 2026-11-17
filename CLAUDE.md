# wrkout

Prywatna PWA do treningu hybrydowego (siła + bieganie) dla jednego użytkownika.

## Źródło prawdy

Specyfikacja w `docs/` (start: `docs/README.md`). Przed zmianą zachowania aplikacji przeczytaj właściwy dokument. Gdy decyzja się zmienia, najpierw zaktualizuj dokument, potem kod.

- Reguły treningowe: `docs/03-silnik-treningowy.md` (scenariusze S1–S17 są testami akceptacyjnymi silnika).
- Kształt danych i operacje na planie: `docs/06-model-danych.md`.
- Kolejność prac i kryteria ukończenia: `docs/09-plan-wdrozenia.md`.

## Konwencje

- Interfejs i dokumentacja po polsku; kod, identyfikatory i komunikaty commitów po angielsku.
- TypeScript w trybie ścisłym. Schematy Zod w `src/domain` są jedynym źródłem typów danych.
- `src/engine` to czyste funkcje: bez Reacta, Dexie, sieci i zegara systemowego („teraz” jest parametrem). Importuje tylko `src/domain` i `src/catalog`.
- `worker/` nie zawiera logiki treningowej; importuje tylko `src/domain`.
- Stałe silnika wyłącznie w `src/engine/config.ts`.
- Wartości pochodne (e1RM, VDOT, stagnacja) wylicza się z logów; nie zapisuje się ich jako stanu.
- Każda zmiana struktury planu przechodzi przez `PlanOp` i walidator.
- Dane w jednostkach podstawowych: kilogramy, metry, sekundy.

## Zasady produktu

Prostota ma pierwszeństwo: seria zgodna z planem to jedno dotknięcie, aplikacja działa offline, nic nie blokuje treningu. Nowa funkcja, która dodaje ekran lub decyzję przy każdym treningu, wymaga uzasadnienia (zob. `docs/01-wizja-i-wymagania-biznesowe.md` §7).
