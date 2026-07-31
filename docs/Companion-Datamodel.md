# Companion Datamodel

## Filosofie

Companion is geen verzameling schermen.

Companion is een verzameling gebeurtenissen, objecten, relaties en analyses die samen inzicht geven in de gezondheid van de gebruiker.

Daarom wordt het datamodel niet opgebouwd vanuit de interface, maar vanuit de werkelijkheid.

De schermen van Companion zijn slechts verschillende vensters op dezelfde gegevens.

---

# 1. Persoon

De gebruiker van Companion.

De persoon staat centraal binnen het volledige systeem.

Een persoon beschikt onder andere over:

- persoonlijke instellingen
- gezondheidsprofiel
- gezondheidsdoelen
- lichaamskenmerken
- persoonlijke voorkeuren
- medicatieprofiel
- voedingsprofiel

Het systeem past zich aan de persoon aan, niet andersom.

---

# 2. Product

Alles wat gegeten, gedronken of ingenomen kan worden.

Voorbeelden:

- voedingsmiddelen
- dranken
- supplementen

Een product verandert pas in een gebeurtenis zodra het daadwerkelijk wordt geregistreerd.

---

# 3. Gebeurtenis (Event)

De gebeurtenis is het belangrijkste object binnen Companion.

Vrijwel alles wat de gebruiker registreert is een gebeurtenis.

Voor insuline geldt expliciet:

- `insulinEvents` is de primaire bron voor werkelijk toegediende insuline;
- `meal.totals.insulin` is een berekende insulineadviessnapshot;
- `meal.actualInsulin` blijft uitsluitend bestaan als legacy compatibility data
  en telt niet mee in het werkelijke dagtotaal.

Voor Creon blijven advies en werkelijke inname eveneens strikt gescheiden:

- `meal.totals.creon25` en `meal.totals.creon10` zijn berekende
  Creonadviessnapshots;
- `meal.actualCreon25`, `meal.actualCreon10` en `meal.creonTime` zijn de
  historische expliciete registratie van werkelijk ingenomen Creon binnen een
  maaltijd;
- generieke supplementevents worden niet automatisch als Creoninname geteld;
- een toekomstig expliciet Creon-intake/eventmodel valt buiten het huidige
  datamodel en buiten Sprint 1A.5.

Voorbeelden:

- maaltijd
- insuline
- glucosemeting
- glucoseboost
- beweging
- supplement
- medicatie
- stoelgang
- notitie
- slaap (toekomst)
- stress (toekomst)
- pijnscore (toekomst)
- fysiotherapie (toekomst)

Elke gebeurtenis bevat minimaal:

- datum
- tijd
- type
- context

Alle gebeurtenissen worden uiteindelijk opgenomen in één chronologische tijdlijn.

---

# 4. Tijd

Tijd verbindt alle gebeurtenissen.

Companion werkt daarom niet met losse schermen, maar met één centrale tijdlijn waarop alle gebeurtenissen samenkomen.

Deze tijdlijn vormt de basis voor registratie, analyse, planning en coaching.

---

# 5. Analyse

Analyse ontstaat uit meerdere gebeurtenissen.

Analyse wordt niet ingevoerd.

Analyse wordt automatisch opgebouwd uit de samenhang tussen gebeurtenissen.

Voorbeelden:

- patronen herkennen
- trends ontdekken
- afwijkingen signaleren
- verbanden leggen
- voorspellingen maken

---

# 6. Gezondheidsdoelen

Gezondheidsdoelen vormen de reden waarom Companion bestaat.

### Algemene gezondheidsdoelen

- Gezond gewicht bereiken of behouden
- Betere glucoseregulatie
- Sportprestaties verbeteren
- Energie verbeteren
- Vasten ondersteunen
- Een gezondere leefstijl ontwikkelen

### Medische gezondheidsdoelen

- Ondersteuning tijdens een medische behandeling
- Ondersteuning bij herstel na een operatie
- Ondersteuning bij chronische aandoeningen
- Ondersteuning bij medicatiegebruik
- Ondersteuning bij voedingsgerelateerde aandoeningen
- Ondersteuning tijdens revalidatie

