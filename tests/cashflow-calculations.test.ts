import { describe, it, expect } from "vitest";
import { buildSeries, summarizeMetrics } from "@/lib/cashflow/calculations";
import type { LineItem } from "@/types/database";

const sampleLineItems: LineItem[] = [
  {
    id: "rev",
    scenario_id: "scenario",
    created_at: "",
    type: "revenue",
    label: "Revenue",
    formula: null,
    metadata: {},
    monthly_values: Array(12).fill(100),
  },
  {
    id: "cogs",
    scenario_id: "scenario",
    created_at: "",
    type: "cogs",
    label: "Cost of revenue",
    formula: null,
    metadata: {},
    monthly_values: Array(12).fill(60),
  },
  {
    id: "opex",
    scenario_id: "scenario",
    created_at: "",
    type: "opex",
    label: "Operating expenses",
    formula: null,
    metadata: {},
    monthly_values: Array(12).fill(60),
  },
];

describe("cashflow calculations", () => {
  it("buildSeries computes revenue, expenses, and net per month", () => {
    const series = buildSeries(sampleLineItems);
    expect(series).toHaveLength(12);
    expect(series[0]).toEqual({ month: "Jan", revenue: 100, expenses: 120, net: -20 });
  });

  it("summarizeMetrics derives ARR, gross margin, burn, runway", () => {
    const metrics = summarizeMetrics(sampleLineItems);
    expect(metrics.arr).toBe(1200);
    expect(metrics.grossMargin).toBeCloseTo(40);
    expect(metrics.burn).toBeCloseTo(20);
    expect(metrics.runwayMonths).toBeGreaterThan(0);
  });
});

