import * as instantService from "@/lib/instantdb/service";
import type { LineItem, LineItemInsert, UUID } from "@/types/database";

export async function listLineItems(scenarioId: UUID): Promise<LineItem[]> {
  return instantService.listLineItems(scenarioId);
}

export async function createLineItem(payload: LineItemInsert): Promise<LineItem> {
  return instantService.createLineItem(payload);
}

export async function deleteLineItem(id: UUID): Promise<void> {
  return instantService.deleteLineItem(id);
}

