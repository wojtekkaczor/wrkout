# 01 · Wizja i wymagania biznesowe

## 1. Wizja

> Otwierasz appkę, widzisz dzisiejszy trening, robisz go i odhaczasz serie. Planowaniem, progresją i dopasowaniem do formy zajmuje się appka.

**wrkout** to prywatna aplikacja treningowa dla jednej osoby trenującej hybrydowo: siłownia (sylwetka, hipertrofia, ogólna sprawność) plus bieganie. Aplikacja sama układa plan, rozpisuje kolejne jednostki i dostosowuje je do wyników, progresu i samopoczucia. Użytkownik w każdej chwili może ręcznie zmienić wszystko, co zaplanowała.

Aplikacja jest planerem i dziennikiem, a nie stoperem. Służy do szybkiego wpisywania treningów, śledzenia progresu i raportów. Przerwy i czas treningu odmierza zegarek.

## 2. Problem

- Trening hybrydowy wymaga pogodzenia dwóch planów, które wzajemnie na siebie wpływają (ciężkie nogi kontra interwały, objętość biegowa kontra regeneracja).
- Dostępne aplikacje robią dobrze albo siłownię, albo bieganie. Nie planują obu razem.
- Arkusze i notatki wymagają ręcznego liczenia progresji i przepisywania wyników.
- Aplikacje „trenerskie” mają zbyt wiele ekranów i ustawień. Obsługa aplikacji zabiera uwagę, która powinna iść w trening.

## 3. Użytkownik

Jedna osoba: właściciel aplikacji.

| Cecha | Opis |
|---|---|
| Cel siłowy | Sylwetka i hipertrofia, do tego ogólna sprawność |
| Cel biegowy | Regularne bieganie w ramach treningu hybrydowego (konkretny cel ustawiany w aplikacji) |
| Kontekst użycia | iPhone; serie wpisywane na siłowni między seriami albo zaraz po treningu; zegarek Garmin odmierza przerwy i rejestruje biegi |
| Oczekiwanie | Jak najmniej klikania i decyzji. Aplikacja ma mówić, co dziś robić i z jakim obciążeniem |
| Kompetencje | Zna ćwiczenia i podstawy treningu; nie chce sam liczyć progresji ani układać tygodnia |

## 4. Cele produktu

