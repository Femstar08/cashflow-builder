import { NextResponse } from "next/server";
import * as profileService from "@/lib/data/profile-service";
import * as scenarioService from "@/lib/data/scenario-service";
import * as lineItemService from "@/lib/data/line-item-service";
import * as eventService from "@/lib/data/event-service";
import type {
  BusinessProfileDraft,
  CashflowAssumptions,
} from "@/lib/ai/agent-prompt";
import type { BusinessProfileInsert } from "@/types/database";
import type { HorizonId } from "@/lib/utils";

const OWNER_PLACEHOLDER = "demo-owner";

function mapForecastPeriodToHorizon(months: 12 | 36 | 60 | 120): HorizonId {
  switch (months) {
    case 12:
      return "1y";
    case 36:
      return "3y";
    case 60:
      return "5y";
    case 120:
      return "10y";
    default:
      return "3y";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessProfile, cashflowAssumptions, ownerId = OWNER_PLACEHOLDER } = body as {
      businessProfile: BusinessProfileDraft;
      cashflowAssumptions: CashflowAssumptions;
      ownerId?: string;
    };

    if (!businessProfile || !cashflowAssumptions) {
      return NextResponse.json(
        { error: "Business profile and cashflow assumptions are required" },
        { status: 400 }
      );
    }

    // Convert BusinessProfileDraft to BusinessProfileInsert
    const profileInsert: BusinessProfileInsert = {
      owner_id: ownerId,
      name: businessProfile.business_name || "Untitled Business",
      industry: businessProfile.industry || null,
      description: businessProfile.business_model || null,
      entity_type: (businessProfile.entity_type === "unknown" || businessProfile.entity_type === "partnership") 
        ? null 
        : (businessProfile.entity_type === "limited_company" || businessProfile.entity_type === "sole_trader" 
          ? businessProfile.entity_type 
          : null),
      accounting_basis: businessProfile.tax_settings?.accounting_basis || null,
      vat_enabled: businessProfile.tax_settings?.vat_enabled ?? null,
      vat_basis: businessProfile.tax_settings?.vat_basis || null,
      include_corporation_tax: businessProfile.tax_settings?.include_corporation_tax ?? null,
      include_paye_nic: businessProfile.tax_settings?.include_paye_nic ?? null,
      include_dividends: businessProfile.tax_settings?.include_dividends ?? null,
      debtor_days: businessProfile.working_capital?.debtor_days ?? null,
      creditor_days: businessProfile.working_capital?.creditor_days ?? null,
      director_salary: null, // Can be set later
      dividend_payout_ratio: null, // Can be set later
      raw_profile_json: {
        businessProfile,
        cashflowAssumptions,
        generatedBy: "agent",
        generatedAt: new Date().toISOString(),
      },
    };

    // Create the profile
    const profile = await profileService.createProfile(profileInsert);

    // Create the default scenario
    const horizon = mapForecastPeriodToHorizon(businessProfile.forecast_period_months || 36);
    const scenario = await scenarioService.createScenario({
      profile_id: profile.id,
      name: "Base Forecast",
      horizon,
      status: "draft",
      base_assumptions: {
        opening_cash: cashflowAssumptions.opening_cash,
        growth_rates: cashflowAssumptions.growth_rates,
        margin_assumptions: cashflowAssumptions.margin_assumptions,
        tax_rates: cashflowAssumptions.tax_rates,
      },
    });

    // Create revenue line items
    for (const revenue of cashflowAssumptions.revenue_assumptions || []) {
      await lineItemService.createLineItem({
        scenario_id: scenario.id,
        type: "revenue",
        label: revenue.label,
        monthly_values: revenue.monthly_values,
        metadata: {},
      });
    }

    // Create cost line items
    for (const cost of cashflowAssumptions.cost_assumptions || []) {
      await lineItemService.createLineItem({
        scenario_id: scenario.id,
        type: cost.type,
        label: cost.label,
        monthly_values: cost.monthly_values,
        metadata: {},
      });
    }

    // Create events
    // Funding events
    for (const funding of cashflowAssumptions.funding_events || []) {
      await eventService.createEvent({
        profile_id: profile.id,
        event_name: funding.event_name,
        event_month: funding.event_month,
        event_type: "funding",
        amount: funding.amount,
      });
    }

    // Hiring events
    for (const hiring of cashflowAssumptions.hiring_events || []) {
      await eventService.createEvent({
        profile_id: profile.id,
        event_name: hiring.event_name,
        event_month: hiring.event_month,
        event_type: "hire",
        amount: hiring.monthly_cost,
      });
    }

    // Pricing changes
    for (const pricing of cashflowAssumptions.pricing_changes || []) {
      await eventService.createEvent({
        profile_id: profile.id,
        event_name: pricing.event_name,
        event_month: pricing.event_month,
        event_type: "price_increase",
        percent_change: pricing.percent_change,
      });
    }

    // One-off costs (can be modeled as events or line items)
    for (const cost of cashflowAssumptions.one_off_costs || []) {
      // Create as a one-time expense line item
      const monthlyValues = new Array(businessProfile.forecast_period_months || 36).fill(0);
      monthlyValues[cost.event_month - 1] = cost.amount;
      await lineItemService.createLineItem({
        scenario_id: scenario.id,
        type: "opex",
        label: cost.event_name,
        monthly_values: monthlyValues,
        metadata: { one_off: true },
      });
    }

    // Also add events from businessProfile.events if any
    for (const event of businessProfile.events || []) {
      await eventService.createEvent({
        profile_id: profile.id,
        event_name: event.event_name,
        event_month: event.event_month,
        event_type: event.event_type,
        amount: event.amount ?? null,
        percent_change: event.percent_change ?? null,
      });
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      scenarioId: scenario.id,
      message: "Profile and forecast created successfully",
    });
  } catch (error) {
    console.error("Failed to generate profile:", error);
    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to generate profile",
      },
      { status: 500 }
    );
  }
}

