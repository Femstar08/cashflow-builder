"use client";

import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { buildEnhancedForecast } from "@/lib/cashflow/enhanced-calculations";
import type { LineItem, BusinessProfile, Event } from "@/types/database";

type CashflowChartProps = {
  lineItems: LineItem[];
  profile: BusinessProfile;
  events?: Event[];
  openingBalance?: number;
};

export function CashflowChart({ lineItems, profile, events = [], openingBalance = 0 }: CashflowChartProps) {
  const data = useMemo(() => {
    const enhancedSeries = buildEnhancedForecast({
      profile,
      lineItems,
      events,
      openingBalance,
    });
    
    return enhancedSeries.map((point) => ({
      month: point.month,
      revenue: point.revenue,
      expenses: point.expenses,
      net: point.net,
      cashBalance: point.cashBalance,
    }));
  }, [lineItems, profile, events, openingBalance]);

  return (
    <div className="h-64 rounded-xl border border-[#E1E4EA] bg-white p-6">
      <h3 className="text-base font-semibold text-[#15213C] mb-4">Net Cashflow</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#15213C" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#15213C" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis 
            dataKey="month" 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#5C6478', fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#5C6478', fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number) => `£${(value / 1000).toFixed(1)}k`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E1E4EA',
              borderRadius: '8px',
              color: '#15213C'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="cashBalance" 
            stroke="#15213C" 
            fill="url(#colorCash)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

