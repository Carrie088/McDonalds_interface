# Kiosk – interfejs A (wersja wyjściowa)

Odtworzenie oryginalnego kiosku bez zmian — **wersja A** badania. Wersja B (z ulepszeniami dostępności) to osobny projekt `interfejs_B`.
Panel prowadzącego ma wersję ustawioną na stałe na **A**, więc pliki zdarzeń zawsze mają końcówkę `_A`.

Ekran 9:16 (projekt w 1080×1920, automatycznie skalowany do okna).

## Uruchomienie

```
npm install
npm run dev
```

Otwórz http://localhost:5173 (F11 = pełny ekran).

## Ekrany
1. Ekran startowy (pokaz slajdów) → 2. Na miejscu / na wynos + język →
3. Menu (kategorie, nowości, okno produktu z personalizacją i zestawami) →
4. Twoje zamówienie (ilości, darowizna) → 5. Płatność (symulacja terminala) → 6. Numer zamówienia.

Po 60 s bezczynności pojawia się okno „Potrzebujesz więcej czasu?”.
Przycisk „Dostępność” przesuwa interfejs w dół ekranu.

## Edycja menu
Produkty, ceny i kategorie: `src/data.js`. Teksty (PL/EN/UK): `src/i18n.js`.
Obrazki są emoji – możesz je zamienić na zdjęcia (np. `<img>` w `Menu.jsx` / `ProductModal.jsx`).

## Rejestr zdarzeń (badanie)
Format zgodny ze słownikiem `PUN_slownik_zmiennych.csv` (plik PUN_zdarzenia):
jeden plik na uczestnika, `zdarzenia/PUN_zdarzenia_I06_P01_A.csv`, UTF-8 z BOM, separator `;`.
Scenariusze S1, S2, S3 dopisują się kolejno do tego samego pliku.

Po uruchomieniu kiosku najpierw pokazuje się **panel prowadzącego**: numer interfejsu, kod uczestnika
(P01–P99), kolejność (AB/BA) i pierwszy scenariusz. Panel pokazuje nazwę pliku, ostrzega,
gdy plik tego uczestnika i wersji już istnieje (nowa sesja dopisze się na końcu), i sprawdza skalowanie systemu.
„Uruchom kiosk” włącza pełny ekran i dopiero wtedy zaczyna się rejestrowanie.
Pola można wypełnić z adresu, np. `?interfejs=6&uczestnik=P02&kolejnosc=BA`.

Sterowanie przez prowadzącego (klawiatura):
- `1`, `2`, `3` – start scenariusza S1/S2/S3 (kiosk wraca na ekran startowy),
- `0` – przerwanie bieżącego scenariusza (`scenariusz_koniec`, sukces = 0),
- `T` – natychmiastowe ostrzeżenie o bezczynności (test limitu czasu),
- `Ctrl` + `Shift` + `A` – powrót do panelu prowadzącego (zapisuje plik).

Bez klawiatury scenariusz startuje pierwszym dotknięciem ekranu startowego (kolejny numer),
a kończy się potwierdzeniem zamówienia (sukces = 1). „Zacznij od nowa” i upływ limitu czasu
nie kończą scenariusza (limit czasu to wiersz `blad`), ale dopisują rejestr do pliku.

AOI (wspólna lista): `AOI_cel`, `AOI_wstecz`, `AOI_dostepnosc`, `AOI_blad` – atrybut `data-aoi`;
nazwa elementu – atrybut `data-log`. Do poprawnych współrzędnych: pełny ekran (F11) i skalowanie systemu 100%.
Zapis działa przy `npm run dev` i `npm run preview`.
