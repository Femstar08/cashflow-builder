import * as supabaseService from "@/lib/supabase/service";
import type { CashflowScenario, CashflowScenarioInsert, UUID } from "@/types/database";

export async function listScenarios(profileId: UUID): Promise<CashflowScenario[]> {
  return supabaseService.listScenarios(profileId);
}

export async function createScenario(payload: CashflowScenarioInsert): Promise<CashflowScenario> {
  return supabaseService.createScenario(payload);
}

