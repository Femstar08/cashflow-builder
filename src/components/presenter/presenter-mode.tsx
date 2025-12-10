"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { Button } from "@/components/ui/button";
import { SegmentControl } from "@/components/ui/segment-control";
import { buildEnhancedForecast, calculateForecastMetrics, type EnhancedSeriesPoint } from "@/lib/cashflow/enhanced-calculations";
import type { BusinessProfile, LineItem, Event } from "@/types/database";
import { horizons, type HorizonId } from "@/lib/utils";

type PresenterModeProps = {
  profile: BusinessProfile;
  lineItems: LineItem[];
  events: Event[];
  onExit: () => void;
  onExport: () => void;
};

export function PresenterMode({ profile, lineItems, events, onExit, onExport }: PresenterModeProps) {
  const [selectedHorizon, setSelectedHorizon] = useState<HorizonId>("1y");
  const router = useRouter();

  // Calculate months based on horizon
  const months = useMemo(() => {
    const horizonMap: Record<HorizonId, number> = { "1y": 12, "3y": 36, "5y": 60, "10y": 120 };
    return horizonMap[selectedHorizon];
  }, [selectedHorizon]);

  // Truncate line items to selected horizon
  const truncatedLineItems = useMemo(() => {
    return lineItems.map((item) => ({
      ...item,
      monthly_values: item.monthly_values.slice(0, months),
    }));
  }, [lineItems, months]);

  // Build enhanced forecast
  const forecastSeries = useMemo(() => {
    return buildEnhancedForecast({
      profile,
      lineItems: truncatedLineItems,
      events,
      openingBalance: 0,
    });
  }, [profile, truncatedLineItems, events]);

  // Calculate metrics
  const metrics = useMemo(() => {
    return calculateForecastMetrics(forecastSeries);
  }, [forecastSeries]);

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `£${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
    return `£${value.toFixed(0)}`;
  };

  // Get entity type label
  const entityTypeLabel = profile.entity_type === "limited_company" ? "Limited Company" : "Sole Trader";
  const accountingBasisLabel = profile.accounting_basis === "cash" ? "Cash Basis" : "Accrual Basis";

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#15213C] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              {entityTypeLabel}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                profile.accounting_basis === "accrual"
                  ? "bg-[#53E9C5]/20 text-[#53E9C5] border border-[#53E9C5]/30"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {accountingBasisLabel}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <SegmentControl
              segments={horizons.map((h) => ({ label: h.label, value: h.id }))}
              value={selectedHorizon}
              onChange={(value) => setSelectedHorizon(value as HorizonId)}
              ariaLabel="Forecast horizon"
            />
            <div className="flex items-center gap-2">
              {profile.vat_enabled && (
                <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">VAT</span>
              )}
              {profile.include_corporation_tax && (
                <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">CT</span>
              )}
              {profile.include_paye_nic && (
                <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">PAYE</span>
              )}
              {profile.include_dividends && (
                <span className="px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">Div</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={onExit} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Edit Mode
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-6 pb-20 space-y-8 max-w-7xl mx-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Net Cash Position"
            value={formatCurrency(metrics.netCashPosition)}
            subtitle="End of Period"
          />
          <MetricCard
            title="Peak Negative Cash"
            value={formatCurrency(metrics.peakNegativeCash)}
            subtitle="Highest Deficit"
            isNegative={metrics.peakNegativeCash < 0}
          />
          <MetricCard
            title="Break-Even Month"
            value={metrics.breakEvenMonth ? `Month ${metrics.breakEvenMonth}` : "N/A"}
            subtitle="When Profit = 0"
          />
          <MetricCard
            title="Cash Runway"
            value={metrics.cashRunway ? `${metrics.cashRunway} months` : "N/A"}
            subtitle="Months Until Exhausted"
          />
          <MetricCard
            title="Revenue Growth"
            value={metrics.revenueGrowth ? `+${metrics.revenueGrowth.toFixed(0)}%` : "N/A"}
            subtitle="Y1–Y3 CAGR"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetCashflowChart series={forecastSeries} />
          <RevenueExpenseChart series={forecastSeries} />
        </div>

        {/* Event Timeline & Assumptions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EventTimeline events={events} months={months} />
          <AssumptionsPanel profile={profile} />
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <p>Forecasts are estimates for planning purposes only and do not constitute financial advice.</p>
            <p className="text-xs">
              Last updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onExit}>
              Back to Dashboard
            </Button>
            <Button onClick={onExport} className="bg-[#53E9C5] text-white hover:bg-[#45D9B3]">
              Export to Excel
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

type MetricCardProps = {
  title: string;
  value: string;
  subtitle: string;
  isNegative?: boolean;
};

function MetricCard({ title, value, subtitle, isNegative }: MetricCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
      <div className="h-1 bg-[#53E9C5] rounded-t-2xl -mt-6 -mx-6 mb-4" />
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <p className={`text-3xl font-bold ${isNegative ? "text-[#E85C5C]" : "text-slate-900"}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

type NetCashflowChartProps = {
  series: EnhancedSeriesPoint[];
};

function NetCashflowChart({ series }: NetCashflowChartProps) {
  const chartData = series.map((point) => ({
    month: point.month,
    cashBalance: point.cashBalance,
    net: point.net,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Net Cashflow</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#15213C" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#15213C" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E85C5C" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#E85C5C" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => `£${(value / 1000).toFixed(1)}k`}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="cashBalance"
            stroke="#15213C"
            fill="url(#colorCash)"
            strokeWidth={2}
          />
          {/* Highlight negative zones */}
          {chartData.map((point, index) =>
            point.cashBalance < 0 ? (
              <Area
                key={`negative-${index}`}
                type="monotone"
                dataKey="cashBalance"
                stroke="#E85C5C"
                fill="url(#colorNegative)"
                data={[point]}
              />
            ) : null
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type RevenueExpenseChartProps = {
  series: EnhancedSeriesPoint[];
};

function RevenueExpenseChart({ series }: RevenueExpenseChartProps) {
  const chartData = series.map((point) => ({
    month: point.month,
    revenue: point.revenue,
    expenses: point.expenses,
    grossProfit: point.revenue - point.expenses,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Revenue & Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value: number) => `£${(value / 1000).toFixed(1)}k`}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Bar dataKey="revenue" fill="#53E9C5" name="Revenue" />
          <Bar dataKey="expenses" fill="#5C6478" name="Expenses" />
          <Line type="monotone" dataKey="grossProfit" stroke="#15213C" strokeWidth={2} name="Gross Profit" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

type EventTimelineProps = {
  events: Event[];
  months: number;
};

function EventTimeline({ events, months }: EventTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.event_month - b.event_month);

  const getEventIcon = (type: Event["event_type"]) => {
    // Return empty string - no emojis for clean, professional look
    return "";
  };

  const getEventColor = (type: Event["event_type"]) => {
    switch (type) {
      case "funding":
        return "bg-[#53E9C5]/10 border-[#53E9C5]/30";
      case "hire":
        return "bg-slate-100 border-slate-300";
      case "client_win":
        return "bg-green-50 border-green-200";
      case "price_increase":
        return "bg-amber-50 border-amber-200";
      default:
        return "bg-slate-100 border-slate-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 mb-4">Event Timeline</h3>
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No events scheduled</p>
        ) : (
          sortedEvents.map((event) => (
            <div key={event.id} className={`p-4 border rounded-lg ${getEventColor(event.event_type)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{event.event_name}</h4>
                  <p className="text-sm text-slate-600">
                    Month {event.event_month} · {event.event_type.replace("_", " ")}
                  </p>
                  {event.amount && (
                    <p className="text-sm font-medium text-slate-700 mt-1">£{event.amount.toLocaleString()}</p>
                  )}
                  {event.percent_change && (
                    <p className="text-sm font-medium text-slate-700 mt-1">+{event.percent_change}%</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

type AssumptionsPanelProps = {
  profile: BusinessProfile;
};

function AssumptionsPanel({ profile }: AssumptionsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-base font-semibold text-slate-900 mb-4"
      >
        <span>Assumptions</span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Tax Rates</h4>
            <div className="text-sm text-slate-600 space-y-1">
              {profile.vat_enabled && <p>VAT: 20%</p>}
              {profile.include_corporation_tax && <p>Corporation Tax: 19%</p>}
              {profile.include_paye_nic && <p>Employer NIC: 13.8%</p>}
            </div>
          </div>
          {profile.accounting_basis === "accrual" && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Working Capital</h4>
              <div className="text-sm text-slate-600 space-y-1">
                <p>Debtor Days: {profile.debtor_days ?? 0}</p>
                <p>Creditor Days: {profile.creditor_days ?? 0}</p>
              </div>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Accounting Basis</h4>
            <p className="text-sm text-slate-600">
              {profile.accounting_basis === "cash" ? "Cash Basis" : "Accrual Basis"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

