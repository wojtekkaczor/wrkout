# 04 · UX i UI

## 1. Zasady

1. **Jeden ekran, jedna rzecz.** „Dziś” pokazuje dzisiejszy trening. Sesja pokazuje serie. Reszta jest schowana o jedno dotknięcie dalej.
2. **Potwierdzaj, nie wpisuj.** Pola są wypełnione receptą. Najczęstsza akcja to jedno dotknięcie.
3. **Kciuk rządzi.** Główne akcje leżą w dolnej połowie ekranu. Elementy dotykowe mają co najmniej 48 px.
4. **Liczby są duże.** Ciężar i powtórzenia to największy tekst na ekranie sesji.
5. **Nic nie blokuje treningu.** Pytania (samopoczucie, RPE) można pominąć. Brak sieci, brak AI i brak akceptacji propozycji nie zatrzymują sesji.
6. **Szczegóły na żądanie.** Uzasadnienia, historia i ustawienia ćwiczenia otwierają się w panelu dolnym, bez opuszczania sesji.
7. **Spokojny interfejs.** Bez animacji ozdobnych, konfetti i powiadomień motywacyjnych. Rekord jest zaznaczony małym znacznikiem.
8. **Dziennik, nie stoper.** Aplikacja nie ma timera przerw ani stopera; czas odmierza zegarek. Ten sam ekran służy do odhaczania serii między seriami i do wpisania całego treningu po fakcie.

## 2. Nawigacja

Cztery zakładki na dole ekranu:

| Zakładka | Zawartość |
|---|---|
| **Dziś** | Dzisiejsza sesja lub sesje, pasek tygodnia, zaległe, oczekujące propozycje, co jutro |
| **Plan** | Bieżący tydzień i kolejne, widok bloku, edycja szkieletu, pauza, trener |
| **Postępy** | Historia, wykresy siły i biegania, rekordy |
| **Profil** | Cele, dostępność, sprzęt, biblioteka ćwiczeń, integracje, dane, ustawienia |

Sesja (siłowa lub biegowa) otwiera się na pełnym ekranie, bez zakładek. Edycje i szczegóły otwierają się w panelach dolnych.

## 3. Ekrany

### 3.1 Dziś

```
┌────────────────────────────────┐
│ Środa, 18 listopada         ◌  │  ◌ stan synchronizacji
│ Blok 2 · tydzień 3 z 5         │
│                                │
│ ┌────────────────────────────┐ │
│ │ DÓŁ A              ~60 min │ │
│ │ Przysiad ze sztangą        │ │
│ │ Martwy ciąg rumuński       │ │
│ │ + 4 ćwiczenia              │ │
│ │                            │ │
│ │ [        ZACZNIJ         ] │ │
│ └────────────────────────────┘ │
│                                │
│  Pn   Wt   Śr   Cz   Pt  So  Nd│
│  ✓✓   ·    ●    SB   S   ·   B │
│                                │
│ Jutro · Góra B + bieg 6 km     │
│                                │
│  Dziś    Plan   Postępy  Profil│
└────────────────────────────────┘
```

Warianty:

- **Dwie sesje dziś:** dwie karty w kolejności zalecanej przez silnik.
- **Dzień wolny:** „Dziś wolne” i karta najbliższej sesji z akcją „Zrób dziś”.
- **Zaległa sesja:** mała karta nad główną: „Zaległe: Dół A (poniedziałek)” z akcjami „Wpisz” (trening już zrobiony), „Zrób dziś” i „Pomiń”.
- **Sesja w toku:** karta zmienia się w „Kontynuuj · 3 z 7 ćwiczeń”.
- **Zaimportowany bieg:** karta „Bieg 8,2 km · 45:10 · pasuje do: Bieg spokojny” z akcją „Potwierdź”.
- **Propozycja do rozpatrzenia:** jeden wiersz „Propozycja kolejnego bloku” prowadzący do ekranu propozycji.

Pasek tygodnia: litera oznacza rodzaj (S = siła, B = bieg; dwie litery to dwie sesje), ✓ = wykonane, ● = dziś, · = wolne, przekreślenie = pominięte. Dotknięcie dnia pokazuje jego sesje.

### 3.2 Samopoczucie (panel przed sesją)

