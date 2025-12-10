"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user-store";

const features = [
  {
    title: "Guided Profile Creation",
    detail: "I'll guide you through creating your business profile in minutes.",
  },
  {
    title: "Smart Revenue & Expense Management",
    detail: "Easily add revenue streams and expenses with prominent buttons and my suggestions.",
  },
  {
    title: "Scenario Modeling",
    detail: "Create and compare multiple scenarios to see how different assumptions affect your cashflow.",
  },
  {
    title: "SMART Goals Tracking",
    detail: "Set and track SMART goals with my help to keep your business on track.",
  },
  {
    title: "Insights & Chat",
    detail: "Get instant insights about your cashflow through an interactive chat interface.",
  },
  {
    title: "Excel Export",
    detail: "Export your forecasts to Excel with full formula support for offline analysis.",
  },
];

const journeySteps = [
  {
    number: 1,
    title: "Agent Assistant",
    description: "I'll guide you through profile creation with intelligent questions and professional insights.",
    action: { label: "Talk to Agent", href: "/agent" },
  },
  {
    number: 2,
    title: "Create Business Profile",
    description: "Start with our guided wizard that walks you through creating your business profile with my help.",
    action: { label: "Start Profile", href: "/profile/new" },
  },
  {
    number: 3,
    title: "Add Revenue & Expenses",
    description: "Use the prominent Add buttons to quickly add revenue streams and expenses. Get my suggestions to ensure completeness.",
    action: { label: "View Dashboard", href: "/dashboard/profile-demo" },
  },
  {
    number: 4,
    title: "Create Scenarios & Goals",
    description: "Model different business outcomes with scenarios and set SMART goals to track your progress.",
    action: { label: "Explore Features", href: "/dashboard/profile-demo" },
  },
];

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    // Redirect authenticated users to hub
    if (isAuthenticated) {
      router.push("/hub");
    }
  }, [isAuthenticated, router]);

  // Show login prompt for unauthenticated users
  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="rounded-xl border border-[#E1E4EA] bg-[#15213C] p-8 text-white shadow-sm">
          <div className="mb-4">
            <h1 className="text-3xl font-bold md:text-4xl text-white">Cashflow Builder</h1>
            <p className="mt-2 text-lg text-white/90 md:text-xl">
              Professional cashflow forecasting for UK businesses. Create accurate financial forecasts with my help.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="px-8 py-4 text-lg">
              <Link href="/agent">Talk to Agent</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 px-8 py-4">
              <Link href="/profile/new">Create Profile Manually</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20 px-8 py-4">
              <Link href="/dashboard/profile-demo">View Demo Dashboard</Link>
            </Button>
          </div>
        </div>

        {/* Journey Steps */}
        <Card 
          title="Your Journey" 
          description="Follow these steps to build your comprehensive cashflow forecast"
        >
          <div className="grid gap-6 md:grid-cols-4">
            {journeySteps.map((step, index) => (
              <div key={`${step.title}-${index}`} className="flex flex-col rounded-lg border border-[#E1E4EA] bg-white p-6 card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#15213C] text-sm font-bold text-white">
                  {step.number}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#15213C] mb-2">{step.title}</p>
                  <p className="text-sm text-[#5C6478] mb-4">{step.description}</p>
                </div>
                <Button asChild variant="outline" className="mt-auto w-full">
                  <Link href={step.action.href}>{step.action.label}</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Features Grid */}
        <Card
          title="Features"
          description="Everything you need for accurate cashflow forecasting and business planning"
        >
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-lg border border-[#E1E4EA] bg-white p-5 card-hover">
                <p className="text-base font-semibold text-[#15213C] mb-2">{feature.title}</p>
                <p className="text-sm text-[#5C6478]">{feature.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Call to Action */}
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-[#15213C] mb-3">Ready to Get Started?</h2>
          <p className="text-[#5C6478] mb-6">
            Create professional cashflow forecasts with Beacon & Ledger's Cashflow Builder.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Button asChild size="lg" className="px-8 py-4 text-lg">
              <Link href="/agent">Start with Agent</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 py-4">
              <Link href="/profile/new">Create Profile Manually</Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
