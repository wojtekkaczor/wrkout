# wrkout · dokumentacja

Prywatna aplikacja do treningu hybrydowego: siłownia (sylwetka, ogólna sprawność) i bieganie. Sama układa plan, rozpisuje kolejne jednostki na podstawie celów, wyników i samopoczucia, a wszystko, co zaplanuje, można zmienić ręcznie. Jest planerem i dziennikiem: służy do szybkiego wpisywania treningów, śledzenia progresu i raportów.

Ten katalog to specyfikacja, na której opiera się budowa. Stan: **wersja 1.2** (2026-11-24), po decyzjach użytkownika: zegarek Garmin, bez Stravy, iPhone, bez timera przerw, najpierw dziennik treningów, potem programowanie.

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
| 08 | [Integracje](08-integracje.md) | Skąd biorą się biegi: Garmin, pliki, wpis ręczny |
| 09 | [Plan wdrożenia](09-plan-wdrozenia.md) | W jakiej kolejności budujemy i kiedy etap jest gotowy |

Na szybki przegląd wystarczą dokumenty 01 i 09 oraz sekcje poniżej. Dokument 03 warto przeczytać w całości, bo opisuje to, co aplikacja będzie Ci codziennie podpowiadać.

## Najważniejsze decyzje

| Decyzja | Wybór | Szczegóły |
|---|---|---|
| Rola aplikacji | Planer i dziennik: plan, szybki wpis, progres, raporty. Bez timera przerw i stopera; czas odmierza zegarek | [05, ADR-8](05-architektura.md#15-rejestr-decyzji-adr) |
| Urządzenie | iPhone; PWA instalowana z Safari na ekranie głównym | [05 §9](05-architektura.md#9-pwa-mo%C5%BCliwo%C5%9Bci-i-ograniczenia) |
| „Mózg” | Reguły na urządzeniu + opcjonalny trener AI | [03](03-silnik-treningowy.md), [07](07-trener-ai.md) |
| Podział ról | Silnik liczy ciężary i tempa; AI proponuje strukturę; użytkownik zatwierdza | [05, ADR-5](05-architektura.md#15-rejestr-decyzji-adr) |
| Wpisywanie | Na bieżąco albo po fakcie na tym samym ekranie; całe ćwiczenie lub cały trening „zgodnie z planem” jednym dotknięciem | [04 §3.3](04-ux-ui.md#33-sesja-si%C5%82owa) |
| Dane | Lokalnie na urządzeniu, kopia i synchronizacja w chmurze | [06](06-model-danych.md) |
| Hosting | Cloudflare Workers + D1 | [05, ADR-2](05-architektura.md#15-rejestr-decyzji-adr) |
| Logowanie | Jeden klucz dostępu, bez kont i haseł | [05, ADR-6](05-architektura.md#15-rejestr-decyzji-adr) |
| Import biegów | Garmin Personal API + pliki + wpis ręczny; bez Stravy | [08](08-integracje.md) |
| Model AI | `claude-opus-5-5`, z miesięcznym limitem kosztu | [07](07-trener-ai.md) |
| Kolejność | Najpierw dziennik i raporty postępów (MVP = M0 + M1), potem automatyczne programowanie: siła w M2, bieganie i hybryda w M3 | [09](09-plan-wdrozenia.md) |

## Rozstrzygnięte przez użytkownika (2026-11-24)

| Kwestia | Decyzja |
|---|---|
| Zegarek | Garmin |
| Strava | Pomijamy |
| Telefon | iPhone |
| Timer przerw, stoper | Niepotrzebne; robi to zegarek |
| Główne zastosowanie | Śledzenie progresu, serii i powtórzeń; łatwe wpisywanie treningów; raporty postępów |
| Kolejność | Najpierw śledzenie treningów, żeby zacząć korzystać; automatyczne programowanie jest obowiązkowe, ale w drugim kroku |
| Raporty | Przede wszystkim raporty postępów |

## Przyjęte domyślnie

Wariant domyślny obowiązuje, dopóki nie zdecydujesz inaczej.

| # | Kwestia | Przyjęto | Uwaga |
|---|---|---|---|
| 1 | Hosting | Cloudflare zamiast Supabase | Darmowy projekt Supabase jest wstrzymywany po tygodniu bez aktywności ([ADR-2](05-architektura.md#15-rejestr-decyzji-adr)) |
| 2 | Chmura | Synchronizacja dopiero w M4, po programowaniu | Do M4 dane są tylko na telefonie, z eksportem do pliku i przypomnieniem o kopii; M4 można przesunąć wcześniej |
| 3 | Treningi w M1 | Układasz własne sesje albo wybierasz gotowy szablon podziału | Silnik przejmie je w M2 razem z historią |
| 4 | Blok | 4 tygodnie pracy + 1 deload | Parametr w ustawieniach |
| 5 | Język | Interfejs po polsku, kg i km | — |

Zastrzeżenie: ustalenia o osobistym API Garmina pochodzą z wyciągów stron źródłowych z 2026-11-17 i będą potwierdzone na żywym kluczu na początku M5. Planem zapasowym jest import plików.

## Słownik

| Pojęcie | Znaczenie |
|---|---|
| **Trening hybrydowy** | Łączenie treningu siłowego i biegowego w jednym planie |
| **Blok (mezocykl)** | Kilka tygodni pracy zakończonych tygodniem deloadu |
| **Deload** | Tydzień lżejszy: mniej serii, mniejszy ciężar, mniej kilometrów |
| **Szkielet tygodnia** | Wzorzec tygodnia w bloku: jakie sesje, jakie ćwiczenia, ile serii |
| **Slot** | Miejsce na ćwiczenie w sesji: ćwiczenie, liczba serii, zakres powtórzeń |
| **Recepta** | Wyliczone liczby na konkretną sesję: ciężar, powtórzenia, tempo, dystans |
| **Tryb dziennika** | Etap przed programowaniem: sam wybierasz trening z „Moich treningów”, a pola serii wypełnia ostatni wynik |
| **Moje treningi** | Lista sesji (ćwiczenia, serie, zakresy) ułożona ręcznie albo z szablonu |
| **Wpis po fakcie** | Wpisanie treningu po jego zakończeniu, z datą treningu |
| **Raport z treningu** | Krótkie podsumowanie po sesji: wysiłek i notatka |
| **Raport tygodnia / bloku** | Zestawienie wykonania, objętości, rekordów i kilometrażu, liczone na urządzeniu |
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
