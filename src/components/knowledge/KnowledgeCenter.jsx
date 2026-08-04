import React, { useMemo, useState } from "react";
import { futureKnowledgeModules, knowledgeCategories } from "./knowledgeSources";
import "./knowledgeCenter.css";

export function SearchBar({ value, onChange }) {
  return <label className="knowledge-search"><span aria-hidden="true">⌕</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Zoek bron..." aria-label="Zoek bron" /></label>;
}

export function Favorites({ active, onToggle, sourceName }) {
  return <button type="button" className={`knowledge-favorite${active ? " is-active" : ""}`} onClick={onToggle} aria-pressed={active} aria-label={`${active ? "Verwijder" : "Voeg"} ${sourceName} ${active ? "uit" : "toe aan"} favorieten`} title="Favoriete bron">★</button>;
}

export function SourceCard({ source, favorite, onToggleFavorite }) {
  return (
    <article className="knowledge-card">
      <div className="knowledge-card__top"><div className="knowledge-score" aria-label="Companion-score gereserveerd"><span aria-hidden="true">★★★★★</span> Companion-bron</div><Favorites active={favorite} onToggle={onToggleFavorite} sourceName={source.name} /></div>
      <h3>{source.name}</h3>
      <div className="knowledge-card__specialization"><span>Specialisatie</span><strong>{source.specialization}</strong></div>
      <div className="knowledge-card__section"><h4>Waarom gebruiken wij deze bron?</h4><p>{source.description}</p></div>
      <div className="knowledge-card__section"><h4>Companion gebruikt deze bron voor</h4><ul>{source.uses.map((use) => <li key={use}>{use}</li>)}</ul></div>
      <div className="knowledge-card__reliability"><span>Betrouwbaarheid</span><strong>{source.reliability}</strong></div>
      <a className="knowledge-card__link" href={source.website} target="_blank" rel="noreferrer">Open website <span aria-hidden="true">↗</span></a>
    </article>
  );
}

export function SourceCategories({ categories, favorites, onToggleFavorite }) {
  return <div className="knowledge-categories">{categories.map((category) => <section className="knowledge-category" key={category.id}><header><span>{category.sources.length} {category.sources.length === 1 ? "bron" : "bronnen"}</span><h2>{category.name}</h2></header><div className="knowledge-category__grid">{category.sources.map((source) => <SourceCard key={source.id} source={source} favorite={favorites.has(source.id)} onToggleFavorite={() => onToggleFavorite(source.id)} />)}</div></section>)}</div>;
}

export function FutureModules() {
  return <section className="knowledge-future"><header><span>In ontwikkeling</span><h2>Binnenkort</h2><p>Het Kenniscentrum groeit stap voor stap verder.</p></header><div>{futureKnowledgeModules.map((module) => <article key={module}><span aria-hidden="true">＋</span><h3>{module}</h3><strong>Binnenkort</strong></article>)}</div></section>;
}

export function KnowledgeCenter() {
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState(() => new Set());
  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("nl");
    if (!normalized) return knowledgeCategories;
    return knowledgeCategories.map((category) => ({ ...category, sources: category.sources.filter((source) => source.name.toLocaleLowerCase("nl").includes(normalized)) })).filter((category) => category.sources.length);
  }, [query]);
  const toggleFavorite = (id) => setFavorites((current) => { const next = new Set(current); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <main className="knowledge-center">
      <header className="knowledge-hero"><span>Companion Kenniscentrum</span><h1>Kenniscentrum</h1><h2>Betrouwbare kennis als fundament van Companion</h2><p>Companion is gebaseerd op zorgvuldig geselecteerde, zoveel mogelijk onafhankelijke bronnen. Hier vind je de belangrijkste kennisbronnen die wij gebruiken én die je zelf kunt raadplegen als je meer wilt weten.</p></header>
      <section className="knowledge-intro"><div><span>Onze werkwijze</span><h2>Geen absolute waarheid, wel een zorgvuldig fundament</h2><p>Companion probeert niet “de waarheid” te zijn. Companion probeert betrouwbare kennis begrijpelijk te maken.</p><p>Nieuwe inzichten ontstaan voortdurend. Daarom groeit ook het Kenniscentrum voortdurend mee.</p></div><ul><li>Officiële richtlijnen</li><li>Wetenschappelijke instituten</li><li>Gerenommeerde kennisplatforms</li><li>Erkende medische organisaties</li></ul></section>
      <div className="knowledge-tools"><div><span>Vind een kennisbron</span><SearchBar value={query} onChange={setQuery} /></div><p><strong>{knowledgeCategories.reduce((total, category) => total + category.sources.length, 0)}</strong> zorgvuldig geselecteerde bronnen</p></div>
      {filteredCategories.length ? <SourceCategories categories={filteredCategories} favorites={favorites} onToggleFavorite={toggleFavorite} /> : <div className="knowledge-empty"><h2>Geen bron gevonden</h2><p>Probeer een andere naam.</p><button type="button" onClick={() => setQuery("")}>Wis zoekopdracht</button></div>}
      <FutureModules />
    </main>
  );
}
