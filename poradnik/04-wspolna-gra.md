# Kopie i dane gracza

Kopia launchera obejmuje paczkę: mody i konfiguracje. Światy i postacie zabezpiecz osobno — przywrócenie paczki nie cofa zapisów gry.

## Automatyczne kopie paczki

Przy aktualizacji launcher automatycznie zabezpiecza poprzednią paczkę. Nie musisz tworzyć kopii ręcznie. Pierwsza instalacja nie ma wcześniejszej wersji do przywrócenia.

![Cofnięcie aktualizacji i automatyczne kopie chronionych danych gracza](assets/images/launcher-backups.png)

Poprzednia paczka będzie dostępna pod przyciskiem **Cofnij do…** w **Ustawienia → Kopie zapasowe**.

## Historyczne pełne kopie

Jeżeli masz pełne kopie utworzone przez starszy launcher, mogą pojawić się w sekcji **Przywracanie kopii**. Zamknij grę, wybierz kopię z listy i kliknij **Przywróć**. Sprawdź numer wersji przed potwierdzeniem. Nowy launcher nie tworzy ich ręcznie.

Jeżeli lista jest pusta, nie ma kopii do przywrócenia. Nie usuwaj aktywnej paczki, aby „odblokować” tę opcję.

## Cofnij ostatnią aktualizację

W tej samej zakładce jest przycisk **Cofnij do…**, z numerem dostępnej poprzedniej wersji. To szybki powrót do paczki sprzed aktualizacji, a nie przywrócenie świata.

Jeśli potrzebujesz innego wydania, skorzystaj z [wyboru wersji](03-mody.md).

Po cofnięciu automatyczne aktualizacje zostają wyłączone, żeby launcher od razu nie instalował ponownie cofniętego wydania. Bieżące chronione dane gracza pozostają zachowane.

## Historia danych gracza

Przed zmianą zainstalowanej paczki launcher tworzy osobną kopię plików objętych ochroną, np. znaczników mapy zapisanych przez mod.

- Zachowuje do **10 ostatnich kopii**, osobno dla stabilnej paczki i bety.
- Przy kolejnej udanej zmianie paczki najstarsza kopia wypada z historii.
- Aktualizacja nie nadpisuje ani nie usuwa chronionych plików aktywnej paczki.

W **Ustawienia → Kopie zapasowe** zobaczysz licznik. **Otwórz kopie danych** prowadzi do folderu historii; przy pustej historii przycisk jest nieaktywny.

### Odzyskaj konkretny plik

1. Zamknij grę.
2. Kliknij **Otwórz kopie danych** i wybierz potrzebną kopię.
3. W jej folderze `files` znajdź plik do odzyskania.
4. Zachowaj bieżący plik osobno, następnie skopiuj plik z kopii do odpowiadającego mu miejsca w aktywnej paczce, zachowując układ folderów.

To ręczne odzyskanie danych, nie cofnięcie całego modpaka. Jeśli nie wiesz, który plik przywrócić, skontaktuj się z autorem przed podmianą.

## Własne dane w modach

Niektóre mody zapisują dane gracza we własnych plikach, np. znaczniki mapy. Launcher zachowuje pliki objęte regułami ochrony paczki przy aktualizacjach i przywracaniu. Nie oznacza to ochrony dowolnego pliku, który sam dodasz do folderu modów.

Przed zmianą wersji skopiuj ważne własne pliki poza folder paczki. Do zapisów świata i postaci użyj zarządzania zapisami w grze; sprawdź również, czy korzystasz z zapisów lokalnych czy chmurowych.
