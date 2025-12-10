"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";
import type { User } from "@/types/database";

// Mock authentication - in production, this would call an API
async function authenticate(email: string, password: string): Promise<User | null> {
  // This is a mock - replace with real authentication
  // For now, we'll use a simple check
  const mockUsers: Record<string, User> = {
    "client@example.com": {
      id: "user-client-1",
      email: "client@example.com",
      name: "Client User",
      role: "client",
      practice_id: null,
      created_at: new Date().toISOString(),
      updated_at: null,
      last_login: null,
      is_active: true,
    },
    "accountant@example.com": {
      id: "user-accountant-1",
      email: "accountant@example.com",
      name: "Accountant User",
      role: "accountant",
      practice_id: "practice-1",
      created_at: new Date().toISOString(),
      updated_at: null,
      last_login: null,
      is_active: true,
    },
    "admin@example.com": {
      id: "user-admin-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      practice_id: "practice-1",
      created_at: new Date().toISOString(),
      updated_at: null,
      last_login: null,
      is_active: true,
    },
  };

  // In production, validate password
  if (mockUsers[email]) {
    return mockUsers[email];
  }
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await authenticate(email, password);
      if (user) {
        setUser(user);
        router.push("/hub");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="p-6">
            <h1 className="mb-2 text-2xl font-bold text-[#15213C]">Welcome Back</h1>
            <p className="mb-6 text-[#5C6478]">Sign in to access your business profiles</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#15213C]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-[#15213C]">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 border-t border-[#E1E4EA] pt-6">
              <p className="mb-3 text-sm text-[#5C6478]">Demo accounts:</p>
              <div className="space-y-2 text-xs text-[#5C6478]">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("client@example.com");
                    setPassword("demo");
                  }}
                  className="block text-left hover:text-[#15213C]"
                >
                  Client: client@example.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("accountant@example.com");
                    setPassword("demo");
                  }}
                  className="block text-left hover:text-[#15213C]"
                >
                  Accountant: accountant@example.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@example.com");
                    setPassword("demo");
                  }}
                  className="block text-left hover:text-[#15213C]"
                >
                  Admin: admin@example.com
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

