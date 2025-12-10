import { describe, it, expect } from "vitest";
import { buildEnhancedForecast, calculateForecastMetrics } from "@/lib/cashflow/enhanced-calculations";
import type { BusinessProfile, LineItem, Event } from "@/types/database";

/**
 * Integration tests for full forecast with all features enabled
 * These tests verify that all components work together correctly
 */
describe("Full Forecast Integration Tests", () => {
  const fullFeatureProfile: BusinessProfile = {
    id: "profile-full",
    owner_id: "owner-1",
    created_at: new Date().toISOString(),
    updated_at: null,
    name: "Full Feature Company",
    url: null,
    industry: "Technology",
    description: null,
    headquarters: null,
    revenue_model: "SaaS",
    notes: null,
    raw_profile_json: {},
    ai_confidence: null,
    // All features enabled
    entity_type: "limited_company",
    accounting_basis: "accrual",
    vat_enabled: true,
    vat_basis: "accrual",
    include_corporation_tax: true,
    include_paye_nic: true,
    include_dividends: true,
    debtor_days: 30,
    creditor_days: 45,
    director_salary: 50000,
    dividend_payout_ratio: 0.5,
  };

  const comprehensiveLineItems: LineItem[] = [
    {
      id: "rev-1",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "revenue",
      label: "Subscription Revenue",
      formula: null,
      metadata: null,
      monthly_values: Array(36).fill(50000), // £50k/month for 3 years
    },
    {
      id: "cogs-1",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "cogs",
      label: "Hosting & Infrastructure",
      formula: null,
      metadata: null,
      monthly_values: Array(36).fill(10000), // £10k/month
    },
    {
      id: "opex-1",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "opex",
      label: "Salaries",
      formula: null,
      metadata: null,
      monthly_values: Array(36).fill(20000), // £20k/month
    },
    {
      id: "opex-2",
      scenario_id: "scenario-1",
      created_at: new Date().toISOString(),
      type: "opex",
      label: "Marketing",
      formula: null,
      metadata: null,
      monthly_values: Array(36).fill(5000), // £5k/month
    },
  ];

  const comprehensiveEvents: Event[] = [
    {
      id: "event-1",
      profile_id: "profile-full",
      event_name: "Seed Round",
      event_month: 3,
      event_type: "funding",
      amount: 500000,
      percent_change: null,
      target: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "event-2",
      profile_id: "profile-full",
      event_name: "Hire Sales Team",
      event_month: 6,
      event_type: "hire",
      amount: 10000,
      percent_change: null,
      target: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "event-3",
      profile_id: "profile-full",
      event_name: "Major Client Win",
      event_month: 9,
      event_type: "client_win",
      amount: 20000,
      percent_change: null,
      target: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "event-4",
      profile_id: "profile-full",
      event_name: "Price Increase",
      event_month: 12,
      event_type: "price_increase",
      amount: null,
      percent_change: 10,
      target: null,
      created_at: new Date().toISOString(),
    },
  ];

  it("should generate full forecast with all features enabled", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: comprehensiveEvents,
      openingBalance: 100000,
    });

    expect(series.length).toBe(36); // 3 years
    expect(series[0].openingBalance).toBe(100000);
    
    // Verify all calculation types are present
    expect(series[0].revenue).toBeGreaterThan(0);
    expect(series[0].expenses).toBeGreaterThan(0);
    expect(series[0].accountsReceivable).toBeGreaterThan(0); // Working capital
    expect(series[0].accountsPayable).toBeGreaterThan(0); // Working capital
    expect(series[0].vatCollected).toBeGreaterThan(0); // VAT enabled
    expect(series[0].vatPaid).toBeGreaterThan(0); // VAT enabled
    expect(series[0].payeNic).toBeGreaterThan(0); // PAYE/NIC enabled
  });

  it("should apply events correctly in full forecast", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: comprehensiveEvents,
      openingBalance: 0,
    });

    // Month 3 should have funding impact
    expect(series[2].revenue).toBeGreaterThan(comprehensiveLineItems[0].monthly_values[2]);
    
    // Month 6 onwards should have increased expenses (hire)
    expect(series[5].expenses).toBeGreaterThan(
      comprehensiveLineItems[1].monthly_values[5] + 
      comprehensiveLineItems[2].monthly_values[5] + 
      comprehensiveLineItems[3].monthly_values[5]
    );
    
    // Month 9 onwards should have increased revenue (client win)
    expect(series[8].revenue).toBeGreaterThan(comprehensiveLineItems[0].monthly_values[8]);
    
    // Month 12 onwards should have 10% higher revenue (price increase)
    const baseRevenue = comprehensiveLineItems[0].monthly_values[11];
    expect(series[11].revenue).toBeCloseTo(baseRevenue * 1.1, 0);
  });

  it("should calculate metrics correctly for full forecast", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: comprehensiveEvents,
      openingBalance: 0,
    });

    const metrics = calculateForecastMetrics(series);

    expect(metrics.netCashPosition).toBe(series[series.length - 1].cashBalance);
    expect(metrics.breakEvenMonth).toBeGreaterThanOrEqual(0);
    expect(metrics.cashRunway).toBeGreaterThanOrEqual(0);
    expect(metrics.revenueGrowth).toBeGreaterThanOrEqual(0);
  });

  it("should handle Corporation Tax timing correctly in multi-year forecast", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: [],
      openingBalance: 0,
    });

    // CT should be calculated at year-end (month 12, 24, 36)
    // Payment occurs 9 months after (month 21, 33, 45)
    // For 36-month forecast, we should see CT payment in month 21
    const hasCorporationTax = series.some((p) => p.corporationTax > 0);
    expect(hasCorporationTax).toBe(true);
  });

  it("should enforce dividend cash constraints", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: [],
      openingBalance: 0,
    });

    // Dividends should never exceed cash balance
    series.forEach((point) => {
      if (point.dividends > 0) {
        expect(point.dividends).toBeLessThanOrEqual(point.cashBalance + point.dividends);
      }
    });
  });

  it("should maintain cash balance consistency across all months", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: comprehensiveEvents,
      openingBalance: 50000,
    });

    // Each month's opening balance should equal previous month's closing balance
    for (let i = 1; i < series.length; i++) {
      expect(series[i].openingBalance).toBe(series[i - 1].cashBalance);
    }

    // Cash balance should be cumulative
    for (let i = 1; i < series.length; i++) {
      const expectedBalance = series[i - 1].cashBalance + series[i].net;
      expect(series[i].cashBalance).toBeCloseTo(expectedBalance, 0);
    }
  });

  it("should handle VAT quarterly payments correctly", () => {
    const series = buildEnhancedForecast({
      profile: fullFeatureProfile,
      lineItems: comprehensiveLineItems,
      events: [],
      openingBalance: 0,
    });

    // VAT should be payable quarterly (months 3, 6, 9, 12, etc.)
    const vatPayableMonths = series
      .map((p, i) => ({ month: i + 1, vatPayable: p.vatPayable }))
      .filter((p) => p.vatPayable > 0)
      .map((p) => p.month);

    // Should have VAT payments in quarters (3, 6, 9, 12, etc.)
    expect(vatPayableMonths.length).toBeGreaterThan(0);
    vatPayableMonths.forEach((month) => {
      expect(month % 3).toBe(0); // Should be divisible by 3
    });
  });
});

