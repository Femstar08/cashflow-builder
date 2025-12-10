"use client";

import Link from "next/link";

export function DashboardCards() {
  const cards = [
    {
      id: "profiles",
      title: "Business Profiles",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      value: null,
      valueColor: "text-[#53E9C5]",
      description: "Create and manage your business profiles for cashflow forecasting",
      actionText: "Create Profile",
      actionColor: "text-[#53E9C5]",
      href: "/profile/new",
    },
    {
      id: "forecasts",
      title: "Cashflow Forecasts",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      value: null,
      valueColor: "text-purple-400",
      description: "View and analyze your cashflow projections and scenarios",
      actionText: "View Forecasts",
      actionColor: "text-purple-400",
      href: "/dashboard",
    },
    {
      id: "agent",
      title: "AI Agent",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      value: null,
      valueColor: "text-yellow-400",
      description: "Get help building your cashflow forecast with AI assistance",
      actionText: "Talk to Agent",
      actionColor: "text-yellow-400",
      href: "/agent",
    },
    {
      id: "exports",
      title: "Exports & Reports",
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      value: null,
      valueColor: "text-[#53E9C5]",
      description: "Export your forecasts to Excel and generate presentation reports",
      actionText: "View Exports",
      actionColor: "text-[#53E9C5]",
      href: "/exports",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className="rounded-xl border border-[#5C6478]/30 bg-gradient-to-br from-[#15213C] to-[#1a2a4a] p-6 text-white hover:border-[#53E9C5]/50 transition-all duration-200"
        >
          <div className="mb-4 text-[#53E9C5]">{card.icon}</div>
          <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
          <p className="text-sm text-[#5C6478] mb-4">{card.description}</p>
          <Link
            href={card.href}
            className={`inline-flex items-center gap-2 text-sm font-medium ${card.actionColor} hover:opacity-80 transition-opacity`}
          >
            {card.actionText}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
}

