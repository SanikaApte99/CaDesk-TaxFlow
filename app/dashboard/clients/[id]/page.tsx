import { DashboardLayout } from "@/app/components/layout/Dashboard-layout";
import ClientDetailPage from "@/app/components/dashboard-components/clients/[id]/clientdetail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <ClientDetailPage clientId={id} />
    </DashboardLayout>
  );
}
