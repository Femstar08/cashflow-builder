import * as supabaseService from "@/lib/supabase/service";
import type { LineItem, LineItemInsert, UUID } from "@/types/database";

export async function listLineItems(scenarioId: UUID): Promise<LineItem[]> {
  return supabaseService.listLineItems(scenarioId);
}

export async function createLineItem(payload: LineItemInsert): Promise<LineItem> {
  return supabaseService.createLineItem(payload);
}

export async function deleteLineItem(id: UUID): Promise<void> {
  return supabaseService.deleteLineItem(id);
}

