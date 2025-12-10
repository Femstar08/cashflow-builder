import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const checklist = [
  "Verify assumptions & collaborator notes",
  "Review AI insights for anomalies",
  "Export Excel workbook with formulas and chart data",
];

export default function ExportsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <Card
          title="Step 3 · Review & export"
          description="Finalize the plan before sharing with investors, operators, or clients."
          actions={
            <Button size="sm" asChild>
              <Link href="/dashboard/profile-demo">Go to workspace</Link>
            </Button>
          }
        >
          <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-400">Exports currently use mock data when InstantDB creds are missing.</p>
        </Card>
      </div>
    </AppShell>
  );
}