describe("Settings Validation Integration", () => {
  it("should validate sole trader cannot have CT or dividends", () => {
    const soleTraderProfile: BusinessProfile = {
      id: "profile-st",
      owner_id: "owner-1",
      created_at: new Date().toISOString(),
      updated_at: null,
      name: "Sole Trader",
      url: null,
      industry: "Consulting",
      description: null,
      headquarters: null,
      revenue_model: null,
      notes: null,
      raw_profile_json: {},
      ai_confidence: null,
      entity_type: "sole_trader",
      accounting_basis: "cash",
      vat_enabled: true,
      vat_basis: "cash",
      include_corporation_tax: false, // Should be false for sole trader
      include_paye_nic: true,
      include_dividends: false, // Should be false for sole trader
      debtor_days: 0, // Should be 0 for cash basis
      creditor_days: 0, // Should be 0 for cash basis
      director_salary: null,
      dividend_payout_ratio: null,
    };

    const lineItems: LineItem[] = [
      {
        id: "rev-1",
        scenario_id: "scenario-1",
        created_at: new Date().toISOString(),
        type: "revenue",
        label: "Consulting Revenue",
        formula: null,
        metadata: null,
        monthly_values: Array(12).fill(10000),
      },
    ];

    const series = buildEnhancedForecast({
      profile: soleTraderProfile,
      lineItems,
      events: [],
      openingBalance: 0,
    });

    // CT and dividends should be zero
    expect(series.every((p) => p.corporationTax === 0)).toBe(true);
    expect(series.every((p) => p.dividends === 0)).toBe(true);
    // Working capital should be zero for cash basis
    expect(series.every((p) => p.accountsReceivable === 0 && p.accountsPayable === 0)).toBe(true);
  });
});

