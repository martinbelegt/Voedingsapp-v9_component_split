# Companion Development Method

## Doel

Dit document beschrijft de standaard ontwikkelmethode voor Companion.

Het is geen technisch document, maar een werkwijzedocument.

## Filosofie

Companion wordt niet feature-first ontwikkeld.

Companion wordt architecture-first ontwikkeld.

Nieuwe functionaliteit ontstaat altijd vanuit een stabiele Foundation.

## Ontwikkelcyclus

Iedere nieuwe functionaliteit doorloopt dezelfde stappen.

```text
Idee

↓

Visie

↓

Business Rules

↓

Datamodel

↓

Architectuur

↓

Standaard

↓

Foundation Component

↓

Companion Design Lab

↓

Foundation Playground

↓

Eerste implementatie

↓

Review

↓

Verbeteren

↓

Migratie

↓

Cleanup

↓

Documentatie

↓

Build

↓

Commit

↓

Push
```

## Foundation First

Nieuwe UI wordt nooit rechtstreeks in een feature gebouwd.

Eerst wordt bekeken of de functionaliteit thuishoort in de Foundation.

Voorbeelden:

- CompanionDateTimePicker
- CompanionModalShell
- CompanionButton
- CompanionToolbarButton

Pas daarna worden features gemigreerd.

## Design Lab

Nieuwe componenten worden eerst visueel ontworpen.

Doelen:

- uitstraling
- gebruiksgemak
- consistentie
- experimenteren

Geen businesslogica.

## Foundation Playground

Hier worden componenten functioneel getest.

Niet als feature.

Maar als losse bouwsteen.

## Migratie

Na goedkeuring wordt een bestaande feature gemigreerd.

Nooit direct de hele applicatie.

Na succesvolle migratie volgen de overige schermen.

## Cleanup

Na iedere migratie:

- verwijder dode code
- verwijder oude styles
- verwijder dubbele helpers
- verwijder ongebruikte imports

Geen functionele wijzigingen.

## Documentatie

Na iedere Foundation Sprint wordt gecontroleerd of de documentatie nog klopt.

Bijwerken indien nodig:

- Component Registry
- Architectuur
- UI Fundament
- Visual Language
- Design Principles
- Foundation Roadmap

## Commitstrategie

Gebruik vaste commitcategorieen:

Foundation: nieuwe Foundation Component

Feature: feature migreert naar Foundation

Refactor: cleanup zonder functionele wijziging

Fix: bugfix

Docs: documentatie

Architecture: architectuurwijziging

Design: visuele ontwerpwijziging

## Ontwerpprincipes

Companion is geen verzameling schermen.

Companion is een samenhangend gezondheidssysteem.

Iedere component moet bijdragen aan:

- consistentie
- rust
- eenvoud
- vertrouwen
- hergebruik

## Lange termijn

Het uiteindelijke doel is een complete Companion Foundation waarmee ook toekomstige applicaties gebouwd kunnen worden.

De Foundation is een investering in onderhoudbaarheid, kwaliteit en ontwikkelsnelheid.
