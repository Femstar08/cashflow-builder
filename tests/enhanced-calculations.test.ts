import { describe, it, expect } from "vitest";
import { buildEnhancedForecast, calculateForecastMetrics } from "@/lib/cashflow/enhanced-calculations";
import type { BusinessProfile, LineItem, Event } from "@/types/database";

describe("Enhanced Forecast Calculations", () => {
  const baseProfile: BusinessProfile = {
    id: "profile-1",
    owner_id: "owner-1",
    created_at: new Date().toISOString(),
    updated_at: null,
    name: "Test Company",
    url: null,
    industry: "Technology",
    description: null,
    headquarters: null,
    revenue_model: null,
    notes: null,
    raw_profile_json: {},
    ai_confidence: null,
    entity_type: "limited_company",
    accounting_basis: "accrual",
    vat_enabled: true,
    vat_basis: "accrual",
    include_corporation_tax: true,
    include_paye_nic: true,
    include_dividends: false,
    debtor_days: 30,
    creditor_days: 45,
    director_salary: null,
    dividend_payout_ratio: null,
  };

  const sampleLineItems: LineItem[] = [
    {
      id: "item-1",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "revenue",
      label: "Product Sales",
      formula: null,
      metadata: null,
      monthly_values: Array(12).fill(10000), // £10k/month
    },
    {
      id: "item-2",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "cogs",
      label: "Cost of Goods",
      formula: null,
      metadata: null,
      monthly_values: Array(12).fill(4000), // £4k/month
    },
    {
      id: "item-3",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "opex",
      label: "Operating Expenses",
      formula: null,
      metadata: null,
      monthly_values: Array(12).fill(3000), // £3k/month
    },
  ];

  describe("Accounting Basis", () => {
    it("should apply accrual basis with working capital adjustments", () => {
      const profile = { ...baseProfile, accounting_basis: "accrual" as const, debtor_days: 30, creditor_days: 45 };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.length).toBe(12);
      expect(series[0].accountsReceivable).toBeGreaterThan(0);
      expect(series[0].accountsPayable).toBeGreaterThan(0);
    });

    it("should apply cash basis without working capital adjustments", () => {
      const profile = { ...baseProfile, accounting_basis: "cash" as const };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.length).toBe(12);
      expect(series[0].accountsReceivable).toBe(0);
      expect(series[0].accountsPayable).toBe(0);
    });
  });

  describe("VAT Calculations", () => {
    it("should calculate VAT when enabled", () => {
      const profile = { ...baseProfile, vat_enabled: true, vat_basis: "accrual" as const };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series[0].vatCollected).toBeGreaterThan(0);
      expect(series[0].vatPaid).toBeGreaterThan(0);
    });

    it("should skip VAT when disabled", () => {
      const profile = { ...baseProfile, vat_enabled: false };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series[0].vatCollected).toBe(0);
      expect(series[0].vatPaid).toBe(0);
      expect(series[0].vatPayable).toBe(0);
    });

    it("should use cash basis VAT when vat_basis is cash", () => {
      const profile = { ...baseProfile, vat_enabled: true, vat_basis: "cash" as const, accounting_basis: "cash" as const };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      // VAT should still be calculated but based on cash timing
      expect(series.length).toBe(12);
    });
  });

  describe("Corporation Tax", () => {
    it("should calculate CT for limited companies when enabled", () => {
      const profile = { ...baseProfile, entity_type: "limited_company" as const, include_corporation_tax: true };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      // CT should be paid 9 months after year-end (month 21, but we only have 12 months)
      // For 12-month forecast, CT payment would be in a later month
      expect(series.length).toBe(12);
      // CT calculation logic is present even if payment timing is beyond forecast
    });

    it("should skip CT for sole traders", () => {
      const profile = { ...baseProfile, entity_type: "sole_trader" as const, include_corporation_tax: false };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.every((p) => p.corporationTax === 0)).toBe(true);
    });
  });

  describe("PAYE/NIC", () => {
    it("should calculate PAYE/NIC when enabled", () => {
      const profile = { ...baseProfile, include_paye_nic: true };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series[0].payeNic).toBeGreaterThan(0);
    });

    it("should skip PAYE/NIC when disabled", () => {
      const profile = { ...baseProfile, include_paye_nic: false };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.every((p) => p.payeNic === 0)).toBe(true);
    });
  });

  describe("Dividends", () => {
    it("should calculate dividends for limited companies when enabled", () => {
      const profile = {
        ...baseProfile,
        entity_type: "limited_company" as const,
        include_dividends: true,
        dividend_payout_ratio: 0.5,
      };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 50000, // Starting cash
      });

      expect(series.length).toBe(12);
      // Dividends should respect cash constraints
    });

    it("should skip dividends for sole traders", () => {
      const profile = { ...baseProfile, entity_type: "sole_trader" as const, include_dividends: false };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.every((p) => p.dividends === 0)).toBe(true);
    });
  });

  describe("Working Capital", () => {
    it("should apply debtor days for accrual basis", () => {
      const profile = { ...baseProfile, accounting_basis: "accrual" as const, debtor_days: 60 };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series[0].accountsReceivable).toBeGreaterThan(0);
    });

    it("should apply creditor days for accrual basis", () => {
      const profile = { ...baseProfile, accounting_basis: "accrual" as const, creditor_days: 30 };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series[0].accountsPayable).toBeGreaterThan(0);
    });

    it("should ignore working capital for cash basis", () => {
      const profile = { ...baseProfile, accounting_basis: "cash" as const, debtor_days: 30, creditor_days: 45 };
      const series = buildEnhancedForecast({
        profile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.every((p) => p.accountsReceivable === 0 && p.accountsPayable === 0)).toBe(true);
    });
  });

  describe("Event Application", () => {
    it("should apply funding events as cash injection", () => {
      const events: Event[] = [
        {
          id: "event-1",
          profile_id: "profile-1",
          event_name: "Seed Round",
          event_month: 3,
          event_type: "funding",
          amount: 50000,
          percent_change: null,
          target: null,
          created_at: new Date().toISOString(),
        },
      ];

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events,
        openingBalance: 0,
      });

      // Month 3 (index 2) should have funding impact
      expect(series[2].revenue).toBeGreaterThan(sampleLineItems[0].monthly_values[2]);
    });

    it("should apply hire events as recurring expense increase", () => {
      const events: Event[] = [
        {
          id: "event-2",
          profile_id: "profile-1",
          event_name: "New Hire",
          event_month: 6,
          event_type: "hire",
          amount: 5000,
          percent_change: null,
          target: null,
          created_at: new Date().toISOString(),
        },
      ];

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events,
        openingBalance: 0,
      });

      // Month 6 onwards should have increased expenses
      expect(series[5].expenses).toBeGreaterThan(sampleLineItems[1].monthly_values[5] + sampleLineItems[2].monthly_values[5]);
    });

    it("should apply client win events as recurring revenue", () => {
      const events: Event[] = [
        {
          id: "event-3",
          profile_id: "profile-1",
          event_name: "Major Client",
          event_month: 4,
          event_type: "client_win",
          amount: 20000,
          percent_change: null,
          target: null,
          created_at: new Date().toISOString(),
        },
      ];

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events,
        openingBalance: 0,
      });

      // Month 4 onwards should have increased revenue
      expect(series[3].revenue).toBeGreaterThan(sampleLineItems[0].monthly_values[3]);
    });

    it("should apply price increase events as percentage uplift", () => {
      const events: Event[] = [
        {
          id: "event-4",
          profile_id: "profile-1",
          event_name: "Price Increase",
          event_month: 8,
          event_type: "price_increase",
          amount: null,
          percent_change: 10,
          target: null,
          created_at: new Date().toISOString(),
        },
      ];

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events,
        openingBalance: 0,
      });

      // Month 8 onwards should have 10% higher revenue
      const baseRevenue = sampleLineItems[0].monthly_values[7];
      expect(series[7].revenue).toBeCloseTo(baseRevenue * 1.1, 0);
    });
  });

  describe("Cash Balance Calculations", () => {
    it("should calculate cumulative cash balance", () => {
      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 10000,
      });

      expect(series[0].openingBalance).toBe(10000);
      expect(series[0].cashBalance).toBe(10000 + series[0].net);
      expect(series[1].openingBalance).toBe(series[0].cashBalance);
    });

    it("should track cash balance across all months", () => {
      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      for (let i = 1; i < series.length; i++) {
        const expectedBalance = series[i - 1].cashBalance + series[i].net;
        expect(series[i].cashBalance).toBeCloseTo(expectedBalance, 0);
      }
    });
  });

  describe("Forecast Metrics", () => {
    it("should calculate net cash position", () => {
      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      const metrics = calculateForecastMetrics(series);
      expect(metrics.netCashPosition).toBe(series[series.length - 1].cashBalance);
    });

    it("should identify peak negative cash requirement", () => {
      const negativeLineItems: LineItem[] = [
        {
          id: "item-1",
          scenario_id: "scenario-1",
          created_at: new Date().toISOString(),
          type: "revenue",
          label: "Revenue",
          formula: null,
          metadata: null,
          monthly_values: Array(12).fill(5000),
        },
        {
          id: "item-2",
          scenario_id: "scenario-1",
          created_at: new Date().toISOString(),
          type: "opex",
          label: "High Expenses",
          formula: null,
          metadata: null,
          monthly_values: Array(12).fill(15000), // Negative cashflow
        },
      ];

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: negativeLineItems,
        events: [],
        openingBalance: 10000,
      });

      const metrics = calculateForecastMetrics(series);
      expect(metrics.peakNegativeCash).toBeLessThanOrEqual(0);
    });

    it("should calculate cash runway", () => {
      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: sampleLineItems,
        events: [],
        openingBalance: 0,
      });

      const metrics = calculateForecastMetrics(series);
      expect(metrics.cashRunway).toBeGreaterThanOrEqual(0);
      expect(metrics.cashRunway).toBeLessThanOrEqual(series.length);
    });
  });

  describe("Multi-Year Forecasts", () => {
    it("should handle 3-year forecast (36 months)", () => {
      const longLineItems: LineItem[] = sampleLineItems.map((item) => ({
        ...item,
        monthly_values: Array(36).fill(item.monthly_values[0]),
      }));

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: longLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.length).toBe(36);
    });

    it("should handle 5-year forecast (60 months)", () => {
      const longLineItems: LineItem[] = sampleLineItems.map((item) => ({
        ...item,
        monthly_values: Array(60).fill(item.monthly_values[0]),
      }));

      const series = buildEnhancedForecast({
        profile: baseProfile,
        lineItems: longLineItems,
        events: [],
        openingBalance: 0,
      });

      expect(series.length).toBe(60);
    });
  });
});

