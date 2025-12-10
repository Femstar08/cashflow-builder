import * as supabaseService from "@/lib/supabase/service";
import type { AiRecommendation, AiRecommendationInsert, UUID } from "@/types/database";

export async function listRecommendations(scenarioId: UUID): Promise<AiRecommendation[]> {
  return supabaseService.listRecommendations(scenarioId);
}

export async function createRecommendation(payload: AiRecommendationInsert): Promise<AiRecommendation> {
  return supabaseService.createRecommendation(payload);
}

