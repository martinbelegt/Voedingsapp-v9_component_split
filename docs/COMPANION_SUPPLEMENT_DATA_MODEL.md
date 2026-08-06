# COMPANION_SUPPLEMENT_DATA_MODEL

## Doel

Dit document beschrijft de langetermijnarchitectuur van supplementen,
medicatie en -- waar passend -- voeding binnen Companion.

## Ontwerpprincipes

-   Achterwaartse compatibiliteit.
-   Scheiding tussen product-, kennis- en persoonlijke gegevens.
-   Uitbreidbaar zonder grote migraties.
-   Relaties zijn belangrijker dan losse velden.

## Structuur

### Identiteit

-   Companion ID
-   Naam
-   Merk
-   Productlijn
-   Fabrikant
-   EAN (toekomst)
-   BestelLink
-   Categorie
-   Subcategorie

### Product

-   Vorm
-   Verpakking
-   Netto inhoud
-   Portiegrootte
-   Porties per verpakking

### Werkzame stoffen

-   Naam
-   Vorm
-   Hoeveelheid
-   Eenheid
-   Standaardisatie
-   Bron

### Gebruik

-   RI
-   UL
-   Fabrikantadvies
-   Aanbevolen gebruik
-   Tijdstip
-   Met maaltijd / nuchter

### Veiligheid

-   Bijwerkingen
-   Interacties
-   Contra-indicaties
-   Waarschuwingen

### Kennis

-   Bronnen
-   Literatuur
-   Community-notities

### Persoonlijke laag

-   Actief
-   Favoriet
-   Routine
-   Eigen dosering
-   Eigen notities

## Relaties

Voeding, supplementen, medicatie, symptomen, sport en doelen worden
later via relaties gekoppeld. Analyses tonen patronen, geen medische
diagnoses.
