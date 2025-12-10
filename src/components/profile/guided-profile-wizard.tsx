"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { draftProfileFromUrl, saveProfileDraft } from "@/app/profile/new/actions";
import { useRouter } from "next/navigation";

type DraftProfile = Awaited<ReturnType<typeof draftProfileFromUrl>>["suggestedProfile"];

type FormState = {
  ownerId: string;
  url: string;
  textInput: string;
  name: string;
  industry: string;
  description: string;
  headquarters: string;
  revenue_model: string;
  notes: string;
};

const OWNER_PLACEHOLDER = "demo-owner";
const INSTANTDB_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_INSTANT_APP_ID) && Boolean(process.env.INSTANT_ADMIN_TOKEN);

type Step = 1 | 2 | 3 | 4;

export function GuidedProfileWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formState, setFormState] = useState<FormState>({
    ownerId: OWNER_PLACEHOLDER,
    url: "",
    textInput: "",
    name: "",
    industry: "",
    description: "",
    headquarters: "",
    revenue_model: "Subscription",
    notes: "",
  });
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savedProfileId, setSavedProfileId] = useState<string | null>(null);

  const steps = [
    { number: 1, title: "Welcome", description: "Let's get started!" },
    { number: 2, title: "Business Info", description: "Tell us about your business" },
    { number: 3, title: "AI Review", description: "Review AI suggestions" },
    { number: 4, title: "Complete", description: "You're all set!" },
  ];

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Generate AI profile
      if (!formState.url.trim() && !formState.textInput.trim()) {
        setMessage("Please provide either a URL or business description");
        return;
      }
      setMessage(null);
      startTransition(async () => {
        try {
          const payload = await draftProfileFromUrl({
            url: formState.url.trim() || undefined,
            textInput: formState.textInput.trim() || undefined,
            industry: formState.industry,
            name: formState.name,
            description: formState.description,
          });
          mergeDraft(payload.suggestedProfile);
          setRecommendations(payload.recommendedFields);
          setCurrentStep(3);
        } catch (error) {
          setMessage((error as Error).message);
        }
      });
    }
  };

  const handleSave = async () => {
    setMessage(null);
    startTransition(async () => {
      try {
        const { data, simulated } = await saveProfileDraft({
          owner_id: formState.ownerId,
          name: formState.name,
          url: formState.url,
          industry: formState.industry,
          description: formState.description,
          headquarters: formState.headquarters,
          revenue_model: formState.revenue_model,
          notes: formState.notes,
          raw_profile_json: { recommendations },
          simulate: !INSTANTDB_CONFIGURED,
        });

        setSavedProfileId(data.id);
        setCurrentStep(4);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push(`/dashboard/${data.id}`);
        }, 2000);
      } catch (error) {
        setMessage((error as Error).message);
      }
    });
  };

  const mergeDraft = (draft: DraftProfile) => {
    setFormState((prev) => ({
      ...prev,
      name: draft.name,
      industry: draft.industry ?? prev.industry,
      description: draft.description ?? prev.description,
      headquarters: draft.headquarters ?? prev.headquarters,
      revenue_model: draft.revenue_model ?? prev.revenue_model,
      notes: prev.notes,
    }));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold transition-all ${
                  currentStep >= step.number
                    ? "border-[#53E9C5] bg-[#53E9C5] text-[#15213C]"
                    : "border-[#5C6478] bg-white text-[#5C6478]"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <p className="mt-2 text-xs font-semibold text-[#5C6478]">{step.title}</p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-1 flex-1 rounded ${
                  currentStep > step.number ? "bg-[#53E9C5]" : "bg-[#5C6478]/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card
        title={steps[currentStep - 1].title}
        description={steps[currentStep - 1].description}
        className="border-2 border-[#53E9C5]/20"
      >
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#15213C] to-[#1a2a4a] p-8 text-white">
              <h2 className="text-2xl font-bold">Welcome to Cashflow Builder! 🎉</h2>
              <p className="mt-3 text-lg text-white/90">
                We'll help you create a comprehensive cashflow forecast in just a few simple steps.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-semibold">Guided Profile Creation</p>
                    <p className="text-sm text-white/80">I'll analyze your business and suggest the best setup</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-semibold">Smart Cashflow Modeling</p>
                    <p className="text-sm text-white/80">Add revenue and expenses with my suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <p className="font-semibold">Goal Tracking & Insights</p>
                    <p className="text-sm text-white/80">Set SMART goals and get insights</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] px-8 py-3 text-lg font-semibold"
              >
                Let's Get Started →
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#53E9C5]/10 p-4 border border-[#53E9C5]/20">
              <p className="text-sm font-semibold text-[#15213C] mb-2">Quick Tip</p>
              <p className="text-sm text-[#5C6478]">
                You can provide a website URL, paste business information, or fill in the fields manually. I'll help complete the rest!
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-semibold text-[#15213C]">Business URL (optional)</span>
                <input
                  className="rounded-lg border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
                  type="url"
                  value={formState.url}
                  onChange={(event) => updateField("url", event.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm">
                <span className="font-semibold text-[#15213C]">Industry Hint (optional)</span>
                <input
                  className="rounded-lg border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
                  type="text"
                  value={formState.industry}
                  onChange={(event) => updateField("industry", event.target.value)}
                  placeholder="e.g. B2B SaaS, E-commerce, Consulting"
                />
              </label>
            </div>
            
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-[#15213C]">Business Description</span>
              <textarea
                className="min-h-[150px] rounded-xl border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
                value={formState.textInput}
                onChange={(event) => updateField("textInput", event.target.value)}
                placeholder="Tell us about your business... What do you do? Who are your customers? What's your business model?"
              />
            </label>

            {message && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {message}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="border-[#5C6478]/30 text-[#5C6478]"
              >
                ← Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={isPending}
                className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] px-8"
              >
                {isPending ? "Generating..." : "Generate Profile →"}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="rounded-xl bg-[#53E9C5]/10 p-4 border border-[#53E9C5]/20">
              <p className="text-sm font-semibold text-[#15213C] mb-2">Generated Profile</p>
              <p className="text-sm text-[#5C6478]">
                We've analyzed your business information and generated a profile. Review and edit any fields below.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Business Name *"
                value={formState.name}
                onChange={(value) => updateField("name", value)}
                required
              />
              <LabeledInput
                label="Industry *"
                value={formState.industry}
                onChange={(value) => updateField("industry", value)}
                required
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput
                label="Headquarters"
                value={formState.headquarters}
                onChange={(value) => updateField("headquarters", value)}
              />
              <LabeledInput
                label="Revenue Model"
                value={formState.revenue_model}
                onChange={(value) => updateField("revenue_model", value)}
              />
            </div>
            
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-[#15213C]">Description</span>
              <textarea
                className="min-h-[120px] rounded-xl border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>
            
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-semibold text-[#15213C]">Collaboration Notes</span>
              <textarea
                className="min-h-[100px] rounded-xl border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
                placeholder="Add notes for your team or accountant..."
                value={formState.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>

            {recommendations.length > 0 && (
              <div className="rounded-xl border-2 border-[#53E9C5]/20 bg-[#53E9C5]/5 p-4">
                <p className="text-sm font-semibold text-[#15213C] mb-3">AI Suggestions</p>
                <ul className="space-y-2">
                  {recommendations.map((item, index) => (
                    <li key={index} className="rounded-lg border border-[#53E9C5]/30 bg-white px-3 py-2 text-sm text-[#5C6478]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                {message}
              </div>
            )}

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="border-[#5C6478]/30 text-[#5C6478]"
              >
                ← Back
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleNext}
                  disabled={isPending}
                  className="border-[#5C6478]/30 text-[#5C6478]"
                >
                  Regenerate
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isPending}
                  className="bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] px-8"
                >
                  {isPending ? "Saving..." : "Save & Continue →"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 text-center py-8">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#53E9C5] text-4xl">
              ✓
            </div>
            <h2 className="text-2xl font-bold text-[#15213C]">Profile Created Successfully! 🎉</h2>
            <p className="text-[#5C6478]">
              Redirecting you to your dashboard where you can start building your cashflow forecast...
            </p>
            <div className="flex justify-center">
              <div className="h-2 w-64 rounded-full bg-[#5C6478]/20 overflow-hidden">
                <div className="h-full w-full bg-[#53E9C5] animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

function LabeledInput({ label, value, onChange, required }: LabeledInputProps) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-semibold text-[#15213C]">{label}</span>
      <input
        className="rounded-lg border-2 border-[#5C6478]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[#53E9C5] focus:ring-2 focus:ring-[#53E9C5]/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

