# Companion Documentatie

Welkom bij de documentatie van Companion.

Deze map bevat de architectuur, ontwerpkeuzes en langetermijnvisie van
het project. Nieuwe functionaliteit wordt bij voorkeur eerst hier
beschreven voordat deze wordt gebouwd.

------------------------------------------------------------------------

# Leesvolgorde

## 1. COMPANION_MANIFEST.md

Het belangrijkste document van Companion.

Beschrijft onder andere:

-   visie
-   ontwerpprincipes
-   architectuur
-   ontwikkelregels
-   UX-uitgangspunten
-   technische afspraken

Iedere ontwikkelaar leest dit document als eerste.

------------------------------------------------------------------------

## 2. COMPANION_SUPPLEMENT_DATA_MODEL.md

De blauwdruk voor de supplementencatalogus.

Beschrijft onder andere:

-   gegevensmodel
-   productstructuur
-   werkzame stoffen
-   veiligheid
-   kennis
-   persoonlijke gegevens
-   relaties tussen gegevens

Dit document vormt later ook de basis voor Medicatie en (gedeeltelijk)
Voeding.

------------------------------------------------------------------------

## 3. COMPANION_FUTURE_FIELDS.md

Verzamelplaats voor toekomstige uitbreidingen.

Nieuwe ideeën worden hier eerst vastgelegd. Pas na beoordeling worden
velden toegevoegd aan het definitieve datamodel.

------------------------------------------------------------------------

# Ontwikkelprincipe

**Documentatie is leidend. Code volgt de architectuur, niet andersom.**

Nieuwe functionaliteit volgt bij voorkeur deze volgorde:

1.  Idee
2.  Documentatie
3.  Architectuur
4.  Implementatie
5.  Testen
6.  Praktijkervaring
7.  Verbeteren

------------------------------------------------------------------------

# Architectuur

``` text
Catalogi
    ↓
Routines
    ↓
Tijdlijn
    ↓
Mijn dossier
    ↓
Analyse
```

Catalogi vormen het hart van Companion.

Vanuit de catalogi worden later relaties gelegd tussen onder andere:

-   Voeding
-   Supplementen
-   Medicatie
-   Symptomen
-   Bloedwaarden
-   Sport
-   Diabetes
-   Kenniscentrum
-   Community

Companion registreert gegevens, ondersteunt analyses en helpt gebruikers
patronen te herkennen.

Companion stelt geen medische diagnoses.

------------------------------------------------------------------------

## Catalogusarchitectuur

De catalogusarchitectuur van Companion is het centrale ontwerpprincipe voor
hoe gebruikerstoegang, selectie en uitvoering samenkomen.

-   Catalogi zijn primaire toegangspunten naar bouwstenen. Ze bieden een
    uniforme selectielaag voor voeding, supplementen, medicatie, oefeningen,
    kennis en persoonlijke items.
-   Een catalogus is geen informatie- of productblad. Het is een snelle
    selectielijst die in één scherm de context behoudt en alleen detailinformatie
    toont wanneer de gebruiker daar expliciet om vraagt.
-   Consistentie wordt afgedwongen door het Catalog Framework:
    toolbar, filterbalk, lijstregels, actiebalk, detailweergave,
    toetsenbordnavigatie en visuele maten zijn herbruikbaar tussen domeinen.
-   Domeinspecifieke verschillen blijven configuratiegedreven. Dit voorkomt
    aparte UX-patronen voor dezelfde onderliggende workflow.

### Persoonlijke vs. referentiecatalogi

-   Referentiecatalogi bevatten wereldwijde product- en kennisinformatie.
-   Persoonlijke catalogi bevatten favorieten, eigen doseringen, notities,
    routines en persoonlijke varianten.
-   De architectuur houdt deze lagen gescheiden, maar maakt ze tegelijkertijd
    direct koppeltbaar in de gebruikersstroom.

### Relaties met de rest van Companion

-   Catalogi leveren onderdelen voor routines en samengestelde objecten.
-   Een geselecteerd item kan rechtstreeks naar de tijdlijn worden gezet,
    toegevoegd aan een routine of opgeslagen voor later gebruik.
-   De catalogus is daarmee het verbindende element tussen selectie,
    uitvoering en historische analyse.

### Toepassing in supplementen en toekomstige domeinen

-   De supplementencatalogus gebruikt dezelfde basisarchitectuur als voeding.
-   Het document `COMPANION_SUPPLEMENT_DATA_MODEL.md` definieert de product- en
    veiligheidsstructuur die door het Catalog Framework wordt benut.
-   Nieuwe domeinen zoals medicatie, sport en doelstellingen kunnen dezelfde
    catalogusstructuur gebruiken met eigen velden, filters en validaties.

------------------------------------------------------------------------

# Toekomst

De documentatie zal de komende jaren verder groeien.

Nieuwe onderwerpen krijgen indien nodig een eigen document, zodat het
project overzichtelijk en onderhoudbaar blijft.