```
┌────────────────────────────────┐
│ Jak się dziś czujesz?          │
│                                │
│   1     2     3     4     5    │
│  źle  słabo  ok dobrze świetnie│
│                                │
│ Coś jeszcze? (opcjonalnie)     │
│ [słaby sen] [zakwasy nóg]      │
│ [zakwasy góry] [ból] [choroba] │
│                                │
│ Pomiń                          │
└────────────────────────────────┘
```

Dotknięcie oceny 4 lub 5 od razu otwiera sesję. Przy ocenie 1–3 panel pokazuje, co się zmieni, z akcjami „Zastosuj”, „Trenuję normalnie” i „Przenieś trening”.

Panel pojawia się tylko przy rozpoczynaniu dzisiejszej sesji. Przy wpisywaniu treningu po fakcie jest pomijany.

### 3.3 Sesja siłowa

```
┌────────────────────────────────┐
│ ←  Góra A · dziś             ⋯ │
│                                │
│ 1  Wyciskanie na ławce       ⋯ │
│    Ostatnio: 80 × 9, 9, 8      │
│    Cel: zapas 2 · Dlaczego?    │
│  ┌────┬────────┬───────┬─────┐ │
│  │ 1  │ 80 kg  │  10   │  ✓  │ │
│  │ 2  │ 80 kg  │  10   │  ✓  │ │
│  │ 3  │ 80 kg  │  10   │  ○  │ │
│  └────┴────────┴───────┴─────┘ │
│  + seria      ✓ wszystkie serie│
│                                │
│ 2  Wiosłowanie sztangą       ⋯ │
│    Ostatnio: 70 × 12, 11, 10   │
│  ┌────┬────────┬───────┬─────┐ │
│  │ 1  │ 70 kg  │  12   │  ○  │ │
│  ...                           │
│                                │
│ [          ZAKOŃCZ           ] │
└────────────────────────────────┘
```

Zachowanie:

- **Dotknięcie ○** zapisuje serię z widocznymi wartościami i zamienia znacznik na ✓.
- **„✓ wszystkie serie”** odhacza całe ćwiczenie zgodnie z receptą.
- **„Wszystko zgodnie z planem”**: przycisk pod nagłówkiem, widoczny, dopóki żadna seria nie jest odhaczona. Odhacza całą sesję; potem wystarczy poprawić serie, które poszły inaczej.
- **Dotknięcie ciężaru lub powtórzeń** otwiera panel edycji serii (§3.4).
- **Dotknięcie ✓** cofa odhaczenie.
- **Menu ćwiczenia (⋯):** Zamień, Historia, Notatka, Ustawienia ćwiczenia, Usuń z sesji, Przesuń.
- **Menu sesji (⋯):** Zmień datę treningu, Dodaj ćwiczenie, Zmień kolejność, Odrzuć sesję.
- **Kalibracja:** zamiast ciężaru pole „Dobierz” z podpowiedzią zakresu; po pierwszej serii pojawia się sugestia na kolejne.
- Bieżące ćwiczenie jest rozwinięte, wykonane zwijają się do jednej linii z wynikiem.
- Wyjście z sesji (←) niczego nie traci; można wrócić za godzinę albo wieczorem.
- Aplikacja nie odmierza przerw ani czasu treningu. Sesję można wypełniać na bieżąco między seriami albo w całości po treningu; nagłówek pokazuje datę treningu.

### 3.4 Edycja serii (panel dolny)

```
┌────────────────────────────────┐
│ Wyciskanie na ławce · seria 3  │
│                                │
│ Ciężar                         │
│  [ −2,5 ]     82,5 kg  [ +2,5 ]│
│                                │
│ Powtórzenia                    │
│  [  −1  ]       9      [  +1  ]│
│                                │
│ Zapas (RIR)                    │
│  [0] [1] [2] [3] [4+]          │
│                                │
│ ☑ Ten ciężar do końca ćwiczenia│
│ [          ZAPISZ ✓          ] │
└────────────────────────────────┘
```

Dotknięcie liczby otwiera klawiaturę numeryczną. „Zapisz” odhacza serię. Krok ciężaru równa się skokowi obciążenia ćwiczenia.

### 3.5 Zamiana ćwiczenia (panel dolny)

