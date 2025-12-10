"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navigation";
import { SegmentControl } from "@/components/ui/segment-control";
import { horizons } from "@/lib/utils";
import { useUiStore } from "@/stores/ui-store";
import { useUserStore } from "@/stores/user-store";

export function TopNav() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const horizon = useUiStore((state) => state.activeHorizon);
  const setHorizon = useUiStore((state) => state.setHorizon);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "client":
        return "Client";
      case "accountant":
        return "Accountant";
      case "admin":
        return "Admin";
      default:
        return role;
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[#E1E4EA] bg-[#15213C]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Beacon & Ledger</p>
          <h1 className="mt-1 text-xl font-semibold text-white">
            Cashflow Builder
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {user && (
            <>
              <Link
                href="/hub"
                className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                My Profiles
              </Link>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name || user.email}</p>
                  <p className="text-xs text-white/70">{getRoleLabel(user.role)}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  Logout
                </button>
              </div>
            </>
          )}
          {!user && (
            <Link
              href="/login"
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Login
            </Link>
          )}
        </div>
      </div>
      {user && (
        <nav className="border-t border-[#1a2a4a]">
          <div className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-1 border-b-2 border-transparent py-4 text-sm text-white/70 transition-colors hover:text-white hover:border-[#53E9C5]"
              >
                <span className="font-medium">{item.label}</span>
                <span className="text-xs text-white/50">{item.description}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}

