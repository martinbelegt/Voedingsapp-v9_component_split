# Companion Business Rules

## Doel

Business Rules beschrijven de functionele regels die altijd binnen Companion gelden, ongeacht de techniek, programmeertaal of gebruikersinterface.

Een Business Rule beschrijft **wat** waar is binnen Companion, niet **hoe** het technisch wordt uitgevoerd.

---

# Algemene regels

### BR-001

De persoon staat altijd centraal.

Alle gegevens binnen Companion behoren uiteindelijk toe aan één gebruiker.

---

### BR-002

Companion registreert gebeurtenissen.

Schermen zijn slechts hulpmiddelen om gebeurtenissen vast te leggen of te bekijken.

---

### BR-003

Elke gebeurtenis heeft altijd een datum en een tijd.

Een gebeurtenis zonder tijd bestaat niet binnen Companion.

---

### BR-004

Alle gebeurtenissen worden opgenomen in één centrale tijdlijn.

De tijdlijn vormt de chronologische waarheid van Companion.

---

### BR-005

Een gebeurtenis behoort altijd tot precies één gebeurtenistype.

Voorbeelden:

- maaltijd
- insuline
- glucose
- beweging
- supplement
- medicatie
- stoelgang
- notitie

---

### BR-006

Analyse wordt nooit handmatig ingevoerd.

Analyse ontstaat uitsluitend uit geregistreerde gebeurtenissen.

---

### BR-007

Companion bewaart de oorspronkelijke registratie.

Afgeleide berekeningen mogen de originele gegevens nooit overschrijven.

---

### BR-008

Registreren moet sneller zijn dan analyseren.

De gebruiker mag nooit onnodig veel handelingen hoeven uitvoeren om een gebeurtenis vast te leggen.

---

# Productregels

### BR-009

Een product bestaat onafhankelijk van een maaltijd.

---

### BR-010

Een product wordt pas onderdeel van de tijdlijn nadat het is geregistreerd als onderdeel van een maaltijd.

---

### BR-011

Een product kan meerdere eigenschappen bevatten.

Bijvoorbeeld:

- categorie
- merk
- producent
- voedingswaarden
- prijs (toekomst)
- leverancier (toekomst)

---

### BR-012

Een product kan favoriet zijn.

Favoriet zijn verandert niets aan de eigenschappen van het product.

---

# Maaltijdregels

### BR-013

Een maaltijd bestaat uit één of meerdere producten.

---

### BR-014

Een maaltijd is een gebeurtenis.

---

### BR-015

Een maaltijd kan aanleiding geven tot vervolggebeurtenissen.

Bijvoorbeeld:

- insuline
- Creon
- herinneringen
- analyses

---

# Analyse

### BR-016

Analyse ontstaat altijd uit meerdere gebeurtenissen.

---

### BR-017

Patronen worden automatisch herkend.

Zij worden nooit handmatig ingevoerd.

---

### BR-018

Adviezen zijn gebaseerd op gegevens.

Companion doet geen aannames zonder onderliggende gegevens.

---

# Gezondheidsdoelen

### BR-019

Iedere gebruiker bepaalt zijn of haar eigen gezondheidsdoelen.

---

### BR-020

Gezondheidsdoelen kunnen algemeen, medisch of persoonlijk zijn.

---

### BR-021

Companion ondersteunt de gebruiker bij het volgen van de voortgang richting gezondheidsdoelen.

Companion bepaalt deze doelen nooit zelf.

---

# Architectuur

### BR-022

Nieuwe functies moeten passen binnen het Manifest.

---

### BR-023

Nieuwe functies moeten passen binnen de Architectuur.

---

### BR-024

Nieuwe functies moeten gebruikmaken van bestaande componenten wanneer deze beschikbaar zijn.

---

### BR-025

Wanneer een nieuwe functie een nieuw patroon introduceert, wordt eerst het UI Fundament uitgebreid voordat de functie wordt gebouwd.

---

# Data

### BR-026

Registraties worden nooit verwijderd zonder expliciete actie van de gebruiker.

---

### BR-027

De gebruiker blijft eigenaar van zijn of haar gegevens.

---

### BR-028

Alle analyses moeten herleidbaar zijn naar geregistreerde gebeurtenissen.

---

# Toekomst

### BR-029

Companion moet uitbreidbaar zijn zonder bestaande functionaliteit te verstoren.

Nieuwe gebeurtenistypen moeten kunnen worden toegevoegd zonder het fundament aan te passen.

---

### BR-030

Companion ondersteunt de gebruiker bij het verkrijgen van inzicht.

Companion neemt geen medische beslissingen.

De uiteindelijke keuzes blijven altijd bij de gebruiker en zijn of haar zorgverleners.
