import { getSupabaseAdmin } from "./client";
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

// Business Profiles
export async function listProfiles(ownerId: UUID): Promise<BusinessProfile[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_business_profiles")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as BusinessProfile[];
  } catch (error) {
    console.error("Error listing profiles:", error);
    return [];
  }
}

export async function createProfile(payload: BusinessProfileInsert): Promise<BusinessProfile> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_business_profiles")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as BusinessProfile;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
}

export async function getProfile(profileId: UUID): Promise<BusinessProfile | null> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_business_profiles")
      .select("*")
      .eq("id", profileId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data as BusinessProfile;
  } catch (error) {
    console.error("Error getting profile:", error);
    return null;
  }
}

export async function updateProfile(
  profileId: UUID,
  updates: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_business_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profileId)
      .select()
      .single();

    if (error) throw error;
    return data as BusinessProfile;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

// Cashflow Scenarios
export async function listScenarios(profileId: UUID): Promise<CashflowScenario[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_cashflow_scenarios")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as CashflowScenario[];
  } catch (error) {
    console.error("Error listing scenarios:", error);
    return [];
  }
}

export async function createScenario(payload: CashflowScenarioInsert): Promise<CashflowScenario> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_cashflow_scenarios")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as CashflowScenario;
  } catch (error) {
    console.error("Error creating scenario:", error);
    throw error;
  }
}

// Line Items
export async function listLineItems(scenarioId: UUID): Promise<LineItem[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_line_items")
      .select("*")
      .eq("scenario_id", scenarioId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []).map((item) => ({
      ...item,
      monthly_values: Array.isArray(item.monthly_values) ? item.monthly_values : [],
    })) as LineItem[];
  } catch (error) {
    console.error("Error listing line items:", error);
    return [];
  }
}

export async function createLineItem(payload: LineItemInsert): Promise<LineItem> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_line_items")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      monthly_values: Array.isArray(data.monthly_values) ? data.monthly_values : [],
    } as LineItem;
  } catch (error) {
    console.error("Error creating line item:", error);
    throw error;
  }
}

export async function deleteLineItem(id: UUID): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("cf_line_items").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting line item:", error);
    throw error;
  }
}

// Events
export async function listEvents(profileId: UUID): Promise<Event[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_events")
      .select("*")
      .eq("profile_id", profileId)
      .order("event_month", { ascending: true });

    if (error) throw error;
    return (data || []) as Event[];
  } catch (error) {
    console.error("Error listing events:", error);
    return [];
  }
}

export async function createEvent(payload: EventInsert): Promise<Event> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_events")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as Event;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export async function updateEvent(eventId: UUID, updates: Partial<Event>): Promise<Event> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_events")
      .update(updates)
      .eq("id", eventId)
      .select()
      .single();

    if (error) throw error;
    return data as Event;
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
}

export async function deleteEvent(eventId: UUID): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("cf_events").delete().eq("id", eventId);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}

// AI Recommendations
export async function listRecommendations(scenarioId: UUID): Promise<AiRecommendation[]> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_ai_recommendations")
      .select("*")
      .eq("scenario_id", scenarioId)
      .eq("accepted", false)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as AiRecommendation[];
  } catch (error) {
    console.error("Error listing recommendations:", error);
    return [];
  }
}

export async function createRecommendation(
  payload: AiRecommendationInsert
): Promise<AiRecommendation> {
  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("cf_ai_recommendations")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as AiRecommendation;
  } catch (error) {
    console.error("Error creating recommendation:", error);
    throw error;
  }
}

