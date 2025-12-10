"use client";

import { create } from "zustand";
import type { HorizonId } from "@/lib/utils";

type UiState = {
  activeHorizon: HorizonId;
  setHorizon: (value: HorizonId) => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeHorizon: "3y",
  setHorizon: (value) => set({ activeHorizon: value }),
}));

