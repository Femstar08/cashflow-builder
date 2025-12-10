import * as instantService from "@/lib/instantdb/service";
import type { CashflowScenario, CashflowScenarioInsert, UUID } from "@/types/database";

export async function listScenarios(profileId: UUID): Promise<CashflowScenario[]> {
  return instantService.listScenarios(profileId);
}

export async function createScenario(payload: CashflowScenarioInsert): Promise<CashflowScenario> {
  return instantService.createScenario(payload);
}

