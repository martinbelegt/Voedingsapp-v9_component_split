# CompanionDateTimePicker-componentontwerp

## Doel

`CompanionDateTimePicker` is de centrale component voor het kiezen en wijzigen van een datum, tijd of lokaal datum-tijdmoment binnen Companion.

De component volgt de afspraken uit `Companion-DateTime-Standard.md`.

## Modi en output

| Modus | Output | Voorbeeld |
| --- | --- | --- |
| `date` | `YYYY-MM-DD` | `2026-06-25` |
| `time` | `HH:mm` | `09:15` |
| `datetime` | `YYYY-MM-DDTHH:mm` | `2026-06-25T09:15` |

Een onbekende modus valt veilig terug op `datetime`.

## Huidige props

| Prop | Betekenis |
| --- | --- |
| `mode` | `date`, `time` of `datetime`; standaard `datetime` |
| `value` | Huidige stringwaarde |
| `onChange` | Ontvangt een geldige nieuwe stringwaarde |
| `label` | Optioneel label en toegankelijke titel |
| `disabled` | Schakelt interactie uit |
| `compact` | Activeert de compacte vormgeving en standaard de compacte presentatie |
| `presentation` | Overschrijft de presentatie met `compact` of `expanded` |
| `defaultOpen` | Bepaalt de initiële open toestand en wordt gevolgd wanneer de prop wijzigt |
| `contextItems` | Contextregels voor de uitgebreide presentatie; compacte weergave verbergt ze |

## Presentaties

### Compact

De compacte presentatie toont één samenvattende knop. Bij openen:

- wordt de popover via een portal onder `document.body` geplaatst;
- sluit een klik of tap buiten de dialoog de picker;
- sluiten de knop `Klaar` en bestaande selectiemechanismen de picker;
- wordt de positie bij scrollen en resizen opnieuw berekend;
- blijft de breedte binnen de linker- en rechterrand van de viewport;
- opent de picker onder de trigger wanneer daar voldoende ruimte is en anders erboven;
- wordt de hoogte begrensd tot de beschikbare viewport;
- scrollt het paneel intern wanneer de inhoud niet volledig past;
- staan quick choices in een compact raster van maximaal drie kolommen.

De portal voorkomt dat een bovenliggende container de popover afknipt. De popover heeft een eigen hoge laagvolgorde zodat hij boven de mobiele header en gangbare modale lagen kan verschijnen.

### Uitgebreid

De uitgebreide presentatie toont het volledige bedieningspaneel direct in de normale documentstructuur. Contextregels kunnen hier zichtbaar zijn.

## Gedrag

- De component normaliseert de inkomende waarde voor de actieve modus.
- Alleen geldige datum- en tijdonderdelen worden via `onChange` teruggegeven.
- Quick choices bieden, afhankelijk van de modus, vandaag, gisteren, morgen en/of nu.
- Datum en tijd worden met steppers aangepast; de huidige implementatie gebruikt geen native date/time-input als primaire bediening.
- Opslag blijft de verantwoordelijkheid van de aanroepende flow.

## Centrale helpers

De huidige implementatie gebruikt:

- `formatDateForDisplay(value)`
- `formatTimeForDisplay(value)`
- `formatDateTimeForDisplay(value)`
- `combineDateAndTime(date, time)`
- `splitDateTime(value)`
- `normalizeDateTimeValue(value, mode)`

Deze helpers verzorgen weergave, combineren, splitsen en normaliseren van de afgesproken stringformaten.

## Toekomstig migratiewerk

`CompanionDateTimePicker` is beschikbaar en wordt al gebruikt, maar de applicatiebrede migratie is niet per definitie voltooid. Resterende schermen met lokale of native datum/tijdlogica worden per afzonderlijke werkset beoordeeld.

Bij migratie blijven bestaande opslagvelden, handlers en tijdsemantiek behouden, tenzij een expliciet gecontroleerde wijziging nodig is.
