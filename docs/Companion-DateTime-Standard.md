# Companion DateTime-standaard

## Doel

Datum en tijd vormen een gedeelde basis voor gebeurtenissen in Companion. Nieuwe en gemigreerde invoer gebruikt daarom één centrale component en één voorspelbaar waardeformaat.

Dit document onderscheidt de huidige standaard van de nog lopende migratie. Niet alle bestaande schermen voldoen al aan de gewenste eindsituatie.

## Huidige standaard

### Centrale component

Nieuwe en gemigreerde datum- en tijdinvoer gebruikt `CompanionDateTimePicker`.

De component ondersteunt drie modi:

- `date`
- `time`
- `datetime`

### Waarden

De picker ontvangt en retourneert strings:

- `date` → `YYYY-MM-DD`
- `time` → `HH:mm`
- `datetime` → `YYYY-MM-DDTHH:mm`

Voorbeeld:

```text
2026-06-25T09:15
```

Een waarde zonder tijdzone is een lokaal Companion-moment. Conversie naar een `Date` of een UTC-waarde gebeurt alleen waar een specifieke integratie dat nodig heeft.

### Weergave

Opgeslagen waarden en gebruikersweergave zijn gescheiden. Een opgeslagen waarde zoals `2026-06-25T09:15` kan bijvoorbeeld worden getoond als:

```text
25 jun 2026 · 09:15
```

Formattering en normalisatie verlopen via de centrale DateTime-helpers.

### Presentatie

De picker kent een compacte en een uitgebreide presentatie.

- Compact toont één samenvattend veld en opent een popover.
- Uitgebreid toont het bedieningspaneel direct.
- De compacte popover wordt naar `document.body` geporteerd, binnen de viewport geplaatst en opent boven of onder de trigger afhankelijk van de beschikbare ruimte.
- Bij beperkte hoogte scrollt de inhoud van de compacte picker intern.

Dezelfde waardeformaten gelden in beide presentaties.

## Regels voor nieuwe en gemigreerde code

- Gebruik `CompanionDateTimePicker` voor datum- en tijdkeuze.
- Gebruik de centrale helpers voor formatteren, combineren, splitsen en normaliseren.
- Bewaar pickerwaarden in het formaat dat bij de gekozen modus hoort.
- Voeg geen nieuwe directe `showPicker()`-aanroepen of losse native date/time-inputs toe wanneer de Companion-picker de use case ondersteunt.
- Combineer datum en tijd niet handmatig wanneer `combineDateAndTime` daarvoor beschikbaar is.

## Toekomstige migratierichting

De gewenste eindsituatie is dat alle relevante datum- en tijdinvoer via `CompanionDateTimePicker` en de centrale helpers loopt. Bestaande code kan nog oudere patronen bevatten, waaronder:

- native `date`, `time` of `datetime-local`-inputs;
- directe `showPicker()`-aanroepen;
- handmatig combineren of splitsen van datum- en tijdstrings;
- lokale formattering buiten de centrale helpers.

Deze patronen worden per werkset gecontroleerd en gemigreerd. Ze zijn dus migratiedoelen en geen bewijs dat de volledige applicatie al aan de standaard voldoet.

## Migratieaanpak

Migratie gebeurt stapsgewijs:

1. nieuwe code en aangepaste schermen gebruiken de centrale picker;
2. bestaande flows worden per logische werkset gecontroleerd;
3. opslag- en handlergedrag blijft tijdens migratie behouden;
4. oude lokale oplossingen worden pas verwijderd nadat hun gebruikers zijn gemigreerd en getest.

Een brede DateTime-refactor is geen voorwaarde om een afzonderlijke werkset veilig af te ronden.
