type NavItem = {
  href: string;
  label: string;
  description: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/agent",
    label: "Agent",
    description: "Conversational cashflow builder",
  },
  {
    href: "/profile/new",
    label: "1 · Business Profile",
    description: "Guided intake & notes",
  },
  {
    href: "/dashboard",
    label: "2 · Cashflow Workspace",
    description: "Model revenue & expenses collaboratively",
  },
  {
    href: "/exports",
    label: "3 · Review & Export",
    description: "QA insights & download Excel outputs",
  },
];

