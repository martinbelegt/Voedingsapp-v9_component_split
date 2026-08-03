import React from "react";
import { DashboardTab } from "./DashboardTab";
import SupplementsTab from "./SupplementsTab";
import { ModuleWorkspace } from "./navigation/ModuleNavigation";
import { registrationModules } from "../data/navigationConfig";

export function RegistrationTab({
  activeModuleId,
  dashboardProps,
  supplementProps,
  panelOpen = true,
}) {
  if (!panelOpen) return null;

  return (
    <ModuleWorkspace
      title="Samenstellen"
      description="Stel voeding en supplementen samen."
      modules={registrationModules}
      activeModuleId={activeModuleId}
      onSelect={() => {}}
      hideNavigation
    >
      {activeModuleId === "meal" ? (
        <DashboardTab {...dashboardProps} />
      ) : null}
      {activeModuleId === "supplement" ? (
        <SupplementsTab {...supplementProps} />
      ) : null}
    </ModuleWorkspace>
  );
}
