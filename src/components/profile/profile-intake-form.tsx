"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { draftProfileFromUrl, saveProfileDraft } from "@/app/profile/new/actions";

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
const SUPABASE_CONFIGURED =
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export function ProfileIntakeForm() {
  const [step, setStep] = useState<1 | 2>(1);
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

  const runDraft = () => {
    setMessage(null);

    // Validate that at least one input is provided
    if (!formState.url.trim() && !formState.textInput.trim()) {
      setMessage("Please provide either a URL or text input");
      return;
    }

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
        setStep(2);
      } catch (error) {
        setMessage((error as Error).message);
      }
    });
  };

  const handleDraft = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runDraft();
  };

  const handleRegenerate = () => {
    runDraft();
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          simulate: !SUPABASE_CONFIGURED,
        });

        setMessage(simulated ? "Draft saved locally (Supabase env not set)." : `Profile ${data.name} saved.`);
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

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form className="space-y-8" onSubmit={step === 1 ? handleDraft : handleSave}>
      <Card
        title="Step 1 · Provide business information"
        description="Enter a URL, text description, or both. We will enrich it via AI and produce editable attributes."
        actions={
          <Button type="submit" disabled={isPending}>
            {step === 1 ? "Generate profile" : "Save profile"}
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm">
            Business URL (optional)
            <input
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
              type="url"
              value={formState.url}
              onChange={(event) => updateField("url", event.target.value)}
              placeholder="https://example.com"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Optional hint
            <input
              className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
              type="text"
              value={formState.industry}
              onChange={(event) => updateField("industry", event.target.value)}
              placeholder="e.g. B2B SaaS"
            />
          </label>
        </div>
        <label className="mt-4 flex flex-col gap-2 text-sm">
          Business information (optional)
          <textarea
            className="min-h-[120px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
            value={formState.textInput}
            onChange={(event) => updateField("textInput", event.target.value)}
            placeholder="Paste or type business information, company description, website content, or any relevant details..."
          />
        </label>
        {message && (
          <p className="mt-4 text-sm text-amber-600">
            {message}
          </p>
        )}
      </Card>

      {step === 2 && (
        <>
          <Card
            title="Step 2 · Review AI draft"
            description="Modify any field before persisting to Supabase."
            actions={
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" disabled={isPending} onClick={handleRegenerate}>
                  Regenerate
                </Button>
                <Button type="submit" disabled={isPending}>
                  Save profile
                </Button>
              </div>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <LabeledInput label="Name" value={formState.name} onChange={(value) => updateField("name", value)} required />
              <LabeledInput label="Industry" value={formState.industry} onChange={(value) => updateField("industry", value)} required />
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <LabeledInput label="Headquarters" value={formState.headquarters} onChange={(value) => updateField("headquarters", value)} />
              <LabeledInput label="Revenue model" value={formState.revenue_model} onChange={(value) => updateField("revenue_model", value)} />
            </div>
            <label className="mt-4 flex flex-col gap-2 text-sm">
              Description
              <textarea
                className="min-h-[120px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
                value={formState.description}
                onChange={(event) => updateField("description", event.target.value)}
              />
            </label>
            <label className="mt-4 flex flex-col gap-2 text-sm">
              Collaboration notes (visible to your team)
              <textarea
                className="min-h-[120px] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
                placeholder="Add context for your accountant or client..."
                value={formState.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </label>
          </Card>

          <Card title="AI-suggested attributes" description="These will be stored in raw_profile_json for future overrides.">
            <ul className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
              {recommendations.map((item) => (
                <li key={item} className="rounded-lg border border-dashed border-neutral-200 px-3 py-2 dark:border-neutral-800">
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </form>
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
      {label}
      <input
        className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-black focus:ring-2 focus:ring-black/10 dark:border-neutral-800 dark:bg-neutral-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}