Lista zamienników posortowana według dopasowania: ta sama rola i partia, zgodny sprzęt, bez wykluczonych. Przy każdym wynik z ostatniego wykonania, jeśli istnieje. Na dole wyszukiwarka całej biblioteki i „Nowe ćwiczenie”. Po wyborze pytanie: **Tylko dziś** / **Na stałe w planie**.

### 3.6 Raport z treningu

```
┌────────────────────────────────┐
│ Jak ciężko było?               │
│  1 2 3 4 5 6 7 8 9 10          │
│                                │
│ Notatka (opcjonalnie)          │
│ [                            ] │
│                                │
│ [          ZAPISZ            ] │
└────────────────────────────────┘
```

Po zapisie krótkie podsumowanie: liczba serii, rekordy, zmiana względem poprzedniego razu, zapowiedź kolejnej sesji. Jedno dotknięcie wraca do „Dziś”.

### 3.7 Sesja biegowa

```
┌────────────────────────────────┐
│ ←  Interwały              ⋯    │
│                                │
│ 9,5 km · ok. 55 min            │
│                                │
│ 1. Rozgrzewka 15 min           │
│    spokojnie 6:20–6:57 /km     │
│ 2. 5 × 3 min                   │
│    4:46–4:56 /km               │
│    przerwa 2 min truchtu       │
│ 3. Schłodzenie 10 min          │
│                                │
│ Dlaczego?                      │
│                                │
│ [     WPISZ WYNIK RĘCZNIE    ] │
│ Czekam na import z zegarka…    │
└────────────────────────────────┘
```

Po biegu:

- **Import automatyczny:** karta na „Dziś” z dopasowaną aktywnością. „Potwierdź” → wybór RPE (1–10) → gotowe. „To nie ten bieg” pozwala przypisać inną jednostkę albo zapisać jako bieg spoza planu.
- **Wpis ręczny:** dystans, czas, RPE; opcjonalnie średnie tętno i notatka. Tempo liczy się samo. Dla akcentów dodatkowe pytanie „Zrobione zgodnie z planem?” (tak / skrócone / przerwane).
- **Plik:** „Importuj plik” w menu (FIT, GPX, TCX).

### 3.8 Plan

```
┌────────────────────────────────┐
│ Plan                 Blok ▾  ⋯ │
│ Blok 2 · tydzień 3 z 5         │
│ ‹  17–23 listopada  ›          │
│                                │
│ Pn ✓ Góra A             64 min │
│    ✓ Interwały 9,5 km          │
│ Wt   —                         │
│ Śr ● Dół A             ~60 min │
│ Cz   Góra B            ~65 min │
│      Bieg spokojny 6 km        │
│ Pt   Dół B             ~60 min │
│ So   —                         │
│ Nd   Bieg długi 14 km          │
│                                │
│ Bieganie: 29,5 km (+7%)        │
│                                │
│ [ Zapytaj trenera ]            │
└────────────────────────────────┘
```

- Dotknięcie sesji otwiera podgląd z receptą i akcjami: Edytuj, Przenieś, Zrób dziś, Pomiń.
- Przytrzymanie i przeciągnięcie przenosi sesję na inny dzień.
- Strzałki przełączają tygodnie. Przyszłe tygodnie pokazują wartości przewidywane.
- **Blok ▾** otwiera widok bloku: tygodnie, deload, planowany kilometraż, serie na partię, edycja szkieletu.
- Menu (⋯): Pauza planu, Potrzebuję luzu (deload teraz), Historia zmian, Cofnij ostatnią zmianę.

### 3.9 Edycja sesji w planie

Lista slotów z uchwytami do zmiany kolejności. Każdy slot: ćwiczenie, serie (±), zakres powtórzeń (wybór z listy typowych zakresów lub własny), kłódka (przypięcie ćwiczenia). Przyciski: Dodaj ćwiczenie, Usuń sesję. Na górze przełącznik **Tylko ten tydzień / Na stałe**.

Gdy zmiana przekracza limit walidatora, pod polem pojawia się jednozdaniowe ostrzeżenie. Zapis nie jest blokowany.

### 3.10 Propozycja zmian

Wspólny ekran dla propozycji silnika i trenera AI.

