export const knowledgeCategories = [
  {
    id: "nutrition",
    name: "Voeding",
    sources: [
      { id: "voedingscentrum", name: "Voedingscentrum", specialization: "Voeding en gezonde keuzes", description: "Praktische, onafhankelijke informatie over gezond, veilig en duurzaam eten.", uses: ["voedingswaarden", "algemene voedingsadviezen", "gezonde voeding"], reliability: "Officieel Nederlands voorlichtingscentrum", website: "https://www.voedingscentrum.nl/" },
      { id: "nevo", name: "NEVO", specialization: "Nederlandse voedingsmiddelendata", description: "Het Nederlandse voedingsstoffenbestand met gegevens over de samenstelling van voedingsmiddelen.", uses: ["voedingswaarden", "macro's", "micronutriënten"], reliability: "Beheerd door het RIVM", website: "https://www.rivm.nl/nederlands-voedingsstoffenbestand" },
      { id: "usda", name: "USDA FoodData Central", specialization: "Internationale voedingsmiddelendata", description: "Uitgebreide databank met voedingsgegevens van generieke en merkproducten.", uses: ["internationale voedingsproducten", "ontbrekende voedingswaarden"], reliability: "Officiële databank van de Amerikaanse overheid", website: "https://fdc.nal.usda.gov/" },
    ],
  },
  {
    id: "supplements",
    name: "Supplementen",
    sources: [
      { id: "examine", name: "Examine.com", specialization: "Supplementen", description: "Onafhankelijke samenvattingen van wetenschappelijk onderzoek naar supplementen.", uses: ["doseringen", "werkzaamheid", "veiligheid", "bewijsniveau"], reliability: "Onafhankelijk en wetenschappelijk onderbouwd kennisplatform", website: "https://examine.com/" },
      { id: "ais", name: "Australian Institute of Sport", specialization: "Sportvoeding", description: "Evidence-based classificatie van supplementen voor sporters en prestaties.", uses: ["sportvoeding", "prestatiebevorderende supplementen", "classificatie"], reliability: "Nationaal sportwetenschappelijk instituut", website: "https://www.ais.gov.au/nutrition/supplements" },
      { id: "nih-ods", name: "NIH Office of Dietary Supplements", specialization: "Vitamines en mineralen", description: "Feitenbladen en onderzoeksinformatie over voedingssupplementen.", uses: ["vitamines", "mineralen", "veiligheidsinformatie"], reliability: "Onderdeel van de Amerikaanse National Institutes of Health", website: "https://ods.od.nih.gov/" },
      { id: "efsa", name: "EFSA", specialization: "Europese voedselveiligheid", description: "Wetenschappelijke beoordelingen van voedselveiligheid, claims en nutriënten.", uses: ["Europese gezondheidsclaims", "veiligheid", "maximale doseringen"], reliability: "Onafhankelijk wetenschappelijk agentschap van de EU", website: "https://www.efsa.europa.eu/" },
    ],
  },
  {
    id: "diabetes",
    name: "Diabetes",
    sources: [
      { id: "dvn", name: "Diabetesvereniging Nederland", specialization: "Leven met diabetes", description: "Nederlandse patiëntenvereniging met praktische informatie en belangenbehartiging.", uses: ["diabeteszorg", "glucose", "leefstijl"], reliability: "Erkende Nederlandse patiëntenvereniging", website: "https://www.dvn.nl/" },
      { id: "ada", name: "American Diabetes Association", specialization: "Diabeteszorg", description: "Internationale standaarden en publieksinformatie voor diabeteszorg.", uses: ["diabeteszorg", "glucose", "leefstijl", "behandeling"], reliability: "Toonaangevende medische diabetesorganisatie", website: "https://diabetes.org/" },
      { id: "easd", name: "EASD", specialization: "Europees diabetesonderzoek", description: "Wetenschappelijke kennis en richtlijnen voor onderzoek en behandeling van diabetes.", uses: ["diabeteszorg", "glucose", "leefstijl", "behandeling"], reliability: "Europese wetenschappelijke beroepsvereniging", website: "https://www.easd.org/" },
    ],
  },
  {
    id: "medication",
    name: "Medicatie",
    sources: [
      { id: "apotheek", name: "Apotheek.nl", specialization: "Geneesmiddeleninformatie", description: "Begrijpelijke, praktische uitleg over het gebruik van medicijnen.", uses: ["geneesmiddelen", "doseringen", "bijwerkingen", "interacties"], reliability: "Informatie van de Koninklijke Nederlandse Maatschappij ter bevordering der Pharmacie", website: "https://www.apotheek.nl/" },
      { id: "fk", name: "Farmacotherapeutisch Kompas", specialization: "Farmacotherapie", description: "Professionele geneesmiddeleninformatie voor zorgverleners en patiënten.", uses: ["geneesmiddelen", "doseringen", "bijwerkingen", "interacties"], reliability: "Uitgegeven door Zorginstituut Nederland", website: "https://www.farmacotherapeutischkompas.nl/" },
    ],
  },
  {
    id: "health",
    name: "Gezondheid",
    sources: [
      { id: "thuisarts", name: "Thuisarts.nl", specialization: "Medische publieksinformatie", description: "Toegankelijke informatie over klachten, gezondheid en contact met de huisarts.", uses: ["algemene gezondheid", "preventie", "leefstijl"], reliability: "Ontwikkeld door het Nederlands Huisartsen Genootschap", website: "https://www.thuisarts.nl/" },
      { id: "rivm", name: "RIVM", specialization: "Volksgezondheid", description: "Nederlandse kennis over volksgezondheid, preventie en leefomgeving.", uses: ["algemene gezondheid", "preventie", "leefstijl"], reliability: "Nationaal kennisinstituut van de overheid", website: "https://www.rivm.nl/" },
      { id: "who", name: "WHO", specialization: "Wereldgezondheid", description: "Internationale richtlijnen, gegevens en adviezen over publieke gezondheid.", uses: ["algemene gezondheid", "preventie", "leefstijl"], reliability: "Gezondheidsorganisatie van de Verenigde Naties", website: "https://www.who.int/" },
    ],
  },
  {
    id: "research",
    name: "Wetenschappelijk onderzoek",
    sources: [
      { id: "pubmed", name: "PubMed", specialization: "Biomedische literatuur", description: "Doorzoekbare databank met medische en biowetenschappelijke publicaties.", uses: ["wetenschappelijke publicaties"], reliability: "Beheerd door de U.S. National Library of Medicine", website: "https://pubmed.ncbi.nlm.nih.gov/" },
      { id: "scholar", name: "Google Scholar", specialization: "Wetenschappelijke literatuur", description: "Brede zoekingang voor artikelen, proefschriften, boeken en citaties.", uses: ["aanvullend literatuuronderzoek"], reliability: "Brede academische zoekindex; bronnen worden afzonderlijk beoordeeld", website: "https://scholar.google.com/" },
    ],
  },
];

export const futureKnowledgeModules = ["Video's", "Boeken", "Podcasts", "Wetenschappelijke samenvattingen", "AI-kennisassistent", "Richtlijnen", "Naslag per aandoening", "Naslag per supplement", "Naslag per medicijn"];
