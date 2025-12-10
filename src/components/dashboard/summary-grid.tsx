import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const milestones = [
  {
    title: "Business Profile Intake",
    description: "LLM-enhanced scraping that drafts editable attributes from any URL.",
    status: "Server action scaffolding pending",
  },
  {
    title: "Cashflow Workspace",
    description: "Handsontable-style grid with inline formulas and templates.",
    status: "AG Grid integration planned",
  },
  {
    title: "Recommendations",
    description: "Line-item suggestions, benchmarking, narrative insights.",
    status: "Prompt library to be wired into Supabase queue.",
  },
  {
    title: "Excel Export",
    description: "ExcelJS pipeline with scenario tabs & named ranges.",
    status: "Route + workbook composer scheduled.",
  },
];

const timeline = [
  { label: "Scaffold", target: "Week 1", detail: "Next.js shell, data contracts, mock data." },
  { label: "Profiles", target: "Week 2", detail: "Scraper, LLM prompts, Supabase storage." },
  { label: "Workspace", target: "Week 3", detail: "Grid, charts, scenario management." },
  { label: "Insights & Export", target: "Week 4", detail: "AI suggestions + Excel delivery." },
];

export function SummaryGrid() {
  return (
    <div className="space-y-8">
      <Card
        title="Why this foundation matters"
        description="Everything else—AI prompts, Supabase sync, Excel exports—sits on top of a dependable layout and provider stack."
        actions={
          <Button variant="outline" size="sm">
            Review architecture notes
          </Button>
        }
      >
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {milestones.map((item) => (
            <div key={item.title} className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
              <p className="text-sm font-semibold text-neutral-900 dark:text-white">{item.title}</p>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{item.description}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-600">
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Execution timeline" description="Rough week-by-week swimlanes for the MVP path.">
        <div className="grid gap-4 md:grid-cols-4">
          {timeline.map((item) => (
            <div key={item.label} className="rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900/60">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">{item.label}</p>
              <p className="mt-2 text-base font-semibold text-neutral-900 dark:text-white">{item.target}</p>
              <p className="mt-1 text-neutral-600 dark:text-neutral-300">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

