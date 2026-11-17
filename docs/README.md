# wrkout · dokumentacja

Prywatna aplikacja do treningu hybrydowego: siłownia (sylwetka, ogólna sprawność) i bieganie. Sama układa plan, rozpisuje kolejne jednostki na podstawie celów, wyników i samopoczucia, a wszystko, co zaplanuje, można zmienić ręcznie.

Ten katalog to specyfikacja, na której opiera się budowa. Stan: **wersja 1, do akceptacji** (2026-11-17).

## Dokumenty

| # | Dokument | Odpowiada na pytanie |
|---|---|---|
| 01 | [Wizja i wymagania biznesowe](01-wizja-i-wymagania-biznesowe.md) | Po co, dla kogo, co jest w zakresie, a co nie |
| 02 | [Wymagania funkcjonalne i niefunkcjonalne](02-wymagania-funkcjonalne.md) | Co dokładnie aplikacja ma robić; priorytety; kryteria akceptacji |
| 03 | [Silnik treningowy](03-silnik-treningowy.md) | Według jakich reguł powstają treningi i jak się adaptują |
| 04 | [UX i UI](04-ux-ui.md) | Jak wyglądają ekrany i ile dotknięć kosztuje każda czynność |
| 05 | [Architektura](05-architektura.md) | Z czego to jest zbudowane i dlaczego tak |
| 06 | [Model danych i synchronizacja](06-model-danych.md) | Jakie dane, w jakim kształcie, jak trafiają do chmury |
| 07 | [Trener AI](07-trener-ai.md) | Co robi AI, czego nie robi, ile kosztuje |
| 08 | [Integracje](08-integracje.md) | Skąd biorą się biegi: Garmin, pliki, Strava |
| 09 | [Plan wdrożenia](09-plan-wdrozenia.md) | W jakiej kolejności budujemy i kiedy etap jest gotowy |

Na szybki przegląd wystarczą dokumenty 01 i 09 oraz sekcje „Do potwierdzenia” i „Najważniejsze decyzje” poniżej. Dokument 03 warto przeczytać w całości, bo opisuje to, co aplikacja będzie Ci codziennie podpowiadać.

## Najważniejsze decyzje

| Decyzja | Wybór | Szczegóły |
|---|---|---|
| Forma aplikacji | PWA instalowana z przeglądarki | [05, ADR-1](05-architektura.md#15-rejestr-decyzji-adr) |
| „Mózg” | Reguły na urządzeniu + opcjonalny trener AI | [03](03-silnik-treningowy.md), [07](07-trener-ai.md) |
| Podział ról | Silnik liczy ciężary i tempa; AI proponuje strukturę; użytkownik zatwierdza | [05, ADR-5](05-architektura.md#15-rejestr-decyzji-adr) |
| Dane | Lokalnie na urządzeniu, kopia i synchronizacja w chmurze | [06](06-model-danych.md) |
| Hosting | Cloudflare Workers + D1 (zamiast Supabase) | [05, ADR-2](05-architektura.md#15-rejestr-decyzji-adr) |
| Logowanie | Jeden klucz dostępu, bez kont i haseł | [05, ADR-6](05-architektura.md#15-rejestr-decyzji-adr) |
| Import biegów | Garmin Personal API + pliki + wpis ręczny; Strava wstrzymana | [08](08-integracje.md) |
| Model AI | `claude-opus-5-5`, z miesięcznym limitem kosztu | [07](07-trener-ai.md) |
| Zakres MVP | M0 + M1 + M2: plan hybrydowy, logowanie, adaptacja | [09](09-plan-wdrozenia.md) |

## Do potwierdzenia

Decyzje, w których wybrano wariant domyślny. Każdą można zmienić przed startem budowy.

| # | Kwestia | Przyjęto | Dlaczego pytam |
|---|---|---|---|
| 1 | **Strava** | Nie integrujemy w pierwszej wersji | Wybrałeś Stravę jako źródło, ale jej zasady API z 2026 roku zakazują trwałego przechowywania danych i użycia ich z AI. Szczegóły i warianty: [08 §6](08-integracje.md#6-strava) |
| 2 | **Zegarek** | Garmin, dane przez nowe osobiste API Garmina | Jeśli masz inny zegarek, głównym źródłem będzie import plików |
| 3 | **Hosting** | Cloudflare zamiast Supabase | W pytaniu padł przykład Supabase; Cloudflare lepiej pasuje do użytku prywatnego ([ADR-2](05-architektura.md#15-rejestr-decyzji-adr)) |
| 4 | **Telefon** | iPhone lub Android | Na iPhonie ekran zawsze włączony wymaga iOS 18.4 lub nowszego; brak wibracji timera |
| 5 | **Język** | Interfejs po polsku, jednostki kg i km | — |
| 6 | **Kolejność** | Najpierw bieganie (M2), potem chmura (M3) | Można odwrócić, jeśli kopia w chmurze jest ważniejsza niż szybkie domknięcie planu hybrydowego |
| 7 | **Blok** | 4 tygodnie pracy + 1 deload | Parametr; do zmiany w ustawieniach |

Zastrzeżenie do punktów 1 i 2: ustalenia o Stravie i Garminie pochodzą z wyciągów stron źródłowych z 2026-11-17 i będą potwierdzone na początku M4.

## Słownik

| Pojęcie | Znaczenie |
|---|---|
| **Trening hybrydowy** | Łączenie treningu siłowego i biegowego w jednym planie |
| **Blok (mezocykl)** | Kilka tygodni pracy zakończonych tygodniem deloadu |
| **Deload** | Tydzień lżejszy: mniej serii, mniejszy ciężar, mniej kilometrów |
| **Szkielet tygodnia** | Wzorzec tygodnia w bloku: jakie sesje, jakie ćwiczenia, ile serii |
| **Slot** | Miejsce na ćwiczenie w sesji: ćwiczenie, liczba serii, zakres powtórzeń |
| **Recepta** | Wyliczone liczby na konkretną sesję: ciężar, powtórzenia, tempo, dystans |
| **Seria robocza** | Seria wliczana do objętości i progresji (w odróżnieniu od rozgrzewkowej) |
| **RIR (zapas)** | Ile powtórzeń zostało „w zapasie” po serii |
| **RPE (wysiłek)** | Odczuwany wysiłek w skali 1–10 |
| **e1RM** | Szacowany ciężar maksymalny na jedno powtórzenie; miara postępu siłowego |
| **Podwójna progresja** | Najpierw rosną powtórzenia w zakresie, potem ciężar |
| **Objętość** | Liczba serii roboczych na partię w tygodniu; w bieganiu kilometraż |
| **VDOT** | Wskaźnik formy biegowej według Danielsa, liczony z wyniku; z niego wynikają tempa |
| **Akcent** | Mocna jednostka biegowa: tempo, interwały, podbiegi |
| **Tempo E / M / T / I / R** | Spokojne / maratońskie / progowe / interwałowe / rytmy |
| **Interferencja** | Wzajemne zakłócanie adaptacji i regeneracji między siłą a bieganiem |
| **Gotowość** | Ocena samopoczucia przed sesją, która może zmodyfikować receptę |
| **Wykonanie referencyjne** | Ostatnie miarodajne wykonanie ćwiczenia; punkt wyjścia progresji |
| **Propozycja** | Lista zmian w planie od silnika lub AI, czekająca na akceptację |
| **Walidator** | Zestaw limitów bezpieczeństwa sprawdzający każdą zmianę planu |
| **PWA** | Aplikacja internetowa instalowana na ekranie głównym, działająca offline |
| **Local-first** | Dane i logika na urządzeniu; chmura jest kopią i łącznikiem |
