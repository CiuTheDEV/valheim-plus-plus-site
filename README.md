# Valheim ++ — strona i poradnik

Statyczny landing page przygotowany do GitHub Pages. Nie zawiera gry, modpaka ani narzędzi publikacji wydań.

## Lokalnie

Wymagane Node.js 22+ i npm. W tym folderze uruchom:

```powershell
npm ci
npm test
npm run build
npm run preview
```

Podgląd: http://127.0.0.1:4173. Wynik: `dist/`. Nie edytuj wygenerowanego HTML.

## Wygląd

Zasady wyglądu (tokeny, układ, zagospodarowanie przestrzeni, procedura zmian UI) są w `DESIGN.md`. Przeczytaj go przed każdą zmianą stylu lub układu.

## Gdzie zmieniać treść

- `landing.md` — opis paczki, launcher, trzy kroki i tematy pomocy. Zachowaj sekcje: O modpaku, Launcher, Jak zacząć?, Pomoc.
- `poradnik/*.md` — osobny poradnik. Numer nazwy określa kolejność; pierwszy nagłówek jest tytułem. Linki .md zamieniane są na .html.
- `assets/landing.css` — landing; `style.css` i `ux.css` — poradnik.
- `scripts/landing.mjs` — układ i galeria; `scripts/build.mjs` — generator.
- `assets/images/launcher-*.png` — rzeczywiste widoki launchera 1.0.1, bez kursora. Galeria pokazuje ekran główny, profile, mody, opis zmian, historię zmian, starsze wydania, kopie i naprawę. Autoplay jest domyślnie włączony; najechanie na zdjęcie, fokus klawiatury lub otwarcie powiększenia chwilowo go wstrzymują. Strzałki i kropki nie wyłączają autoplay na stałe. Przycisku pauzy nie ma; strzałki mają osobne miejsce poza obrazem.
- `assets/refinement.css` — wspólne wykończenie sekcji, galerii i poradnika; lokalny Cinzel służy tylko ozdobnej numeracji. Płynne przewijanie i animacje są domyślnie włączone zgodnie z założeniem projektu.
- Ruch na stronie: `assets/page-flow.js` (przejścia między stronami, we wszystkich przeglądarkach), `assets/reveal.js` (wejścia elementów przy przewijaniu), `assets/download-moment.js` (pieczęć, kruk i komunikat po kliknięciu „Pobierz launcher”; klatki kruka w `assets/images/raven-flight.webp`, arkusz 4×2). Przy ograniczonym ruchu zostają łagodniejsze wersje, nie brak ruchu.
- Lista modów (`assets/data/mods.mjs`, `mod-details.mjs`) pochodzi z `../Valheim ++/BepInEx/plugins`; po zmianie paczki zaktualizuj ją i licznik w `tests/mods.test.mjs`.
- Hero i emblemat pochodzą z launchera. Hero jest ilustracją, nie screenem rozgrywki.
- Widoki kopii i lokalizacji gry pochodzą z renderów istniejącego interfejsu przed konfiguracją; pozostałe zrzuty wykonano w działającym launcherze. Nie retuszowano kontrolek ani nie symulowano postępu instalacji.
- `docs/archive/` — zachowane wcześniejsze materiały, niepublikowane w dist.

Poradnik obejmuje instalację, aktualizacje, wybór wersji, kopie i rozwiązywanie problemów. Zachowano wcześniejsze adresy rozdziałów. Obrazy umieszczaj w assets/images, np. `![Baza](assets/images/baza.jpg)`. Build kopiuje tylko pliki WWW i obrazy, bez dokumentacji źródłowej.

## Automatyczne wydania

Po otwarciu strony skrypt odczytuje publiczne wydania CiuTheDEV/valheim-plus-plus bez logowania i tokenów. Rozdziela stabilny modpack, launcher i betę, porównuje numery X.Y.Z i sprawdza komplet załączników. Ignoruje drafty i stare aliasy stable. Beta nigdy nie zmienia głównego przycisku pobrania. Przycisk wskazuje EXE najwyższego kompletnego stabilnego launchera.

Build działa bez sieci: używa datowanej `assets/data/releases.json`. Przeglądarka zapisuje zweryfikowane dane w localStorage. Przy braku sieci lub limicie API pokazuje datę katalogu i link GitHub. Bez JavaScript działa zapisany changelog i pobieranie; pozostałe kanały sprawdzisz przez GitHub. Nowe wydania pojawiają się przy otwarciu strony z JavaScript bez przebudowy witryny.

Migawka: schema 1, fetchedAt (ISO), releases (publiczne rekordy API). Nie zapisuj draftów ani informacji o autorach. Aktualizacja migawki jest osobna od publikacji strony.

## Aktualizacja screenów launchera

Na Windows z .NET SDK 8, w folderze VH SITE:

```powershell
dotnet run --project scripts/capture-launcher -- .
npm test
npm run build
```

Generator używa bieżącego projektu `../LAUNCHER/ZRODLA/Desktop`. Tworzy 12 screenów PNG bez kursora: główne widoki 1920×1280 (w tym historia zmian i mody), okno wyboru profilu, okno „Wyślij raport” oraz okno błędu w ich własnych proporcjach, wszystkie w skali 2×. Zrzut „Wieści z północy” i opis modów to dane przykładowe z migawki. Korzysta z odizolowanego profilu i lokalnej migawki wydań. Nie uruchamia gry, nie pobiera paczki i nie zmienia instalacji użytkownika. Numery wydań są przykładowym stanem z migawki. SDK i źródła launchera są potrzebne tylko do ponownego wykonania screenów, nie do budowania ani działania strony na GitHub Pages.

## Publikacja GitHub Pages

1. Wgraj źródła tego folderu do własnego repozytorium strony z gałęzią main. Zachowaj `.github/workflows/pages.yml`, package.json i package-lock.json.
2. Nie wgrywaj node_modules ani dist. Nie dołączaj lokalnych katalogów publikacji launchera.
3. Settings → Pages → Source: GitHub Actions.
4. Workflow „Publikacja Valheim ++” wykonuje npm ci, testy, build i wysyła wyłącznie dist.
5. Sprawdź wynik Actions i adres w Settings → Pages.

Odnośniki lokalne są względne: obsługują domenę główną oraz /nazwa-repo/. Artefakt zawiera index.html i .nojekyll. Uprawnienia zapisu Pages są ograniczone do zadania deploy. Workflow przygotowano lokalnie; nie został w tym zadaniu uruchomiony na GitHubie.

[Oficjalna instrukcja własnych workflow GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
