import * as supabaseService from "@/lib/supabase/service";
import type { BusinessProfile, BusinessProfileInsert, UUID } from "@/types/database";

export async function listProfiles(ownerId: UUID): Promise<BusinessProfile[]> {
  return supabaseService.listProfiles(ownerId);
}

export async function createProfile(payload: BusinessProfileInsert): Promise<BusinessProfile> {
  return supabaseService.createProfile(payload);
}

export async function getProfile(profileId: UUID): Promise<BusinessProfile | null> {
  return supabaseService.getProfile(profileId);
}

export async function updateProfile(profileId: UUID, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
  return supabaseService.updateProfile(profileId, updates);
}

