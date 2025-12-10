"use server";

import { createProfile, updateProfile } from "@/lib/data/profile-service";
import type { BusinessProfileInsert, BusinessProfile } from "@/types/database";
import { generateProfileDraft } from "@/lib/ai/profile";

type DraftInput = {
  url?: string;
  textInput?: string;
  industry?: string;
  name?: string;
  description?: string;
};

export async function draftProfileFromUrl(payload: DraftInput) {
  if (!payload.url && !payload.textInput) {
    throw new Error("Either URL or text input is required");
  }

  await new Promise((resolve) => setTimeout(resolve, 600));

  const aiDraft = await generateProfileDraft({
    url: payload.url,
    textInput: payload.textInput,
    hint: payload.industry,
    description: payload.description,
  });

  return {
    suggestedProfile: {
      ...aiDraft,
      url: payload.url || null,
    },
    recommendedFields: [
      "ICP: Mid-market firms (50-500 FTE)",
      "Primary KPIs: ARR growth, payback period",
      "Top risks: Churn concentration, FX exposure",
    ],
  };
}

type SaveInput = BusinessProfileInsert & { simulate?: boolean };

export async function saveProfileDraft(payload: SaveInput) {
  if (!payload.owner_id) {
    throw new Error("owner_id is required");
  }

  if (payload.simulate) {
    return { data: { ...payload, id: "mock-id" }, simulated: true };
  }

  const data = await createProfile({
    raw_profile_json: payload.raw_profile_json ?? {},
    notes: payload.notes ?? null,
    ...payload,
  });

  return { data, simulated: false };
}

type UpdateSettingsInput = {
  profileId: string;
  settings: Partial<BusinessProfile>;
};

export async function updateProfileSettings(payload: UpdateSettingsInput) {
  if (!payload.profileId) {
    throw new Error("profileId is required");
  }

  const data = await updateProfile(payload.profileId, payload.settings);
  return { data };
}