```
┌────────────────────────────────┐
│ ←  Propozycja: blok 3          │
│                                │
│ Dobry blok: wyciskanie +5 kg,  │
│ kilometraż 30 → 37 km.         │
│                                │
│ ☑ Góra A: wznosy bokiem        │
│   hantle → wyciąg              │
│   Bez postępu od 3 treningów   │
│ ☑ Barki: +2 serie w tygodniu   │
│   Partia priorytetowa          │
│ ☑ Bieganie: start od 34 km     │
│ ☐ Blok dłuższy o tydzień       │
│   Brak oznak zmęczenia         │
│                                │
│ [     PRZYJMIJ ZAZNACZONE    ] │
│ Odrzuć wszystko                │
└────────────────────────────────┘
```

Każda zmiana ma własny znacznik wyboru i jednozdaniowy powód. Zmiany zablokowane przez walidator są wyszarzone, z podaną przyczyną.

### 3.11 Trener (panel z zakładki Plan)

Pole tekstowe „Co chcesz zmienić?” z przykładami podpowiedzi („Przenieś czwartek”, „Boli mnie bark”, „W przyszłym tygodniu mam tylko hantle”). Odpowiedź to krótki tekst i, jeśli dotyczy, przycisk „Zobacz proponowane zmiany” prowadzący do ekranu propozycji. Pod polem lista wcześniejszych rozmów i podsumowań tygodnia. Bez sieci lub bez klucza AI panel pokazuje informację i nic poza tym.

### 3.12 Postępy

Cztery sekcje wybierane segmentem u góry:

- **Siła:** lista ćwiczeń z trendem e1RM (strzałka i wartość); dotknięcie otwiera wykres i wszystkie wykonania. Tygodniowe serie na partię.
- **Bieganie:** kilometraż tygodniowy (słupki), tempo biegów spokojnych, VDOT w czasie, aktualne tempa treningowe.
- **Raporty:** raport tygodnia (wykonane względem planu, serie na partię, rekordy, kilometraż, zmiana względem poprzedniego tygodnia) i raport bloku. Z włączonym trenerem AI raport tygodnia ma dodatkowo krótki komentarz.
- **Historia:** chronologiczna lista sesji; dotknięcie otwiera szczegóły z możliwością edycji. „Dodaj trening” pozwala wpisać sesję z dowolną datą.

### 3.13 Profil

Lista sekcji: Cele · Dostępność · Sprzęt i skoki obciążenia · Ograniczenia · Biblioteka ćwiczeń · Import biegów (integracje) · Trener AI (włącznik, limit, zużycie) · Dane (eksport, import, usuwanie) · Ustawienia (motyw, początek tygodnia) · O aplikacji (wersja, stan synchronizacji).

### 3.14 Onboarding

Sześć kroków, każdy mieści się na jednym ekranie, z paskiem postępu:

1. **Cele:** suwak siła ↔ bieganie; partie priorytetowe (maks. 3).
2. **Dostępność:** dni tygodnia; liczba treningów siłowych i biegowych; maksymalny czas; dwa treningi dziennie tak/nie.
3. **Siła:** staż; sprzęt.
4. **Bieganie:** poziom wyjściowy (wynik / swobodny bieg / zaczynam); obecny kilometraż; cel.
5. **Ograniczenia:** bolesne obszary, wykluczone ćwiczenia (można pominąć).
6. **Twój tydzień:** gotowy plan z akcjami „Zaczynamy” i „Popraw”.

### 3.15 Tryb dziennika (M1)

Do czasu włączenia programowania aplikacja działa jako dziennik. Różnice względem ekranów opisanych wyżej:

- **Dziś** zamiast dzisiejszej sesji z planu pokazuje listę „Moich treningów” (z informacją, kiedy ostatnio wykonany) oraz przyciski „Bieg” i „Inny trening”. Jedno dotknięcie otwiera sesję do wpisania. Pod spodem skrót tygodnia: liczba treningów, kilometraż, rekordy.
- **Plan** nazywa się w tym trybie **Treningi**: lista sesji do ułożenia i edycji (ćwiczenia, serie, zakresy). Start od gotowego szablonu podziału albo od pustej listy.
- **Sesja:** pola serii wypełnia wynik z poprzedniego razu. „✓ wszystkie serie” i „Wszystko zgodnie z planem” znaczą „jak ostatnio”. Nie ma pytania o samopoczucie ani „Dlaczego?”.
- **Postępy** działają w pełni: siła, bieganie (kilometraż, czas, tempo), raporty, historia, waga ciała.
- Przy pierwszym uruchomieniu zamiast kreatora jest jeden ekran: „Wybierz szablon” albo „Ułóż własne treningi”.