### Persoonlijke gezondheidsdoelen

Iedere gebruiker kan daarnaast volledig eigen gezondheidsdoelen definiëren.

Companion ondersteunt de gebruiker bij het volgen van de voortgang richting deze doelen.

---

# 7. Kennis

Companion leert.

Niet van één gebeurtenis, maar van alle gebeurtenissen samen.

Deze kennis vormt uiteindelijk de basis voor:

- persoonlijke inzichten
- coaching
- adviezen
- voorspellingen
- ondersteuning van de gebruiker en zijn of haar zorgverleners

---

# Relaties binnen Companion

Persoon

↓

registreert

↓

Gebeurtenissen

↓

bestaan uit

↓

Producten
Medicatie
Beweging
Metingen
Notities

↓

vormen samen

↓

Analyse

↓

leidt tot

↓

Inzicht

↓

Leren

↓

Bijsturen

↓

Gezondheidsdoelen bereiken

---

# Belangrijk uitgangspunt

Companion is geen diabetes-app.

Companion is geen voedingsapp.

Companion is geen sportapp.

Companion is een modulair gezondheidssysteem dat mensen helpt hun gezondheid, behandeling en herstel beter te begrijpen door alle relevante gebeurtenissen in samenhang vast te leggen, te analyseren en om te zetten in bruikbare inzichten.

### Training plannen en uitvoeren

`trainingPlanEvents` zijn uitsluitend geplande trainingen. `movementEvents` zijn
werkelijk uitgevoerde en geregistreerde beweegmomenten. Een trainingsplan wordt
niet automatisch omgezet in beweging en telt niet mee als uitgevoerde activiteit.

`sportSupplementPlanEvents` zijn geplande supplementinnames rond sport of
training. Ze kunnen met `trainingPlanId` aan een training gekoppeld zijn, maar
blijven zelfstandige planning. `supplementEvents` zijn werkelijk geregistreerde
innames. Een supplementplanning wordt nooit automatisch als inname geregistreerd.

Werkelijke uitvoering blijft een apart event. Een `movementEvent` kan via
`trainingPlanId` verwijzen naar de oorspronkelijke trainingsplanning. Een
`supplementEvent` kan via `sportSupplementPlanId` verwijzen naar de oorspronkelijke
supplementplanning. De status uitgevoerd/ingenomen wordt uit deze relaties
afgeleid en wordt niet als tweede statusveld in de planning opgeslagen.

De gebruiker bepaalt zijn of haar gezondheidsdoelen.

Companion ondersteunt de weg daar naartoe.
# Geplande trainingsstructuur

Een `trainingPlanEvent` is uitsluitend een geplande training. De bestaande
velden `id`, `type`, `eventTime`, `title`, `trainingType`, `durationMinutes`,
`note` en `createdAt` blijven geldig. `exercises` is een optionele lijst; een
legacytraining zonder deze lijst blijft een volwaardig trainingsplan.

Een item in `trainingPlanEvent.exercises[]` heeft minimaal `id` en `name`.
Ondersteunde optionele planningsvelden zijn `section`, `order`, `sets`,
`repsMin`, `repsMax`, `weight`, `weightUnit`, `tempo`, `restSecondsMin`,
`restSecondsMax`, `intensityType`, `rir`, `rpe`, `toFailure` en `note`.
Onbekende toekomstige velden worden bij normaliseren, bewerken, verplaatsen,
sync en backup/herstel behouden.

Een `movementEvent` blijft de werkelijke uitvoering op trainingsniveau.
Geplande gewichten, sets en herhalingen zijn geen prestaties en mogen niet als
werkelijke analyse-input worden gebruikt. Uitgevoerde sets en herhalingen per
oefening vallen buiten S3.1.

De afzonderlijke oefeningsvelden zijn bewust geschikt voor toekomstige
analyse, trainersmonitoring en print/PDF zonder vrije notitietekst te hoeven
parsen.
