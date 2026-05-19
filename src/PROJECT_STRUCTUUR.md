# Projectstructuur VoedingsApp

Dit bestand is bedoeld als Nederlandstalige kaart van de app.  
De codebestanden zelf hebben vaak Engelse namen, maar hieronder staat per onderdeel wat het doet.

---

## Hoofdbestand

### `App.js`

Centrale regie van de app.

`App.js` is niet meer bedoeld als plek waar alle logica staat.  
Het bestand koppelt vooral de verschillende onderdelen aan elkaar:

- actieve tab bijhouden
- hooks aanroepen
- services gebruiken
- handlers doorgeven aan componenten
- globale app-state combineren
- import/export-acties starten
- schermen/tabs tonen

Doel: `App.js` moet steeds meer een regisseur worden, niet de plek waar alle berekeningen en details staan.

---

## `components/`

Bevat zichtbare onderdelen van de app.

Componenten zijn vooral verantwoordelijk voor wat de gebruiker ziet en aanklikt.

### `MealTimersCard.js`

Kaart op het dashboard voor maaltijd-timers.

Hier kun je timers starten en actieve timers bekijken voor bijvoorbeeld:

- verzadiging
- eetpauze
- glucose opletten
- vertering / Creon

### `DashboardTab.js`

Hoofdscherm voor dagelijks gebruik.

Hier komen onder andere samen:

- maaltijdregels
- macro-overzicht
- Creon/enzymadvies
- snelle productkeuze
- favorieten
- opgeslagen maaltijden
- dag toevoegen

### `VoedingslijstTab.js`

Beheer van producten en voedingslijsten.

Hier kun je onder andere:

- producten bekijken
- producten toevoegen of wijzigen
- categorieën beheren
- GI/timing/absorptiegegevens beheren
- productlijsten/packs filteren
- productlijsten exporteren of verwijderen

### `GiTimingTab.js`

Scherm voor GI- en timinginformatie.

Bedoeld voor overzicht en beheer van:

- GI-klassen
- GI-waarden
- timingadvies
- persoonlijke timing
- absorptieprofielen

### `DailyTab.js`

Daglogboek en archief.

Hier worden maaltijden per datum opgeslagen en teruggekeken.

### `SettingsTab.js`

Instellingen van de app.

Hier staan instellingen voor onder andere:

- insulineberekening
- Creon/enzymfactoren
- drempelwaarden
- persoonlijke voorkeuren

### `TestLogSection.js`

Testlogboek.

Apart onderdeel voor het vastleggen van ervaringen na maaltijden, bijvoorbeeld:

- maaltijdomschrijving
- insuline
- Creon
- Bristol-score
- uitkomst
- notities

---

## `hooks/`

Hooks beheren state en opslag.

Een hook is een herbruikbaar stukje React-logica.  
In deze app gebruiken we hooks vooral voor gegevens die opgeslagen of beheerd moeten worden.

### `useMealTimers.js`

Beheert maaltijd-timers.

Taken:

- timers laden
- timers opslaan
- timer starten
- timer verwijderen
- alle timers wissen

### `useProducts.js`

Beheert de productlijst.

Taken:

- producten laden
- producten opslaan
- product toevoegen
- product wijzigen
- product verwijderen
- product opzoeken

### `useCategories.js`

Beheert categorieën.

Taken:

- categorieën laden
- categorieën opslaan
- categorie toevoegen
- categorie wijzigen
- categorie verwijderen
- categorie opzoeken

### `useSettings.js`

Beheert instellingen.

Taken:

- instellingen laden
- instellingen opslaan
- instellingen wijzigen
- instellingen resetten

### `useMealRows.js`

Beheert de huidige maaltijdregels.

Taken:

- maaltijdregels laden
- maaltijdregels opslaan
- veilige setRows gebruiken
- rijen normaliseren
- lege laatste rij bewaken

### `useSavedMeals.js`

Beheert opgeslagen maaltijden.

Taken:

- maaltijd opslaan
- maaltijd laden
- maaltijd verwijderen
- maaltijd overschrijven

### `useDailyLog.js`

Beheert daglogboek / archief.

Taken:

- maaltijden per datum opslaan
- dagtotalen berekenen
- datums sorteren
- dag wissen

### `useTestLog.js`

Beheert het testlogboek.

Taken:

- testlog laden
- testlog opslaan
- testlogregel toevoegen
- testlogregel verwijderen
- formulier resetten

---

## `services/`

Services bevatten het “denkwerk” van de app.

Een service bevat zo min mogelijk schermlogica.  
De bedoeling is: componenten tonen iets, services rekenen of bereiden data voor.

### `timerService.js`

Logica rond maaltijd-timers.

Taken:

