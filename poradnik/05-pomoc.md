# Problemy z uruchomieniem

Znajdź swój problem i sprawdź zalecane rozwiązanie. Zanim zmienisz pliki, zachowaj komunikat błędu i własne dane.

## Launcher nie znajduje gry

1. Otwórz **Ustawienia → Gra**.
2. Kliknij **Znajdź automatycznie**.
3. Jeśli to nie pomogło, kliknij **Wybierz plik…** i wskaż `valheim.exe` z folderu gry.
4. Kliknij **Zapisz ustawienia**.

![Ustawienia lokalizacji gry z automatycznym wyszukiwaniem i ręcznym wyborem pliku](assets/images/launcher-game.png)

Folder znajdziesz w Steam: Valheim → Zarządzaj → Przeglądaj pliki lokalne. Wybierz plik gry, nie skrót do Steam.

## Pobieranie lub aktualizacja zgłasza błąd

Zapisz dokładny komunikat. Zamknij grę, sprawdź wolne miejsce i połączenie, a następnie ponownie sprawdź paczkę przez **Wieści z północy**.

Gdy GitHub jest niedostępny, spróbuj później. Nie przełączaj na starszą wersję tylko po to, aby ominąć błąd pobierania.

## Problem pojawił się po aktualizacji

Otwórz **Ustawienia → Kopie zapasowe** i sprawdź dostępny przycisk **Cofnij do…**. Przed przywróceniem zamknij grę.

![Kopie paczki i cofanie poprzedniej aktualizacji](assets/images/launcher-backups.png)

Po przywróceniu uruchom grę i sprawdź, czy problem występuje nadal. [Szczegóły kopii i przywracania →](04-wspolna-gra.md)

## Brakuje plików lub zmieniałeś paczkę ręcznie

1. Zamknij Valheim i otwórz **Ustawienia → Gra**.
2. Kliknij **Sprawdź i napraw paczkę**.
3. Poczekaj na wynik. Jeśli są braki, przeczytaj listę i kliknij **Uzupełnij brakujące pliki**.
4. Sprawdź raport po zakończeniu.

![Naprawa paczki: lista brakujących plików przed ich uzupełnieniem](assets/images/launcher-repair.png)

Launcher pobiera archiwum zainstalowanej wersji, więc potrzebuje internetu. Uzupełnia tylko braki: nie nadpisuje istniejących konfiguracji, nie usuwa dodatkowych plików i pomija chronione dane gracza. Nie sprawdza zawartości istniejących plików — zmieniony lub uszkodzony plik nie zostanie uznany za brak.

Jeśli paczka jest kompletna, ale problem trwa, sprawdź własne mody i konfiguracje albo wróć do poprzedniego [wydania](03-mody.md). Nie kasuj danych w ciemno.

## Nie możesz dołączyć do serwera

Porównaj numer modpaka z wersją wymaganą przez serwer. Sprawdź również zgodność wersji Valheim oraz wymagania administratora. Samo używanie „najnowszej” paczki nie gwarantuje zgodności ze starszym serwerem.

## Co dołączyć do zgłoszenia

Jeśli launcher wyświetli okno błędu:

1. Kliknij **Kopiuj raport**.
2. Wklej raport do wiadomości ze zgłoszeniem.
3. Dopisz, co kliknąłeś przed błędem i czy wcześniej działało.

![Okno błędu launchera z przyciskiem Kopiuj raport i rozwijanymi szczegółami technicznymi](assets/images/launcher-error.png)

Raport zawiera wersje i informacje techniczne potrzebne do sprawdzenia błędu. Nie zawiera surowej treści wyjątku ani lokalnych ścieżek. Przycisk tylko kopiuje tekst — niczego sam nie wysyła. Jeśli kopiowanie się nie uda, rozwiń **Szczegóły techniczne** i skopiuj tekst ręcznie.

Jeżeli nie pojawiło się okno z raportem, dołącz komunikat lub screen. W zgłoszeniu przydadzą się również:

- Numer paczki widoczny na ekranie głównym.
- Dokładny komunikat lub screen błędu.
- Co kliknąłeś przed błędem i czy wcześniej działało.
- Informację, czy dodawałeś własne mody lub zmieniałeś konfigurację.

Przed udostępnieniem screena lub logów usuń prywatne dane, np. nazwę konta i hasła serwera. Materiały przekaż autorowi paczki, **Bullet**, w miejscu, w którym kontaktujesz się w sprawie projektu.
