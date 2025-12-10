import type { LineItem, LineItemType } from "@/types/database";

export type SeriesPoint = {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function buildSeries(lineItems: LineItem[]): SeriesPoint[] {
  const months = lineItems[0]?.monthly_values.length ?? 0;

  return Array.from({ length: months }, (_, index) => {
    const revenue = sumByType(lineItems, "revenue", index);
    const expenses = sumByType(lineItems, "cogs", index) + sumByType(lineItems, "opex", index);
    return {
      month: MONTH_LABELS[index % 12],
      revenue,
      expenses,
      net: revenue - expenses,
    };
  });
}

export function summarizeMetrics(lineItems: LineItem[]) {
  const series = buildSeries(lineItems);
  const annualRevenue = series.reduce((acc, point) => acc + point.revenue, 0);
  const annualExpenses = series.reduce((acc, point) => acc + point.expenses, 0);
  const months = series.length || 12; // Use actual series length, fallback to 12 for safety
  const burn = Math.max(0, annualExpenses / months - annualRevenue / months);
  const grossMargin = ((annualRevenue - sumByType(lineItems, "cogs")) / annualRevenue) * 100;

  return {
    arr: annualRevenue,
    grossMargin: Number.isFinite(grossMargin) ? grossMargin : 0,
    burn,
    runwayMonths: burn > 0 ? Math.round((annualRevenue * 0.6) / burn) : 36,
  };
}

function sumByType(lineItems: LineItem[], type: LineItemType, monthIndex?: number) {
  return lineItems
    .filter((item) => item.type === type)
    .reduce((total, item) => {
      if (typeof monthIndex === "number") {
        return total + (item.monthly_values[monthIndex] ?? 0);
      }
      return total + item.monthly_values.reduce((subTotal, value) => subTotal + value, 0);
    }, 0);
}

