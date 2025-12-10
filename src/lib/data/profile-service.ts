import * as instantService from "@/lib/instantdb/service";
import type { BusinessProfile, BusinessProfileInsert, UUID } from "@/types/database";

export async function listProfiles(ownerId: UUID): Promise<BusinessProfile[]> {
  return instantService.listProfiles(ownerId);
}

export async function createProfile(payload: BusinessProfileInsert): Promise<BusinessProfile> {
  return instantService.createProfile(payload);
}

export async function getProfile(profileId: UUID): Promise<BusinessProfile | null> {
  return instantService.getProfile(profileId);
}

export async function updateProfile(profileId: UUID, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
  return instantService.updateProfile(profileId, updates);
}