Przejście na programowanie (M2) nie zmienia sposobu wpisywania: te same ekrany dostają recepty i plan tygodnia.

## 4. Kluczowe przepływy

| Przepływ | Kroki | Dotknięcia |
|---|---|---|
| Start dzisiejszej sesji | Otwórz aplikację → Zacznij → (ocena samopoczucia) | 2 |
| Seria zgodna z planem | ○ | 1 |
| Seria z innym ciężarem | dotknij ciężaru → ± → Zapisz | 3 |
| Całe ćwiczenie zgodnie z planem | ✓ wszystkie serie | 1 |
| Cały trening po fakcie, zgodnie z planem | Wpisz → Wszystko zgodnie z planem → Zakończ → RPE → Zapisz | 5 |
| Zamiana ćwiczenia | ⋯ → Zamień → wybór → Tylko dziś | 4 |
| Zakończenie sesji | Zakończ → RPE → Zapisz | 3 |
| Potwierdzenie zaimportowanego biegu | Potwierdź → RPE | 2 |
| Ręczny wpis biegu | Wpisz wynik → dystans, czas → RPE → Zapisz | 4 + wpisywanie |
| Przeniesienie sesji | Plan → przeciągnij sesję | 1 gest |
| Przyjęcie propozycji bloku | Dziś → Propozycja → Przyjmij | 3 |

## 5. Stany systemowe

| Stan | Zachowanie |
|---|---|
| Brak sieci | Aplikacja działa normalnie. Wskaźnik synchronizacji pokazuje „oczekuje”. Funkcje sieciowe (trener, import) pokazują jedną linię informacji |
| Błąd synchronizacji | Wskaźnik w stanie ostrzeżenia; szczegóły i „Spróbuj ponownie” w Profilu. Nigdy okno modalne |
| Wygasła sesja logowania | Dane lokalne dostępne; baner „Zaloguj się, aby synchronizować” |
| Nowa wersja aplikacji | Baner „Dostępna aktualizacja · Odśwież”; ukryty podczas trwającej sesji treningowej |
| Pusta historia | Krótka zachęta i przycisk do pierwszej sesji |
| Wygasający klucz integracji | Informacja w Profilu i na „Dziś” na 14 dni przed terminem |

## 6. System wizualny

- **Motyw:** ciemny domyślnie, jasny w ustawieniach. Kolory jako zmienne semantyczne: tło, powierzchnia, tekst, tekst drugorzędny, akcent, sukces, ostrzeżenie, błąd.
- **Akcent:** jeden kolor dla głównej akcji na ekranie. Sukces (✓) ma osobny kolor. Stan nigdy nie jest przekazywany samym kolorem; zawsze towarzyszy mu ikona lub tekst.
- **Typografia:** czcionka systemowa. Liczby tabelaryczne (równa szerokość cyfr) w seriach i tabelach. Skala: 28 px (ciężar i powtórzenia w edycji), 20 px (liczby w wierszu serii, tytuły), 16 px (tekst), 13 px (opisy).
- **Siatka:** odstępy co 4 px; marginesy ekranu 16 px; wysokość wiersza serii 56 px.
- **Ruch:** krótkie przejścia paneli (do 200 ms); wyłączone przy systemowym ograniczeniu animacji.
- **Język:** polski, krótki, konkretny. Bez żargonu tam, gdzie jest polski odpowiednik („zapas” obok RIR, „wysiłek” obok RPE).
- **Formaty:** przecinek dziesiętny (82,5 kg), tempo jako 5:16 /km, czas jako 45:10, daty po polsku.

Komponenty bazowe: przycisk, karta, panel dolny, wiersz serii, krokowy selektor liczby (stepper), żeton wyboru (chip), pasek tygodnia, wiersz zmiany w propozycji, wykres liniowy i słupkowy, segment, baner.

## 7. Dostępność

- Kontrast tekstu co najmniej 4,5:1 w obu motywach.
- Wszystkie elementy interaktywne mają etykiety dla czytników ekranu.
- Rozmiar tekstu podąża za ustawieniem systemowym; układ wytrzymuje powiększenie do 130%.
- Pełna obsługa klawiaturą na komputerze.
