import * as instantService from "@/lib/instantdb/service";
import type { AiRecommendation, AiRecommendationInsert, UUID } from "@/types/database";

export async function listRecommendations(scenarioId: UUID): Promise<AiRecommendation[]> {
  return instantService.listRecommendations(scenarioId);
}

export async function createRecommendation(payload: AiRecommendationInsert): Promise<AiRecommendation> {
  return instantService.createRecommendation(payload);
}