| ID | Cel | Jak rozpoznamy, że jest spełniony |
|---|---|---|
| BR-1 | **Jeden spójny plan hybrydowy.** Siła i bieganie planowane razem, z uwzględnieniem wzajemnego zmęczenia | Każdy tydzień ma rozpisane obie modalności; układ tygodnia spełnia reguły z [03 §7](03-silnik-treningowy.md#7-uk%C5%82ad-tygodnia-harmonogram-hybrydowy) |
| BR-2 | **Automatyczne programowanie.** Kolejne jednostki powstają bez udziału użytkownika | Po zakończeniu treningu następny ma już wyliczone ciężary, powtórzenia, tempa i dystanse |
| BR-3 | **Adaptacja do danych.** Plan reaguje na wyniki, progres, realizację planu i samopoczucie | Zmiana wyniku lub samopoczucia zmienia kolejną receptę w sposób opisany regułami; każdą decyzję da się podejrzeć („Dlaczego?”) |
| BR-4 | **Najszybsze możliwe wpisywanie**, na bieżąco i po fakcie | Seria zgodna z planem = 1 dotknięcie; całe ćwiczenie zgodne z planem = 1 dotknięcie; korekta ciężaru lub powtórzeń ≤ 3 dotknięcia; cały trening zgodny z planem wpisany po fakcie ≤ 5 dotknięć |
| BR-5 | **Prostota.** Aplikacja nie wymaga uwagi poza treningiem | Od otwarcia aplikacji do rozpoczęcia dzisiejszego treningu ≤ 2 dotknięcia; 4 zakładki; żadnych obowiązkowych formularzy poza onboardingiem |
| BR-6 | **Pełna kontrola ręczna.** Wszystko, co zaplanuje silnik, można zmienić | Edytowalne: ćwiczenia, serie, zakresy, ciężary, biegi, dni, długość bloku; silnik respektuje zmiany użytkownika |
| BR-7 | **Widoczny progres i raporty.** | Wykresy siły, objętości, kilometrażu i temp; rekordy; historia każdego ćwiczenia; raport tygodnia i bloku |
| BR-8 | **Niski koszt i brak utrzymania.** | Infrastruktura w darmowych planach; koszt AI z twardym limitem miesięcznym; wdrożenie jedną komendą |
| BR-9 | **Dane należą do użytkownika.** | Kopia w chmurze, eksport całości do pliku, możliwość usunięcia |

## 5. Miary sukcesu

| Miara | Cel |
|---|---|
| Dotknięcia: otwarcie aplikacji → start treningu | ≤ 2 |
| Dotknięcia: zalogowanie serii zgodnej z planem | 1 |
| Dotknięcia: wpisanie po fakcie całego treningu zgodnego z planem | ≤ 5 |
| Dotknięcia: potwierdzenie biegu zaimportowanego z zegarka | ≤ 2 |
| Czas obsługi aplikacji poza logowaniem serii | < 30 s na trening |
| Udział jednostek z automatycznie wyliczoną receptą | 100% |
| Ręczne kroki potrzebne do zaplanowania kolejnego tygodnia | 0 |
| Utracone dane treningowe | 0 |
| Działanie bez internetu (podgląd planu, logowanie, wyliczenie kolejnej jednostki) | Pełne |
| Koszt miesięczny | 0 zł infrastruktura + AI w ustawionym limicie (domyślnie 5 USD) |

## 6. Zakres

### W zakresie

- Onboarding: profil, cele, dostępność, sprzęt, poziom wyjściowy.
- Generowanie planu hybrydowego w blokach (mezocyklach) z deloadem.
- Automatyczne recepty: ciężar, powtórzenia, serie, RIR dla siły; typ, dystans, tempo dla biegu.
- Wpisywanie treningu siłowego (serie, ciężar, powtórzenia, RIR), na bieżąco albo po fakcie.
- Logowanie biegu: ręcznie, automatycznie z zegarka (Garmin Personal API), z pliku.
- Ocena samopoczucia i dopasowanie jednostki do gotowości.
- Ręczna edycja planu, treningów i ćwiczeń; własne ćwiczenia.
- Postępy: wykresy, rekordy, historia, raporty tygodnia i bloku.
- Trener AI: propozycje kolejnego bloku, podsumowania tygodnia, zmiany planu na życzenie opisane zwykłym tekstem.
- Synchronizacja między urządzeniami, kopia w chmurze, eksport i import.

### Poza zakresem

| Poza zakresem | Powód |
|---|---|
| Wielu użytkowników, funkcje społecznościowe | Użytek prywatny. Model danych nie blokuje dodania tego później |
| Dieta, kalorie, makroskładniki | Osobny problem; można dodać samą wagę ciała jako pomiar |
| Rejestrowanie biegu na żywo (GPS w aplikacji) | Robi to zegarek; PWA nie nadaje się do pracy w tle |
| Aplikacja w App Store / Google Play | PWA instalowana z przeglądarki wystarcza do użytku prywatnego |
| Filmy instruktażowe do ćwiczeń | Użytkownik zna ćwiczenia; wystarczy nazwa i krótka wskazówka |
| Porady medyczne i rehabilitacja | Aplikacja omija bolesne ćwiczenia, ale nie diagnozuje |
| Aplikacja na zegarek | Poza możliwościami PWA |
| Timer przerw, stoper treningu, sygnały dźwiękowe | Robi to zegarek (decyzja użytkownika) |
| Integracja ze Stravą | Decyzja użytkownika; zasady API Stravy i tak wykluczają trwałą historię i AI |

## 7. Zasady produktowe

Te zasady rozstrzygają spory projektowe w trakcie budowy.

1. **Dziś jest najważniejsze.** Ekran startowy pokazuje dzisiejszy trening i jeden duży przycisk.
2. **Domyślnie dobrze.** Każde pole ma sensowną wartość. Użytkownik potwierdza, a nie wypełnia.
3. **Jedno pytanie zamiast formularza.** Samopoczucie to jedno dotknięcie; szczegóły są opcjonalne.
4. **Silnik proponuje, człowiek decyduje.** Każdą receptę można nadpisać. Większe zmiany planu są propozycjami do zaakceptowania.
5. **Zmiana użytkownika jest ważniejsza niż automat.** Silnik nie cofa ręcznych zmian.
6. **Każda decyzja ma wyjaśnienie.** Przy recepcie dostępne jest krótkie „Dlaczego?”.
7. **Zawsze działa offline.** Sieć jest potrzebna tylko do synchronizacji, importu biegów i AI.
8. **Logi są źródłem prawdy.** Stan silnika wylicza się z historii, więc poprawienie starego wpisu poprawia też kolejne recepty.
9. **AI ustala strukturę, silnik liczy liczby.** Model językowy nie wylicza ciężarów ani temp i nigdy nie zapisuje zmian bez walidacji i zgody użytkownika.
10. **Mniej znaczy lepiej.** Funkcja, która wymaga dodatkowego ekranu lub decyzji przy każdym treningu, musi się obronić.

## 8. Założenia

Poniższe założenia przyjęto bez pytania. Każde da się zmienić w ustawieniach lub w trakcie budowy.

| ID | Założenie |
|---|---|
| A-1 | Interfejs po polsku; jednostki: kg, km, min/km. Kod i nazwy techniczne po angielsku |
| A-2 | Główne urządzenie to iPhone (aplikacja z ekranu głównego); komputer służy do przeglądania planu i postępów |
| A-3 | Tydzień treningowy zaczyna się w poniedziałek |
| A-4 | Zegarek Garmin rejestruje biegi i odmierza przerwy na siłowni |
| A-5 | Automatyczny import biegów idzie przez osobiste API Garmina; zapasowo import pliku i wpis ręczny |
| A-6 | Użytkownik ma lub założy: konto Cloudflare (hosting), klucz Garmin Personal API (import biegów), klucz Anthropic API (AI) |
| A-7 | Liczba dni treningowych, cel biegowy, staż i sprzęt są podawane w onboardingu, więc plan nie zakłada ich z góry |
| A-8 | Trening odbywa się na normalnie wyposażonej siłowni; sprzęt można zawęzić w profilu |

## 9. Ograniczenia

- **PWA na iPhonie:** brak synchronizacji w tle (dane synchronizują się przy otwarciu aplikacji); zainstalowana aplikacja ma osobny magazyn danych niż Safari. Szczegóły w [05 §9](05-architektura.md#9-pwa-mo%C5%BCliwo%C5%9Bci-i-ograniczenia).
- **Garmin:** osobiste API Garmina działa od października 2026 roku i wymaga sprawdzenia na żywym kluczu przed budową integracji. Klucz trzeba odnawiać najpóźniej co rok. Szczegóły w [08](08-integracje.md).
- **Strava:** pominięta decyzją użytkownika ([08 §6](08-integracje.md#6-strava)).
- **AI:** wymaga internetu i klucza API; aplikacja musi być w pełni używalna bez niego.

## 10. Ryzyka

| Ryzyko | Skutek | Ograniczenie |
|---|---|---|
| Silnik źle dobiera obciążenia | Zbyt lekko lub zbyt ciężko, utrata zaufania | Konserwatywne reguły, kalibracja w pierwszym tygodniu, szybka ręczna korekta, testy scenariuszowe silnika |
| Logowanie okaże się za wolne | Powrót do notatek | Projekt „1 dotknięcie na serię”, testy na telefonie od pierwszego kamienia milowego |
| Utrata danych lokalnych (czyszczenie przeglądarki, zmiana telefonu) | Utrata historii | Trwały magazyn przeglądarki, synchronizacja do chmury, eksport do pliku |
| AI proponuje nierozsądne zmiany | Ryzyko przeciążenia | AI zwraca tylko dane w ustalonym schemacie; walidator limitów; akceptacja użytkownika |
| Osobiste API Garmina okaże się nieprzydatne albo zmieni warunki | Brak automatycznego importu | Ręczny wpis i import pliku działają zawsze |
| Rozrost funkcji | Aplikacja przestaje być prosta | Zasady z §7, twardy zakres MVP w [09](09-plan-wdrozenia.md) |
| Koszt AI | Niespodziewany rachunek | Miesięczny limit po stronie serwera, licznik zużycia w ustawieniach |
| Kontuzja wynikająca z planu | Zdrowie | Limity objętości i przyrostu kilometrażu, reakcja na zgłoszony ból, deloady; aplikacja nie zastępuje lekarza |
