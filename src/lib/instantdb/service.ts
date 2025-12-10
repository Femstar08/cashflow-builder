import type { AppSchema } from "./schema";
import type {
  BusinessProfile,
  BusinessProfileInsert,
  CashflowScenario,
  CashflowScenarioInsert,
  LineItem,
  LineItemInsert,
  AiRecommendation,
  AiRecommendationInsert,
  Event,
  EventInsert,
  UUID,
} from "@/types/database";

// Server-side InstantDB service using admin API
// For client-side, use the React hooks from @instantdb/react

const INSTANT_APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const INSTANT_ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

// Note: InstantDB's server-side API may vary. This is a placeholder implementation.
// For production, refer to InstantDB's admin SDK documentation.
// For now, this falls back to mock data when credentials are missing.

async function instantRequest(endpoint: string, options: RequestInit = {}) {
  if (!INSTANT_APP_ID || !INSTANT_ADMIN_TOKEN) {
    // Return empty result to trigger fallback to mock data
    return { data: null };
  }

  // InstantDB REST API endpoint (adjust based on actual InstantDB API docs)
  const url = `https://api.instant.dev/v1/${INSTANT_APP_ID}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${INSTANT_ADMIN_TOKEN}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Fallback to mock data on any error
    console.warn("[InstantDB] Request failed, using fallback:", error);
    return { data: null };
  }
}

// Business Profiles
export async function listProfiles(ownerId: UUID): Promise<BusinessProfile[]> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          business_profiles: {
            $: { where: { owner_id: ownerId } },
            id: true,
            owner_id: true,
            created_at: true,
            updated_at: true,
            name: true,
            url: true,
            industry: true,
            description: true,
            headquarters: true,
            revenue_model: true,
            notes: true,
            raw_profile_json: true,
            ai_confidence: true,
            entity_type: true,
            accounting_basis: true,
            vat_enabled: true,
            vat_basis: true,
            include_corporation_tax: true,
            include_paye_nic: true,
            include_dividends: true,
            debtor_days: true,
            creditor_days: true,
            director_salary: true,
            dividend_payout_ratio: true,
          },
        },
      }),
    });
    return (result.data?.business_profiles || []) as BusinessProfile[];
  } catch {
    return [];
  }
}

export async function createProfile(payload: BusinessProfileInsert): Promise<BusinessProfile> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "insert",
          table: "business_profiles",
          data: {
            ...payload,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            raw_profile_json: payload.raw_profile_json || {},
          },
        },
      ],
    }),
  });
  return result.data as BusinessProfile;
}

export async function getProfile(profileId: UUID): Promise<BusinessProfile | null> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          business_profiles: {
            $: { where: { id: profileId } },
            id: true,
            owner_id: true,
            created_at: true,
            updated_at: true,
            name: true,
            url: true,
            industry: true,
            description: true,
            headquarters: true,
            revenue_model: true,
            notes: true,
            raw_profile_json: true,
            ai_confidence: true,
            entity_type: true,
            accounting_basis: true,
            vat_enabled: true,
            vat_basis: true,
            include_corporation_tax: true,
            include_paye_nic: true,
            include_dividends: true,
            debtor_days: true,
            creditor_days: true,
            director_salary: true,
            dividend_payout_ratio: true,
          },
        },
      }),
    });
    return (result.data?.business_profiles?.[0] || null) as BusinessProfile | null;
  } catch {
    return null;
  }
}

export async function updateProfile(profileId: UUID, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "update",
          table: "business_profiles",
          id: profileId,
          data: {
            ...updates,
            updated_at: new Date().toISOString(),
          },
        },
      ],
    }),
  });
  return result.data as BusinessProfile;
}

// Scenarios
export async function listScenarios(profileId: UUID): Promise<CashflowScenario[]> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          cashflow_scenarios: {
            $: { where: { profile_id: profileId } },
            id: true,
            profile_id: true,
            created_at: true,
            updated_at: true,
            name: true,
            horizon: true,
            status: true,
            base_assumptions: true,
            user_overrides: true,
          },
        },
      }),
    });
    return (result.data?.cashflow_scenarios || []) as CashflowScenario[];
  } catch {
    return [];
  }
}

export async function createScenario(payload: CashflowScenarioInsert): Promise<CashflowScenario> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "insert",
          table: "cashflow_scenarios",
          data: {
            ...payload,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            base_assumptions: payload.base_assumptions || {},
            user_overrides: payload.user_overrides || {},
            status: payload.status || "draft",
          },
        },
      ],
    }),
  });
  return result.data as CashflowScenario;
}

// Line Items
export async function listLineItems(scenarioId: UUID): Promise<LineItem[]> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          line_items: {
            $: { where: { scenario_id: scenarioId } },
            id: true,
            scenario_id: true,
            created_at: true,
            type: true,
            label: true,
            formula: true,
            metadata: true,
            monthly_values: true,
          },
        },
      }),
    });
    return (result.data?.line_items || []) as LineItem[];
  } catch {
    return [];
  }
}

export async function createLineItem(payload: LineItemInsert): Promise<LineItem> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "insert",
          table: "line_items",
          data: {
            ...payload,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            formula: payload.formula || null,
            metadata: payload.metadata || {},
            monthly_values: payload.monthly_values || [],
          },
        },
      ],
    }),
  });
  return result.data as LineItem;
}

export async function deleteLineItem(id: UUID): Promise<void> {
  await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "delete",
          table: "line_items",
          id,
        },
      ],
    }),
  });
}

// Recommendations
export async function listRecommendations(scenarioId: UUID): Promise<AiRecommendation[]> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          ai_recommendations: {
            $: { where: { scenario_id: scenarioId } },
            id: true,
            scenario_id: true,
            line_item_id: true,
            created_at: true,
            summary: true,
            detail: true,
            accepted: true,
            source: true,
          },
        },
      }),
    });
    return (result.data?.ai_recommendations || []) as AiRecommendation[];
  } catch {
    return [];
  }
}

export async function createRecommendation(payload: AiRecommendationInsert): Promise<AiRecommendation> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "insert",
          table: "ai_recommendations",
          data: {
            ...payload,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            detail: payload.detail || null,
            accepted: payload.accepted ?? false,
            line_item_id: payload.line_item_id || null,
          },
        },
      ],
    }),
  });
  return result.data as AiRecommendation;
}

// Events
export async function listEvents(profileId: UUID): Promise<Event[]> {
  try {
    const result = await instantRequest(`/query`, {
      method: "POST",
      body: JSON.stringify({
        query: {
          events: {
            $: { where: { profile_id: profileId } },
            id: true,
            profile_id: true,
            created_at: true,
            event_name: true,
            event_month: true,
            event_type: true,
            amount: true,
            percent_change: true,
            target: true,
          },
        },
      }),
    });
    return (result.data?.events || []) as Event[];
  } catch {
    return [];
  }
}

export async function createEvent(payload: EventInsert): Promise<Event> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "insert",
          table: "events",
          data: {
            ...payload,
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            amount: payload.amount || null,
            percent_change: payload.percent_change || null,
            target: payload.target || null,
          },
        },
      ],
    }),
  });
  return result.data as Event;
}

export async function updateEvent(eventId: UUID, updates: Partial<Event>): Promise<Event> {
  const result = await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "update",
          table: "events",
          id: eventId,
          data: updates,
        },
      ],
    }),
  });
  return result.data as Event;
}

export async function deleteEvent(eventId: UUID): Promise<void> {
  await instantRequest(`/transact`, {
    method: "POST",
    body: JSON.stringify({
      operations: [
        {
          type: "delete",
          table: "events",
          id: eventId,
        },
      ],
    }),
  });
}

