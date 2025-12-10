"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type CreationMode = "select" | "ai" | "manual";

export default function NewProfilePage() {
  const router = useRouter();
  const [mode, setMode] = useState<CreationMode>("select");

  if (mode === "select") {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <Link href="/hub" className="text-[#5C6478] hover:text-[#15213C]">
              ← Back to profiles
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-[#15213C]">Create New Business Profile</h1>
            <p className="mt-2 text-[#5C6478]">Choose how you'd like to create your profile</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setMode("ai")}
            >
              <Card>
                <div className="p-8 text-center">
                  <h2 className="mb-2 text-xl font-semibold text-[#15213C]">Guided Builder</h2>
                  <p className="mb-6 text-[#5C6478]">
                    I'll guide you through creating a comprehensive business profile with intelligent
                    questions and suggestions.
                  </p>
                  <Button className="w-full">Start Guided Builder</Button>
                </div>
              </Card>
            </div>

            <div
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setMode("manual")}
            >
              <Card>
                <div className="p-8 text-center">
                  <h2 className="mb-2 text-xl font-semibold text-[#15213C]">Enter Manually</h2>
                  <p className="mb-6 text-[#5C6478]">
                    Fill out the profile form yourself with full control over every detail.
                  </p>
                  <Button variant="outline" className="w-full">
                    Start Manual Entry
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (mode === "ai") {
    return <AIBuilderFlow onCancel={() => setMode("select")} />;
  }

  if (mode === "manual") {
    return <ManualBuilderFlow onCancel={() => setMode("select")} />;
  }

  return null;
}

function AIBuilderFlow({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    business_name: "",
    legal_structure: "",
    description: "",
    website_url: "",
    payment_terms: "",
    vat_registered: false,
    starting_balance: "",
    planned_events: "",
    monthly_sales_target: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call an API to generate AI suggestions
    // For now, proceed to review step
    setStep(4);
  };

  if (step === 1) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <button onClick={onCancel} className="text-[#5C6478] hover:text-[#15213C]">
              ← Back
            </button>
            <h1 className="mt-4 text-3xl font-bold text-[#15213C]">Guided Builder</h1>
            <p className="mt-2 text-[#5C6478]">Step 1: Input basics</p>
          </div>

          <Card>
            <form onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }} className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="Acme Ltd"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Legal Structure *
                </label>
                <select
                  required
                  value={formData.legal_structure}
                  onChange={(e) => setFormData({ ...formData, legal_structure: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="limited_company">Limited Company</option>
                  <option value="sole_trader">Sole Trader</option>
                  <option value="partnership">Partnership</option>
                  <option value="not_sure">Not sure</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Short Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="Describe what your business does..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Website URL (optional)
                </label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Continue
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (step === 2) {
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <button onClick={() => setStep(1)} className="text-[#5C6478] hover:text-[#15213C]">
              ← Back
            </button>
            <h1 className="mt-4 text-3xl font-bold text-[#15213C]">Quick Questions</h1>
            <p className="mt-2 text-[#5C6478]">Step 2: Answer a few quick questions</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  How do customers pay you?
                </label>
                <select
                  value={formData.payment_terms}
                  onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                >
                  <option value="">Select...</option>
                  <option value="immediate">Immediately</option>
                  <option value="invoice_30">On invoice (30 days)</option>
                  <option value="invoice_60">On invoice (60 days)</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Are you VAT registered or expecting to register soon?
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vat"
                      checked={formData.vat_registered === true}
                      onChange={() => setFormData({ ...formData, vat_registered: true })}
                    />
                    <span className="text-[#5C6478]">Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="vat"
                      checked={formData.vat_registered === false}
                      onChange={() => setFormData({ ...formData, vat_registered: false })}
                    />
                    <span className="text-[#5C6478]">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Expected starting bank balance (£)
                </label>
                <input
                  type="number"
                  value={formData.starting_balance}
                  onChange={(e) => setFormData({ ...formData, starting_balance: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Any planned events in the next 12-24 months?
                </label>
                <textarea
                  value={formData.planned_events}
                  onChange={(e) => setFormData({ ...formData, planned_events: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="e.g., Funding round, first hire, big contract, price increases..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#15213C]">
                  Typical monthly sales figure (or target) for year 1 (£)
                </label>
                <input
                  type="number"
                  value={formData.monthly_sales_target}
                  onChange={(e) => setFormData({ ...formData, monthly_sales_target: e.target.value })}
                  className="w-full rounded-lg border border-[#E1E4EA] px-4 py-2 text-[#15213C] focus:border-[#53E9C5] focus:outline-none"
                  placeholder="0"
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1">
                  I'll Generate Your Profile
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (step === 3) {
    // AI Generation step - show loading
    return (
      <AppShell>
        <div className="mx-auto max-w-2xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#15213C]">Generating Your Profile...</h1>
            <p className="mt-2 text-[#5C6478]">I'm analyzing your inputs and creating suggestions</p>
          </div>
          <Card className="p-12 text-center">
            <p className="text-[#5C6478]">This may take a moment...</p>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (step === 4) {
    // Review AI Profile step
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-[#15213C]">Review Generated Profile</h1>
            <p className="mt-2 text-[#5C6478]">Review and adjust my suggestions</p>
          </div>

          <Card>
            <div className="p-6 space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Revenue Streams</h2>
                <p className="text-sm text-[#5C6478] mb-4">I've suggested these revenue streams (you can edit or remove)</p>
                {/* In production, show AI suggestions here */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-[#E1E4EA] p-3">
                    <span className="text-[#15213C]">Subscription Revenue</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Remove</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-semibold text-[#15213C]">Expense Categories</h2>
                <p className="text-sm text-[#5C6478] mb-4">Suggested expense categories</p>
                {/* In production, show AI suggestions here */}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    // In production, save profile and redirect
                    router.push("/hub/profile-1");
                  }}
                  className="flex-1"
                >
                  Save & Continue
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return null;
}

function ManualBuilderFlow({ onCancel }: { onCancel: () => void }) {
  const router = useRouter();
  // In production, this would use the existing profile creation form
  // For now, redirect to the existing profile/new page
  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <button onClick={onCancel} className="text-[#5C6478] hover:text-[#15213C]">
            ← Back
          </button>
          <h1 className="mt-4 text-3xl font-bold text-[#15213C]">Enter Manually</h1>
          <p className="mt-2 text-[#5C6478]">Fill out the profile form manually</p>
        </div>
        <Card>
          <div className="p-6">
            <p className="mb-4 text-[#5C6478]">
              Manual entry form would go here. For now, redirecting to existing profile creation...
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={() => router.push("/profile/new")}
                className="flex-1"
              >
                Continue to Form
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

