# 02 · Wymagania funkcjonalne i niefunkcjonalne

Priorytety: **M** = MVP (bez tego aplikacja nie spełnia celu), **S** = zaraz po MVP, **C** = później.
Kolumna **KM** wskazuje kamień milowy z [planu wdrożenia](09-plan-wdrozenia.md).

Pojęcia (blok, slot, recepta, RIR, VDOT) wyjaśnia [słownik w README](README.md#s%C5%82ownik).

## 1. Onboarding i profil (ONB)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-ONB-1 | Kreator pierwszego uruchomienia w maksymalnie 6 krokach: cele, dostępność, siła, bieganie, sprzęt, podsumowanie planu | M | M1 |
| FR-ONB-2 | Cele: priorytet siła ↔ bieganie (suwak), priorytetowe partie mięśniowe (0–3), cel biegowy (ogólna forma / dystans docelowy z opcjonalną datą i czasem) | M | M1–M2 |
| FR-ONB-3 | Dostępność: dni tygodnia, w które można trenować, liczba treningów siłowych i biegowych na tydzień, maksymalny czas jednostki, zgoda na dwa treningi jednego dnia | M | M1–M2 |
| FR-ONB-4 | Poziom siłowy: staż (początkujący / średnio zaawansowany / zaawansowany). Ciężary startowe nie są wymagane; ustala je kalibracja w pierwszych treningach | M | M1 |
| FR-ONB-5 | Poziom biegowy: niedawny wynik (dystans + czas) albo opis „biegam swobodnie X km w Y min” albo „zaczynam”; obecny tygodniowy kilometraż | M | M2 |
| FR-ONB-6 | Sprzęt: pełna siłownia / zestaw własny (lista typów sprzętu); skok obciążenia dla sztangi, hantli i maszyn | M | M1 |
| FR-ONB-7 | Ograniczenia: wykluczone ćwiczenia i obszary ciała z dolegliwościami | S | M2 |
| FR-ONB-8 | Na końcu kreatora użytkownik widzi gotowy tydzień i może go zaakceptować albo poprawić | M | M1 |
| FR-ONB-9 | Każdą odpowiedź z kreatora można zmienić później w Profilu; zmiana celu lub dostępności uruchamia propozycję nowego układu planu | M | M2 |

## 2. Plan treningowy (PLAN)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-PLAN-1 | Plan składa się z bloków (domyślnie 4 tygodnie pracy + 1 tydzień deloadu); blok ma szkielet tygodnia: sesje siłowe ze slotami ćwiczeń i sesje biegowe z typami | M | M1–M2 |
| FR-PLAN-2 | Aplikacja generuje szkielet tygodnia z wbudowanych szablonów na podstawie profilu (bez AI) | M | M1 |
| FR-PLAN-3 | Widok tygodnia: lista dni z sesjami, status (zaplanowana / wykonana / pominięta), szacowany czas | M | M1 |
| FR-PLAN-4 | Widok bloku: tygodnie, numer bieżącego tygodnia, tydzień deloadu, planowany kilometraż i liczba serii na partię | S | M2 |
| FR-PLAN-5 | Konkretne sesje tygodnia powstają automatycznie przy przejściu na nowy tydzień | M | M1 |
| FR-PLAN-6 | Po zakończeniu bloku aplikacja tworzy propozycję kolejnego bloku (silnik, opcjonalnie AI) do zaakceptowania | M | M2 (silnik), M5 (AI) |
| FR-PLAN-7 | Pauza planu na zakres dat (urlop, choroba) i powrót z automatyczną redukcją obciążeń | S | M2 |
| FR-PLAN-8 | Wcześniejszy deload na życzenie („Potrzebuję luzu”) lub z propozycji silnika | S | M2 |
| FR-PLAN-9 | Cel biegowy z datą startu: fazy baza → budowanie → szczyt → taper liczone wstecz od daty | C | M6 |

## 3. Trening siłowy i logowanie (STR)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-STR-1 | Ekran sesji pokazuje ćwiczenia w kolejności, a przy każdym serie z wyliczonym ciężarem i powtórzeniami oraz wynik z poprzedniego razu | M | M1 |
| FR-STR-2 | Odhaczenie serii jednym dotknięciem zapisuje ją z wartościami z recepty | M | M1 |
| FR-STR-3 | Zmiana ciężaru i powtórzeń przyciskami ± (krok równy skokowi obciążenia ćwiczenia) lub klawiaturą numeryczną | M | M1 |
| FR-STR-4 | RIR serii: opcjonalny wybór 0 / 1 / 2 / 3 / 4+ jednym dotknięciem; domyślnie przyjmowany RIR docelowy | M | M1 |
| FR-STR-5 | Timer przerwy startuje po odhaczeniu serii; czas zależy od typu ćwiczenia; można go pominąć lub wydłużyć | M | M1 |
| FR-STR-6 | Każda zmiana zapisuje się natychmiast lokalnie; przerwaną sesję można wznowić po zamknięciu aplikacji | M | M1 |
| FR-STR-7 | W trakcie sesji: zamiana ćwiczenia (lista zamienników dla tej samej partii i wzorca ruchu), dodanie lub usunięcie ćwiczenia i serii, zmiana kolejności | M | M1 |
| FR-STR-8 | Przy zamianie ćwiczenia wybór: „tylko dziś” albo „na stałe w planie” | M | M1 |
| FR-STR-9 | Pierwsze wykonanie ćwiczenia działa w trybie kalibracji: użytkownik dobiera ciężar, aplikacja podpowiada kolejne serie na podstawie pierwszej | M | M1 |
| FR-STR-10 | Zakończenie sesji: ocena wysiłku (RPE 1–10) i opcjonalna notatka; podsumowanie z rekordami | M | M1 |
| FR-STR-11 | Ekran pozostaje włączony w trakcie sesji | M | M1 |
| FR-STR-12 | Trening spoza planu: pusta sesja, do której dodaje się ćwiczenia ręcznie | S | M1 |
| FR-STR-13 | Rodzaje serii: robocza, rozgrzewkowa (nie liczy się do progresji), drop set | S | M6 |
| FR-STR-14 | Podpowiedź serii rozgrzewkowych dla pierwszego ćwiczenia wielostawowego | C | M6 |
| FR-STR-15 | Ćwiczenia na czas (np. deska) i z masą ciała (z dodatkowym obciążeniem lub odciążeniem) | S | M1 |
| FR-STR-16 | Korekta w trakcie sesji: gdy pierwsza seria odbiega od celu o 3 lub więcej powtórzeń, aplikacja proponuje zmianę ciężaru na kolejne serie | S | M6 |
| FR-STR-17 | Superserie (dwa ćwiczenia naprzemiennie) | C | M6 |
| FR-STR-18 | Notatka przypięta do ćwiczenia (np. ustawienie maszyny), widoczna przy każdym wykonaniu | S | M1 |

## 4. Bieganie (RUN)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-RUN-1 | Recepta biegu: typ (spokojny, długi, tempo, interwały, rytmy, regeneracyjny, test), struktura krok po kroku, dystans lub czas, docelowe tempo jako zakres, docelowe RPE | M | M2 |
| FR-RUN-2 | Tempa treningowe wyliczane z aktualnej formy (VDOT) | M | M2 |
| FR-RUN-3 | Ręczny wpis biegu: dystans, czas, RPE, opcjonalnie średnie tętno i notatka; tempo wylicza się samo | M | M2 |
| FR-RUN-4 | Automatyczny import biegu z zegarka i dopasowanie do zaplanowanej jednostki; użytkownik podaje RPE | M | M4 |
| FR-RUN-5 | Ręczne przypisanie lub odpięcie zaimportowanej aktywności od jednostki | M | M4 |
| FR-RUN-6 | Bieg spoza planu jest zapisywany i wliczany do tygodniowego kilometrażu | M | M2 |
| FR-RUN-7 | Wpis wyniku testu lub zawodów aktualizuje formę i tempa | M | M2 |
| FR-RUN-8 | Strefy tętna jako alternatywny cel, gdy podano tętno maksymalne | C | M6 |
| FR-RUN-9 | Import pliku FIT / GPX / TCX | S | M4 |
| FR-RUN-10 | Inne zaimportowane aktywności (rower, pływanie) widoczne w tygodniu jako obciążenie dodatkowe, bez programowania | C | M6 |

## 5. Samopoczucie i gotowość (RDY)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-RDY-1 | Przed startem sesji jedno pytanie „Jak się dziś czujesz?” w skali 1–5; odpowiedź jednym dotknięciem; można pominąć | M | M2 |
| FR-RDY-2 | Opcjonalne flagi: słaby sen, zakwasy (nogi / góra), ból (obszar), choroba, stres | S | M2 |
| FR-RDY-3 | Recepta sesji dostosowuje się do gotowości według reguł z [03 §8](03-silnik-treningowy.md#8-gotowo%C5%9B%C4%87-i-samopoczucie); użytkownik widzi, co się zmieniło, i może przywrócić oryginał | M | M2 |
| FR-RDY-4 | Zgłoszony ból obszaru ciała: aplikacja proponuje zamienniki ćwiczeń obciążających ten obszar | S | M2 |
| FR-RDY-5 | Silnik wykrywa narastające zmęczenie z wyników i RPE i proponuje wcześniejszy deload | S | M2 |
| FR-RDY-6 | Waga ciała jako opcjonalny pomiar z wykresem | S | M6 |

## 6. Silnik i adaptacja (ENG)

Pełna specyfikacja reguł: [03 · Silnik treningowy](03-silnik-treningowy.md).

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-ENG-1 | Progresja siłowa: podwójna progresja (powtórzenia, potem ciężar) z uwzględnieniem RIR | M | M1 |
| FR-ENG-2 | Docelowy RIR zmienia się w kolejnych tygodniach bloku; tydzień deloadu obniża objętość i ciężar | M | M1 |
| FR-ENG-3 | Wykrywanie stagnacji i regresu na ćwiczeniu, redukcja ciężaru lub sugestia zamiany | S | M2 |
| FR-ENG-4 | Progresja biegowa: wzrost tygodniowego kilometrażu w limicie, tydzień lżejszy w deloadzie, aktualizacja VDOT z wyników | M | M2 |
| FR-ENG-5 | Układ tygodnia hybrydowego uwzględniający reguły interferencji siła–bieg | M | M2 |
| FR-ENG-6 | Reakcja na realizację planu: pominięte sesje, powtórzenie tygodnia przy niskiej realizacji, powrót po przerwie | M | M2 |
| FR-ENG-7 | Każda recepta zawiera powód w formie zrozumiałej dla użytkownika („Dlaczego?”) | M | M1 |
| FR-ENG-8 | Silnik działa w całości na urządzeniu, bez sieci | M | M1 |
| FR-ENG-9 | Stan silnika jest wyliczany z historii: edycja starego wpisu aktualizuje kolejne recepty | M | M1 |
| FR-ENG-10 | Progresja objętości: dodawanie serii dla priorytetowych partii w trakcie bloku | C | M6 |
| FR-ENG-11 | Walidator limitów bezpieczeństwa używany dla propozycji AI (blokuje) i edycji ręcznych (ostrzega) | M | M2 |

## 7. Edycja ręczna (EDIT)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-EDIT-1 | Edycja szkieletu tygodnia: dodanie, usunięcie i przeniesienie sesji między dniami | M | M1 |
| FR-EDIT-2 | Edycja sesji siłowej w planie: ćwiczenia, kolejność, liczba serii, zakres powtórzeń, docelowy RIR | M | M1 |
| FR-EDIT-3 | Edycja sesji biegowej w planie: typ, dystans lub czas, struktura | M | M2 |
| FR-EDIT-4 | Nadpisanie recepty (ciężar, powtórzenia, tempo) dla pojedynczej sesji | M | M1 |
| FR-EDIT-5 | Przeniesienie sesji na inny dzień w bieżącym tygodniu; „Zrób dziś” dla dowolnej zaplanowanej sesji | M | M1 |
| FR-EDIT-6 | Pominięcie sesji z opcjonalnym powodem | M | M1 |
| FR-EDIT-7 | Edycja i usuwanie zapisanych treningów i biegów z historii | M | M1 |
| FR-EDIT-8 | Własne ćwiczenia: nazwa, partie, sprzęt, skok obciążenia, typ pomiaru | M | M1 |
| FR-EDIT-9 | Ustawienia ćwiczenia: skok obciążenia, preferowany zakres powtórzeń, czas przerwy, notatka | S | M1 |
| FR-EDIT-10 | Zmiany użytkownika są oznaczane i nie są nadpisywane przez silnik w bieżącym bloku; propozycja kolejnego bloku je zachowuje, chyba że użytkownik zgodzi się na zmianę | M | M2 |
| FR-EDIT-11 | Ręczna zmiana długości bloku, tygodnia deloadu i kilometrażu docelowego | S | M2 |
| FR-EDIT-12 | Ostrzeżenie (bez blokowania), gdy ręczna zmiana przekracza limity z walidatora | S | M2 |
| FR-EDIT-13 | Cofnięcie ostatniej zmiany planu | S | M2 |

## 8. Postępy (PROG)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-PROG-1 | Historia treningów: lista chronologiczna, szczegóły każdej sesji | M | M1 |
| FR-PROG-2 | Historia ćwiczenia: wszystkie wykonania, wykres szacowanego maksimum (e1RM) | M | M1 |
| FR-PROG-3 | Rekordy: najlepszy e1RM, największy ciężar, najwięcej powtórzeń na danym ciężarze; oznaczenie w podsumowaniu sesji | S | M1 |
| FR-PROG-4 | Tygodniowa liczba serii na partię mięśniową | S | M6 |
| FR-PROG-5 | Tygodniowy kilometraż, czas biegu, trend tempa biegów spokojnych, historia VDOT | S | M2 |
| FR-PROG-6 | Realizacja planu: wykonane względem zaplanowanych w tygodniu i bloku | S | M2 |
| FR-PROG-7 | Podsumowanie bloku po jego zakończeniu | S | M6 |

## 9. Trener AI (AI)

Pełna specyfikacja: [07 · Trener AI](07-trener-ai.md).

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-AI-1 | Propozycja kolejnego bloku na podstawie historii, celów i notatek, z uzasadnieniem zmian | S | M5 |
| FR-AI-2 | Podsumowanie tygodnia: krótki opis, mocne strony, uwagi, opcjonalne drobne korekty | S | M5 |
| FR-AI-3 | Polecenie tekstowe („w czwartek nie mogę”, „boli mnie bark”, „jadę na tydzień, mam tylko hantle”) → odpowiedź i propozycja zmian w planie | S | M5 |
| FR-AI-4 | Każda propozycja AI przechodzi walidator i wymaga akceptacji; użytkownik może przyjąć całość, część albo odrzucić | M (dla AI) | M5 |
| FR-AI-5 | Aplikacja jest w pełni funkcjonalna bez AI (brak klucza, brak sieci, przekroczony limit) | M | M1 |
| FR-AI-6 | Miesięczny limit kosztu AI i licznik zużycia w ustawieniach | S | M5 |
| FR-AI-7 | Generowanie pierwszego planu z opisu własnymi słowami w onboardingu | C | M5 |

## 10. Integracje (INT)

Pełna specyfikacja: [08 · Integracje](08-integracje.md).

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-INT-1 | Połączenie z Garmin Personal API przez wklejenie klucza w ustawieniach; rozłączenie usuwa klucz | M | M4 |
| FR-INT-2 | Nowe aktywności trafiają do aplikacji automatycznie (pobieranie cykliczne) i na żądanie („Synchronizuj”) | M | M4 |
| FR-INT-3 | Po połączeniu import historii z ostatnich 60 dni do oszacowania formy | S | M4 |
| FR-INT-4 | Przypomnienie o wygasającym kluczu integracji na 14 dni przed terminem | M | M4 |
| FR-INT-5 | Ta sama aktywność z dwóch źródeł (API, plik, wpis ręczny) nie tworzy duplikatu | M | M4 |
| FR-INT-6 | Status integracji i data ostatniej synchronizacji widoczne w ustawieniach | S | M4 |

## 11. Dane, konto, synchronizacja (SYNC)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-SYNC-1 | Wszystkie dane są zapisywane lokalnie na urządzeniu i dostępne offline | M | M1 |
| FR-SYNC-2 | Eksport całości danych do pliku JSON i import z pliku | M | M1 |
| FR-SYNC-3 | Logowanie kluczem dostępu; sesja utrzymywana na urządzeniu | M | M3 |
| FR-SYNC-4 | Synchronizacja dwukierunkowa z chmurą: automatycznie po zmianach, po odzyskaniu sieci i przy otwarciu aplikacji | M | M3 |
| FR-SYNC-5 | Dane dostępne na wielu urządzeniach po zalogowaniu | M | M3 |
| FR-SYNC-6 | Dyskretny wskaźnik stanu synchronizacji (zsynchronizowano / oczekuje / błąd) | S | M3 |
| FR-SYNC-7 | Usunięcie wszystkich danych z urządzenia i z chmury | S | M3 |

## 12. System (SYS)

| ID | Wymaganie | Prio | KM |
|---|---|---|---|
| FR-SYS-1 | Aplikacja instalowana na ekranie głównym telefonu (PWA), uruchamiana bez paska przeglądarki | M | M0 |
| FR-SYS-2 | Informacja o nowej wersji z przyciskiem odświeżenia; aktualizacja nigdy nie przerywa trwającej sesji | M | M0 |
| FR-SYS-3 | Tryb ciemny domyślnie; tryb jasny w ustawieniach | M | M0 |
| FR-SYS-4 | Ustawienia: jednostki, początek tygodnia, skoki obciążenia, czasy przerw, dźwięk timera | S | M1 |
| FR-SYS-5 | Przypomnienia o treningu (powiadomienia push) | C | M6 |

## 13. Kluczowe historie użytkownika i kryteria akceptacji

### US-1 · Robię dzisiejszy trening siłowy

Jako trenujący chcę otworzyć aplikację i od razu zacząć zaplanowany trening z podanymi ciężarami.

- Po otwarciu aplikacji widzę kartę dzisiejszej sesji z nazwą, listą ćwiczeń i szacowanym czasem.
- Jedno dotknięcie „Start” otwiera sesję (po drodze najwyżej jedno pytanie o samopoczucie, które mogę pominąć).
- Każde ćwiczenie pokazuje serie z ciężarem i powtórzeniami oraz wynik z poprzedniego razu.
- Dotknięcie pola serii zapisuje ją zgodnie z receptą i uruchamia timer przerwy.
- Po zamknięciu i ponownym otwarciu aplikacji wracam do tej samej sesji z zachowanymi seriami.
- Wszystko działa bez internetu.

### US-2 · Zrobiłem inaczej, niż zaplanowano

- Zmiana ciężaru lub powtórzeń w serii zajmuje nie więcej niż 3 dotknięcia.
- Zmieniony ciężar przenosi się na pozostałe serie tego ćwiczenia w bieżącej sesji.
- Kolejna recepta dla tego ćwiczenia wynika z faktycznie wykonanych serii.

### US-3 · Maszyna jest zajęta, zamieniam ćwiczenie

- Z menu ćwiczenia wybieram „Zamień” i widzę zamienniki dla tej samej partii, zgodne z moim sprzętem.
- Wybieram „tylko dziś” albo „na stałe”.
- Nowe ćwiczenie dostaje receptę z własnej historii albo tryb kalibracji.

### US-4 · Kolejny trening planuje się sam

- Po zakończeniu sesji następna sesja z tym ćwiczeniem ma wyliczone ciężary i powtórzenia zgodnie z regułami progresji.
- Przy recepcie mogę zobaczyć krótkie uzasadnienie.
- W poniedziałek nowy tydzień jest gotowy bez mojego udziału.

### US-5 · Biegam z zegarkiem

- Zaplanowany bieg pokazuje typ, dystans, zakres tempa i strukturę.
- Po biegu aktywność z zegarka pojawia się w aplikacji dopasowana do zaplanowanej jednostki.
- Potwierdzam jednym dotknięciem i wybieram RPE.
- Gdy dopasowanie jest błędne, mogę je zmienić albo wpisać bieg ręcznie.

### US-6 · Źle spałem

- Zaznaczam samopoczucie 2 na 5.
- Aplikacja pokazuje, co zmieniła w dzisiejszej sesji (np. o jedną serię mniej, lżej o 5%).
- Mogę przyjąć zmianę, przywrócić oryginał albo przenieść trening.
- Zmiana dotyczy tylko dzisiejszej sesji i nie obniża bazowych obciążeń.

### US-7 · Zmieniam plan po swojemu

- W zakładce Plan mogę przenieść sesję na inny dzień, zmienić ćwiczenia, serie i zakresy.
- Zmiana obowiązuje od razu, a silnik jej nie cofa.
- Gdy zmiana łamie regułę bezpieczeństwa, widzę ostrzeżenie, ale mogę ją zapisać.

### US-8 · Koniec bloku

- Po tygodniu deloadu widzę propozycję kolejnego bloku z listą zmian i powodami.
- Mogę przyjąć całość, odrzucić poszczególne zmiany albo edytować.
- Bez mojej reakcji aplikacja kontynuuje poprzedni szkielet, więc trening nigdy nie jest zablokowany.

### US-9 · Proszę trenera o zmianę

- Wpisuję „W przyszłym tygodniu jestem w delegacji, mam tylko hotelową siłownię z hantlami”.
- Dostaję krótką odpowiedź i listę proponowanych zmian w planie.
- Po akceptacji plan na wskazany okres jest zmieniony; po tym okresie wraca do normalnego.

### US-10 · Zmieniam telefon

- Na nowym urządzeniu loguję się kluczem dostępu.
- Po synchronizacji widzę cały plan i historię.

## 14. Wymagania niefunkcjonalne (NFR)

| ID | Obszar | Wymaganie |
|---|---|---|
| NFR-1 | Offline | Podgląd planu, logowanie siły i biegu, wyliczanie recept oraz przejście na nowy tydzień działają bez sieci |
| NFR-2 | Trwałość | Każda zmiana trafia do lokalnej bazy przed potwierdzeniem w interfejsie; aplikacja prosi przeglądarkę o trwały magazyn danych |
| NFR-3 | Wydajność | Reakcja na dotknięcie w sesji < 100 ms; uruchomienie zainstalowanej aplikacji do ekranu „Dziś” < 2 s na telefonie średniej klasy |
| NFR-4 | Rozmiar | Paczka startowa aplikacji ≤ 300 kB (gzip); wykresy ładowane leniwie |
| NFR-5 | Ergonomia | Elementy dotykowe ≥ 48 px; główne akcje w zasięgu kciuka; obsługa jedną ręką; czytelność w słabym świetle i przy spoconych dłoniach |
| NFR-6 | Dostępność | Kontrast tekstu ≥ 4,5:1; informacja nigdy nie jest przekazywana samym kolorem; respektowanie ustawienia ograniczenia animacji |
| NFR-7 | Bezpieczeństwo | Cały ruch po HTTPS; API dostępne tylko po zalogowaniu; klucze integracji i AI wyłącznie po stronie serwera; ograniczenie prób logowania |
| NFR-8 | Prywatność | Dane treningowe nie trafiają do nikogo poza wybranym hostingiem i dostawcą AI (tylko streszczenia potrzebne do odpowiedzi, z filtrem źródeł danych) |
| NFR-9 | Koszt | Infrastruktura mieści się w darmowych planach; koszt AI ograniczony limitem po stronie serwera |
| NFR-10 | Niezawodność silnika | Reguły silnika pokryte testami jednostkowymi i scenariuszowymi; te same dane wejściowe zawsze dają tę samą receptę |
| NFR-11 | Utrzymanie | Wdrożenie jedną komendą; migracje danych wersjonowane; brak ręcznych czynności okresowych |
| NFR-12 | Zgodność | Aktualne wersje Safari na iOS i Chrome na Androidzie; Chrome, Safari i Firefox na komputerze |
| NFR-13 | Odporność na konflikty | Edycja na dwóch urządzeniach offline nie powoduje utraty całych rekordów; wygrywa nowsza wersja pojedynczego dokumentu |
| NFR-14 | Przejrzystość | Każda automatyczna zmiana recepty lub planu ma zapisany powód dostępny w interfejsie |
