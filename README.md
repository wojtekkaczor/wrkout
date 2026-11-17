# wrkout

Prywatna aplikacja do treningu hybrydowego: siłownia i bieganie w jednym planie. Aplikacja sama programuje kolejne jednostki na podstawie celów, wyników i samopoczucia; logowanie serii zajmuje jedno dotknięcie, a każdy element planu można zmienić ręcznie.

**Stan projektu:** specyfikacja gotowa do akceptacji; kod jeszcze nie powstał.

## Dokumentacja

Pełna specyfikacja jest w katalogu [`docs/`](docs/README.md):

- [Wizja i wymagania biznesowe](docs/01-wizja-i-wymagania-biznesowe.md)
- [Wymagania funkcjonalne](docs/02-wymagania-funkcjonalne.md)
- [Silnik treningowy](docs/03-silnik-treningowy.md)
- [UX i UI](docs/04-ux-ui.md)
- [Architektura](docs/05-architektura.md)
- [Model danych i synchronizacja](docs/06-model-danych.md)
- [Trener AI](docs/07-trener-ai.md)
- [Integracje](docs/08-integracje.md)
- [Plan wdrożenia](docs/09-plan-wdrozenia.md)

## W skrócie

- **Forma:** PWA (React, TypeScript), instalowana na telefonie, działa offline.
- **Planowanie:** deterministyczny silnik reguł na urządzeniu; opcjonalny trener AI proponuje zmiany struktury planu.
- **Dane:** lokalnie w IndexedDB, synchronizowane do Cloudflare D1.
- **Serwer:** jeden Cloudflare Worker (pliki aplikacji, API, import biegów, pośrednik AI).
