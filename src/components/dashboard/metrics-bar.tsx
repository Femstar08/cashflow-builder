import { useMemo } from "react";
import { buildEnhancedForecast, calculateForecastMetrics } from "@/lib/cashflow/enhanced-calculations";
import type { LineItem, BusinessProfile, Event } from "@/types/database";

type MetricsBarProps = {
  lineItems: LineItem[];
  profile: BusinessProfile;
  events?: Event[];
  openingBalance?: number;
};

export function MetricsBar({ lineItems, profile, events = [], openingBalance = 0 }: MetricsBarProps) {
  const metrics = useMemo(() => {
    const enhancedSeries = buildEnhancedForecast({
      profile,
      lineItems,
      events,
      openingBalance,
    });
    return calculateForecastMetrics(enhancedSeries);
  }, [lineItems, profile, events, openingBalance]);

  // Calculate additional metrics
  const arr = useMemo(() => {
    return lineItems
      .filter((item) => item.type === "revenue")
      .reduce((total, item) => {
        return total + item.monthly_values.reduce((sum, val) => sum + val, 0);
      }, 0);
  }, [lineItems]);

  const grossMargin = useMemo(() => {
    const revenue = lineItems
      .filter((item) => item.type === "revenue")
      .reduce((total, item) => {
        return total + item.monthly_values.reduce((sum, val) => sum + val, 0);
      }, 0);
    const cogs = lineItems
      .filter((item) => item.type === "cogs")
      .reduce((total, item) => {
        return total + item.monthly_values.reduce((sum, val) => sum + val, 0);
      }, 0);
    return revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
  }, [lineItems]);

  return (
    <div className="grid gap-6 rounded-xl border border-[#E1E4EA] bg-white p-6 md:grid-cols-4">
      <Metric label="ARR" value={`£${(arr / 1000).toFixed(1)}k`} helper="Annual recurring revenue" />
      <Metric label="Gross margin" value={`${grossMargin.toFixed(1)}%`} helper="Revenue - COGS" />
      <Metric 
        label="Net cash position" 
        value={`£${(metrics.netCashPosition / 1000).toFixed(1)}k`} 
        helper="End of period cash"
        highlight={metrics.netCashPosition > 0}
      />
      <Metric 
        label="Cash runway" 
        value={metrics.cashRunway ? `${metrics.cashRunway} months` : "N/A"} 
        helper="Months until exhausted"
        highlight={metrics.cashRunway && metrics.cashRunway > 12}
      />
    </div>
  );
}

function Metric({ label, value, helper, highlight }: { label: string; value: string; helper: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5C6478]">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${highlight ? 'text-[#53E9C5]' : 'text-[#15213C]'}`}>{value}</p>
      <p className="text-xs text-[#5C6478] mt-1">{helper}</p>
    </div>
  );
}

