import { defineComponent } from "trrn";
import { Router, Route, LocationProvider } from "preact-iso";
import { AdminLayout } from "./components/layout/AdminLayout.tsx";
import { AnalyticsPage } from "./pages/admin/Analytics.tsx";
import { DataExplorerPage } from "./pages/admin/DataExplorer.tsx";
import { KanbanBoardPage } from "./pages/admin/KanbanBoard.tsx";
import { WizardFormPage } from "./pages/admin/WizardForm.tsx";
import { ZustandCounter } from "./pages/admin/ZustandDemo.tsx";
import { VanityCounter } from "./pages/admin/VanityDemo.tsx";

export const App = defineComponent(() => {
  return () => (
    <LocationProvider>
      <AdminLayout>
        <Router>
          <Route path="/admin/analytics" component={AnalyticsPage} />
          <Route path="/admin/data-explorer" component={DataExplorerPage} />
          <Route path="/admin/kanban" component={KanbanBoardPage} />
          <Route path="/admin/wizard" component={WizardFormPage} />
          <Route path="/admin/zustand" component={ZustandCounter} />
          <Route path="/admin/vanity" component={VanityCounter} />
        </Router>
      </AdminLayout>
    </LocationProvider>
  );
});
