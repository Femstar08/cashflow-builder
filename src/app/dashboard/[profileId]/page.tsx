import { AppShell } from "@/components/layout/app-shell";
import { EnhancedDashboard } from "@/components/dashboard/enhanced-dashboard";

type DashboardPageProps = {
  params: Promise<{ profileId: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { profileId } = await params;
  
  return (
    <AppShell>
      <EnhancedDashboard profileId={profileId} />
    </AppShell>
  );
}

