export function cn(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(" ");
}

export const horizons = [
  { id: "1y", label: "1 Year" },
  { id: "3y", label: "3 Years" },
  { id: "5y", label: "5 Years" },
  { id: "10y", label: "10 Years" },
] as const;

export type HorizonId = (typeof horizons)[number]["id"];

