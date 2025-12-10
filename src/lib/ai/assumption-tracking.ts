/**
 * Assumption Tracking Utilities
 * 
 * Functions to help the agent track, store, and retrieve assumptions
 */

export type AssumptionCategory = 
  | "staffing" 
  | "revenue" 
  | "costs" 
  | "tax" 
  | "working_capital" 
  | "events" 
  | "other";

export type AssumptionStatus = "active" | "updated" | "superseded";

export type ProfileAssumption = {
  id: string;
  profile_id: string;
  assumption: string;
  reason?: string;
  category?: AssumptionCategory;
  status?: AssumptionStatus;
  updated_by_assumption_id?: string;
  created_at: string;
  created_by?: string;
};

export type AssumptionInsert = {
  profile_id: string;
  assumption: string;
  reason?: string;
  category?: AssumptionCategory;
  status?: AssumptionStatus;
  updated_by_assumption_id?: string;
  created_by?: string;
};

/**
 * Format assumption for display
 */
export function formatAssumption(assumption: ProfileAssumption): string {
  let text = assumption.assumption;
  if (assumption.reason) {
    text += ` (${assumption.reason})`;
  }
  return text;
}

/**
 * Group assumptions by category
 */
export function groupAssumptionsByCategory(
  assumptions: ProfileAssumption[]
): Record<AssumptionCategory, ProfileAssumption[]> {
  const grouped: Record<string, ProfileAssumption[]> = {
    staffing: [],
    revenue: [],
    costs: [],
    tax: [],
    working_capital: [],
    events: [],
    other: [],
  };

  for (const assumption of assumptions) {
    const category = assumption.category || "other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(assumption);
  }

  return grouped as Record<AssumptionCategory, ProfileAssumption[]>;
}

/**
 * Get active assumptions only
 */
export function getActiveAssumptions(assumptions: ProfileAssumption[]): ProfileAssumption[] {
  return assumptions.filter(
    (a) => !a.status || a.status === "active"
  );
}

/**
 * Infer category from assumption text
 */
export function inferCategory(assumption: string): AssumptionCategory {
  const lower = assumption.toLowerCase();
  if (lower.includes("employee") || lower.includes("staff") || lower.includes("hire") || lower.includes("payroll")) {
    return "staffing";
  }
  if (lower.includes("revenue") || lower.includes("sales") || lower.includes("income") || lower.includes("pricing")) {
    return "revenue";
  }
  if (lower.includes("cost") || lower.includes("expense") || lower.includes("spend")) {
    return "costs";
  }
  if (lower.includes("vat") || lower.includes("tax") || lower.includes("corporation")) {
    return "tax";
  }
  if (lower.includes("debtor") || lower.includes("creditor") || lower.includes("payment") || lower.includes("terms")) {
    return "working_capital";
  }
  if (lower.includes("event") || lower.includes("funding") || lower.includes("hire") || lower.includes("client")) {
    return "events";
  }
  return "other";
}

