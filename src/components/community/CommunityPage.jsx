import React from "react";
import "./communityPage.css";

export const communityModules = [
  { id: "home", label: "Community Home" },
  { id: "prices", label: "Prijsvergelijker" },
  { id: "tips", label: "Tips" },
  { id: "shopping", label: "Boodschappen" },
  { id: "groups", label: "Groepen" },
  { id: "plus", label: "Community Plus" },
];

const futureGroups = [
  "Diabetes", "Krachttraining", "Afvallen", "Spieropbouw",
  "Pancreasproblemen", "Darmgezondheid", "Hart- en vaatziekten",
  "Gezonde recepten", "AI-samenvattingen van communitykennis",
];

function ComingSoon() {
  return <span className="community-page__status">Binnenkort</span>;
}

function CommunityCard({ icon, title, subtitle, children, wide = false }) {
  return (
    <article className={`community-page__card${wide ? " is-wide" : ""}`}>
      <header>
        <span className="community-page__icon" aria-hidden="true">{icon}</span>
        <div><h2>{title}</h2><p>{subtitle}</p></div>
        <ComingSoon />
      </header>
      {children}
    </article>
  );
}

export function CommunityPage() {
  return (
    <main className="community-page">
      <header className="community-page__hero">
        <span>Companion Community</span>
        <h1>Onze community</h1>
        <h2>Kennis delen. Samen gezonder leven. Samen slimmer besparen.</h2>
        <p>Companion is meer dan een gezondheidsapp. Het is een gemeenschap waarin gebruikers elkaar helpen gezonder te leven, slimmer te kiezen en samen geld te besparen.</p>
        <div className="community-page__privacy"><strong>Privacy staat altijd voorop.</strong> Delen is vrijwillig en de gebruiker houdt de regie.</div>
      </header>

      <nav className="community-page__module-map" aria-label="Toekomstige communitymodules">
        {communityModules.map((module, index) => (
          <React.Fragment key={module.id}>
            <span>{module.label}</span>{index < communityModules.length - 1 && <i aria-hidden="true">›</i>}
          </React.Fragment>
        ))}
      </nav>

      <section className="community-page__intro">
        <h2>Samen weet je meer</h2>
        <p>Companion blijft jouw persoonlijke gezondheidscoach, met daarnaast een gemeenschap waarin mensen elkaar vrijwillig helpen met praktische kennis en ervaringen.</p>
      </section>

      <section className="community-page__grid">
        <CommunityCard icon="€" title="Slim besparen" subtitle="Prijsvergelijker">
          <p>Vergelijk supplementen en voedingsproducten op prijs per verpakking én per werkzame hoeveelheid. Sorteer op prijs en zie snel welke winkel of webshop voordelig is.</p>
          <strong>Bespaar eenvoudig op producten die je toch al dagelijks gebruikt.</strong>
        </CommunityCard>

        <CommunityCard icon="✓" title="Slim boodschappen doen" subtitle="Boodschappenlijsten">
          <p>Persoonlijke boodschappenlijsten, automatisch opgebouwd vanuit routines en maaltijdplanning en later gecombineerd met actuele prijsinformatie.</p>
        </CommunityCard>

        <CommunityCard icon="✦" title="Tips van andere gebruikers" subtitle="Communitytips">
          <p>Handige producten, betere alternatieven, ervaringen, kooktips, sporttips en praktische gezondheidsadviezen.</p>
          <small>Ervaringsuitwisseling, geen medisch advies.</small>
        </CommunityCard>

        <CommunityCard icon="≋" title="Slim vergelijken" subtitle="Supplementvergelijker">
          <p>Vergelijk werkzame vorm, dosering, kwaliteit, prijs per mg, prijs per dagdosering en gebruikerswaardering.</p>
        </CommunityCard>

        <CommunityCard icon="∞" title="Samen steeds slimmer" subtitle="Gezamenlijke kennis">
          <p>Vrijwillig gedeelde kennis helpt bij het vinden van betere producten, goedkopere alternatieven, leveranciers, aanbiedingen en praktische ervaringen.</p>
        </CommunityCard>

        <CommunityCard icon="→" title="Wat komt later?" subtitle="Toekomst" wide>
          <p>Besloten interessegroepen en onderwerpen die aansluiten op het dagelijks leven van gebruikers.</p>
          <div className="community-page__tags">{futureGroups.map((group) => <span key={group}>{group}</span>)}</div>
        </CommunityCard>
      </section>

      <aside className="community-page__plus">
        <div><span>Toekomst</span><h2>Community Plus</h2></div>
        <p>Voor ongeveer €1 per maand kunnen leden later toegang krijgen tot uitgebreide prijsvergelijkingen, slimme boodschappenlijsten en andere premium communitydiensten.</p>
        <strong>De basis van Companion blijft gratis bruikbaar.</strong>
      </aside>
    </main>
  );
}
