import { create } from "zustand";
import type { User, UserRole } from "@/types/database";

type UserStore = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  canEditProfile: (profileOwnerId: string, profileShares?: Array<{ user_id: string; permission: string }>) => boolean;
  canViewProfile: (profileOwnerId: string, profileShares?: Array<{ user_id: string; permission: string }>) => boolean;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Clear any auth tokens/cookies
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  },
  hasRole: (role) => {
    const user = get().user;
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  },
  canEditProfile: (profileOwnerId, profileShares) => {
    const user = get().user;
    if (!user) return false;
    
    // Admin can edit all
    if (user.role === "admin") return true;
    
    // Owner can edit
    if (user.id === profileOwnerId) return true;
    
    // Check if user has edit permission via share
    if (profileShares) {
      const share = profileShares.find((s) => s.user_id === user.id);
      if (share && (share.permission === "edit" || share.permission === "comment")) {
        // Accountants have priority - if accountant is editing, client can only comment
        // This logic will be handled in the UI layer
        return true;
      }
    }
    
    return false;
  },
  canViewProfile: (profileOwnerId, profileShares) => {
    const user = get().user;
    if (!user) return false;
    
    // Admin can view all
    if (user.role === "admin") return true;
    
    // Owner can view
    if (user.id === profileOwnerId) return true;
    
    // Check if user has view permission via share
    if (profileShares) {
      const share = profileShares.find((s) => s.user_id === user.id);
      if (share && share.status === "accepted") return true;
    }
    
    return false;
  },
}));

