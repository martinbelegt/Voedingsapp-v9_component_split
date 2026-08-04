import React from "react";
import { DashboardTab } from "./DashboardTab";
import { ModuleWorkspace } from "./navigation/ModuleNavigation";
import { registrationModules } from "../data/navigationConfig";

export function RegistrationTab({
  activeModuleId,
  dashboardProps,
  panelOpen = true,
}) {
  if (!panelOpen) return null;

  return (
    <ModuleWorkspace
      title="Samenstellen"
      description="Stel voeding samen."
      modules={registrationModules}
      activeModuleId={activeModuleId}
      onSelect={() => {}}
      hideNavigation
    >
      <DashboardTab {...dashboardProps} />
    </ModuleWorkspace>
  );
}