- timertypes definiëren
- timerduur-opties beheren
- nieuwe timer maken
- resterende tijd berekenen
- eindtijd formatteren
- timers sorteren

### `mealTotalsService.js`

Berekent maaltijdtotalen.

Hierin zit logica voor onder andere:

- koolhydraten
- eiwit
- vet
- kcal
- insuline-inschatting
- gewogen GI
- timingadvies
- persoonlijke timing
- vertraagde koolhydraten
- Creon/enzymbelasting
- dominante enzymbron

### `giService.js`

GI-logica.

Taken:

- GI-waarde omzetten naar GI-klasse
- fallback-GI bepalen
- maaltijd-GI-label maken

### `timingService.js`

Timinglogica.

Taken:

- basis timingadvies bepalen
- vetvertraging toepassen
- persoonlijke timing analyseren
- timingverschillen signaleren

### `creonService.js`

Creon-hulpfuncties.

Taken:

- Creon-modus labelen
- Creon-gerelateerde presentatie ondersteunen

De hoofdcalculatie zelf zit nog in:

### `creonCalculator2.js`

Berekent de Creon/enzym-uitkomst op basis van maaltijd en instellingen.

### `mealSnapshotService.js`

Maakt een momentopname van een maaltijd.

Wordt gebruikt voor:

- maaltijd opslaan
- maaltijd toevoegen aan daglogboek
- relevante totalen bewaren

### `mealRowStateService.js`

Beheert pure logica rond maaltijdregels.

Taken:

- rij toevoegen
- rij verwijderen
- maaltijd leegmaken
- product snel toevoegen aan maaltijd
- bestaande rij bijwerken

### `productFormService.js`

Beheert productformulier-data.

Taken:

- nieuw productformulier maken
- formulier vullen bij bewerken van product
- standaardwaarden bewaken

### `productPayloadService.js`

Zet productformulier om naar productdata.

Taken:

- invoer omzetten naar opslagvorm
- packName bepalen
- bestaand product vinden
- overschrijven bevestigen

### `productPackService.js`

Logica rond productlijsten/packs.

Taken:

- basisproducten verwijderen
- producten uit specifieke lijst verwijderen

Later kan hier meer pack-logica bij komen.

### `backupService.js`

Logica rond backup, export en import.

Taken:

- volledige backup snapshot maken
- backup-bestandsnaam maken
- JSON-bestand downloaden
- pack-export maken
- pack-export bestandsnaam maken
- herkennen of bestand een volledige backup is
- herkennen of bestand een product-import is
- importproducten normaliseren
- backupgegevens veilig herstellen via helperfuncties

### `idService.js`

Maakt unieke id’s.

Voorbeelden:

- product-id
- maaltijd-id
- testlog-id

### `scrollService.js`

Scroll-hulpfunctie.

Wordt gebruikt om na acties automatisch naar een relevante maaltijdregel te scrollen.

### `productHelpers.js`

Hulpfuncties voor producten en categorieën.

Taken:

- categorie opzoeken
- categorienaam ophalen
- categoriekleur ophalen
- product opzoeken

### `uiHelpers.js`

Hulpfuncties voor labels en presentatie.

Taken:

- GI-meta ophalen
- timinglabel ophalen
- timingminuten ophalen
- absorptieprofiel-meta ophalen

---

## `data/`

Bevat vaste startdata, standaardwaarden en keuzelijsten.

### `starterProducts.js`

Startlijst met producten.

### `starterCategories.js`

Startlijst met categorieën.

### `giStarterData.js`

Startdata voor GI-informatie.

### `defaults.js`

Standaardinstellingen van de app.

### `appOptions.js`

Vaste keuzelijsten, zoals:

- GI-klassen
- timingopties
- absorptieprofielen
- enzym-trigger-presets
- Bristol-score opties

### `categoryColors.js`

Fallbackkleuren voor categorieën.

### `mealMoments.js`

Vaste maaltijdmomenten.

Voorbeelden:

- ontbijt
- lunch
- diner
- snack
- sport
- neutraal

### `productDefaults.js`

Standaardwaarden voor een nieuw product.

---

## `utils/`

Algemene kleine hulpfuncties.

### `numberUtils.js`

Getalhulpfuncties.

Taken:

- komma’s en punten in invoer verwerken
- tekstinvoer veilig omzetten naar getallen

---

## Huidige ontwerpregel

Nieuwe functionaliteit voegen we bij voorkeur niet rechtstreeks groot toe aan `App.js`.

In plaats daarvan:

1. data/config in `data/`
2. berekeningen in `services/`
3. opslag/state in `hooks/`
4. zichtbare schermen in `components/`
5. kleine algemene helpers in `utils/`

Zo blijft de app beter te begrijpen, veiliger uit te breiden en makkelijker te testen.