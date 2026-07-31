import React from "react";
import "./navigationFoundation.css";

export function ModuleNavigation({
  title,
  modules,
  activeModuleId,
  onSelect,
}) {
  return (
    <section className="companion-module-navigation">
      <nav aria-label={`${title} modules`}>
        {modules.map((module) => (
          <button
            key={module.id}
            type="button"
            aria-current={activeModuleId === module.id ? "page" : undefined}
            className={activeModuleId === module.id ? "is-active" : ""}
            onClick={() => onSelect(module.id)}
          >
            <span aria-hidden="true">{module.icon}</span>
            <strong>{module.label}</strong>
          </button>
        ))}
      </nav>
    </section>
  );
}

export function RoadmapPlaceholder({ module }) {
  return (
    <section className="companion-roadmap-placeholder">
      <div className="companion-roadmap-placeholder__icon" aria-hidden="true">
        {module.icon}
      </div>
      <p>Companion-module</p>
      <h1>{module.label}</h1>
      <strong>Binnenkort beschikbaar.</strong>
      {module.description && <span>{module.description}</span>}
      {module.examples && (
        <ul>
          {module.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
      )}
      {module.timelineNote && <span>{module.timelineNote}</span>}
      <hr />
      <span>Deze module maakt deel uit van de Companion-roadmap.</span>
      <span>
        Tijdens de ontwikkeling verschijnt deze alvast in het menu zodat de
        uiteindelijke structuur zichtbaar blijft.
      </span>
    </section>
  );
}

export function ModuleWorkspace({
  title,
  modules,
  activeModuleId,
  onSelect,
  children,
  hideNavigation = false,
}) {
  const activeModule =
    modules.find((module) => module.id === activeModuleId) || modules[0];

  return (
    <div className="companion-module-workspace">
      {!hideNavigation && (
        <ModuleNavigation
          title={title}
          modules={modules}
          activeModuleId={activeModule.id}
          onSelect={onSelect}
        />
      )}
      <div className="companion-module-workspace__content">
        {activeModule.available ? (
          children
        ) : (
          <RoadmapPlaceholder module={activeModule} />
        )}
      </div>
    </div>
  );
}
