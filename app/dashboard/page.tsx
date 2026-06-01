import DashboardPage from "../components/dashboard-components/dashboardpage";
import { DashboardLayout } from "../components/layout/Dashboard-layout";

export default function Page() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
