import { AppShell } from "@/components/layout/app-shell";
import { GuidedProfileWizard } from "@/components/profile/guided-profile-wizard";

export const dynamic = "force-dynamic";

export default function NewProfilePage() {
  return (
    <AppShell>
      <GuidedProfileWizard />
    </AppShell>
  );
}

