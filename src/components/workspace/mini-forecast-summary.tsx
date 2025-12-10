"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { LineItem, Event } from "@/types/database";

type MiniForecastSummaryProps = {
  profileId: string;
  horizon: "1Y" | "3Y" | "5Y" | "10Y";
};

export function MiniForecastSummary({ profileId, horizon }: MiniForecastSummaryProps) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecastData();
  }, [profileId]);

  const loadForecastData = async () => {
    try {
      const response = await fetch(`/api/dashboard?profileId=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setLineItems(data.lineItems || []);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Failed to load forecast data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate simple metrics
  const revenueItems = lineItems.filter((item) => item.type === "revenue");
  const costItems = lineItems.filter((item) => item.type === "cogs" || item.type === "opex");

  const totalRevenue = revenueItems.reduce((sum, item) => {
    const values = Array.isArray(item.monthly_values) ? item.monthly_values : [];
    return sum + values.reduce((a, b) => a + (b || 0), 0);
  }, 0);

  const totalCosts = costItems.reduce((sum, item) => {
    const values = Array.isArray(item.monthly_values) ? item.monthly_values : [];
    return sum + values.reduce((a, b) => a + (b || 0), 0);
  }, 0);

  const netCashflow = totalRevenue - totalCosts;

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-full">
        <p className="text-[#5C6478]">Loading forecast...</p>
      </div>
    );
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#15213C]">Forecast Summary</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/dashboard/${profileId}`)}
        >
          View Full Forecast
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        <Card className="p-4">
          <div className="text-sm text-[#5C6478] mb-1">Total Revenue</div>
          <div className="text-xl font-semibold text-[#15213C]">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="text-xs text-[#5C6478] mt-1">
            {revenueItems.length} revenue stream{revenueItems.length !== 1 ? "s" : ""}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-[#5C6478] mb-1">Total Costs</div>
          <div className="text-xl font-semibold text-[#15213C]">
            {formatCurrency(totalCosts)}
          </div>
          <div className="text-xs text-[#5C6478] mt-1">
            {costItems.length} cost categor{costItems.length !== 1 ? "ies" : "y"}
          </div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-[#5C6478] mb-1">Net Cashflow</div>
          <div className={`text-xl font-semibold ${
            netCashflow >= 0 ? "text-green-600" : "text-red-600"
          }`}>
            {formatCurrency(netCashflow)}
          </div>
          <div className="text-xs text-[#5C6478] mt-1">
            {events.length} event{events.length !== 1 ? "s" : ""} scheduled
          </div>
        </Card>
      </div>
    </div>
  );
}

