"use client";

import React from "react";
import { NAV_ITEMS } from "@/lib/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactElement> = {
    agent: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    profile: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    workspace: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    export: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  };
  return icons[name] || null;
};

const getIconForHref = (href: string): string => {
  if (href.includes("agent")) return "agent";
  if (href.includes("profile")) return "profile";
  if (href.includes("dashboard")) return "workspace";
  if (href.includes("export")) return "export";
  return "workspace";
};

export function Sidebar() {
  const pathname = usePathname();

  const NavItem = ({ href, label, description }: { href: string; label: string; description: string }) => {
    const isActive = pathname === href || pathname?.startsWith(href + "/");
    const iconName = getIconForHref(href);
    
    return (
      <Link
        href={href}
        className={`block px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? "bg-[#53E9C5] text-[#15213C]"
            : "text-white/70 hover:bg-[#1a2a4a] hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon name={iconName} className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{label}</p>
            <p className={`text-xs ${isActive ? "text-[#15213C]/70" : "text-white/50"}`}>{description}</p>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-[#5C6478]/30 bg-[#15213C] p-4 lg:block overflow-y-auto">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-[#53E9C5] flex items-center justify-center">
          <svg className="h-5 w-5 text-[#15213C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Beacon & Ledger</p>
          <p className="text-xs text-[#53E9C5]">Cashflow Builder</p>
        </div>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavItem {...item} />
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

