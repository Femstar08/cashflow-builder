"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { SegmentControl } from "@/components/ui/segment-control";
import type { EntityType, AccountingBasis, VatBasis, BusinessProfile } from "@/types/database";

type BusinessSettings = {
  entity_type: EntityType | null;
  accounting_basis: AccountingBasis | null;
  vat_enabled: boolean;
  vat_basis: VatBasis | null;
  include_corporation_tax: boolean;
  include_paye_nic: boolean;
  include_dividends: boolean;
  debtor_days: number;
  creditor_days: number;
  director_salary: number;
  dividend_payout_ratio: number; // 0-1
};

type BusinessSettingsFormProps = {
  profile?: BusinessProfile | null;
  onSave: (settings: BusinessSettings) => Promise<void>;
  onCancel?: () => void;
};

export function BusinessSettingsForm({ profile, onSave, onCancel }: BusinessSettingsFormProps) {
  const [settings, setSettings] = useState<BusinessSettings>({
    entity_type: profile?.entity_type ?? null,
    accounting_basis: profile?.accounting_basis ?? null,
    vat_enabled: profile?.vat_enabled ?? false,
    vat_basis: profile?.vat_basis ?? null,
    include_corporation_tax: profile?.include_corporation_tax ?? false,
    include_paye_nic: profile?.include_paye_nic ?? false,
    include_dividends: profile?.include_dividends ?? false,
    debtor_days: profile?.debtor_days ?? 30,
    creditor_days: profile?.creditor_days ?? 45,
    director_salary: profile?.director_salary ?? 0,
    dividend_payout_ratio: profile?.dividend_payout_ratio ?? 0.5,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation: If entity_type = "sole_trader", disable CT and dividends
  const isSoleTrader = settings.entity_type === "sole_trader";
  const isCashBasis = settings.accounting_basis === "cash";
  const isVatEnabled = settings.vat_enabled;
  const isDividendsEnabled = settings.include_dividends && !isSoleTrader;

  // Auto-disable CT and dividends for sole trader
  useEffect(() => {
    if (isSoleTrader) {
      setSettings((prev) => ({
        ...prev,
        include_corporation_tax: false,
        include_dividends: false,
      }));
    }
  }, [isSoleTrader]);

  // Auto-set debtor/creditor days to 0 for cash basis
  useEffect(() => {
    if (isCashBasis) {
      setSettings((prev) => ({
        ...prev,
        debtor_days: 0,
        creditor_days: 0,
      }));
    }
  }, [isCashBasis]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.entity_type) {
      newErrors.entity_type = "Entity type is required";
    }

    if (!settings.accounting_basis) {
      newErrors.accounting_basis = "Accounting basis is required";
    }

    if (settings.vat_enabled && !settings.vat_basis) {
      newErrors.vat_basis = "VAT basis is required when VAT is enabled";
    }

    if (settings.debtor_days < 0 || settings.debtor_days > 365) {
      newErrors.debtor_days = "Debtor days must be between 0 and 365";
    }

    if (settings.creditor_days < 0 || settings.creditor_days > 365) {
      newErrors.creditor_days = "Creditor days must be between 0 and 365";
    }

    if (settings.dividend_payout_ratio < 0 || settings.dividend_payout_ratio > 1) {
      newErrors.dividend_payout_ratio = "Dividend payout ratio must be between 0 and 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setErrors({});
    setSuccessMessage(null);
    setIsSaving(true);
    try {
      await onSave(settings);
      setSuccessMessage("Settings saved successfully!");
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrors({ general: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof BusinessSettings>(key: K, value: BusinessSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    // Clear error for this field
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card
        title="Business Settings"
        description="Configure accounting basis, tax settings, and working capital parameters."
      >
        {/* Entity Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Entity Type *</label>
          <SegmentControl
            segments={[
              { label: "Limited Company", value: "limited_company" },
              { label: "Sole Trader", value: "sole_trader" },
            ]}
            value={settings.entity_type ?? "limited_company"}
            onChange={(value) => updateSetting("entity_type", value as EntityType)}
            ariaLabel="Entity type"
          />
          {errors.entity_type && <p className="text-xs text-red-600">{errors.entity_type}</p>}
        </div>

        {/* Accounting Basis */}
        <div className="space-y-2 mt-6">
          <label className="text-sm font-medium text-slate-700">Accounting Basis *</label>
          <SegmentControl
            segments={[
              { label: "Accrual", value: "accrual" },
              { label: "Cash", value: "cash" },
            ]}
            value={settings.accounting_basis ?? "accrual"}
            onChange={(value) => updateSetting("accounting_basis", value as AccountingBasis)}
            ariaLabel="Accounting basis"
          />
          {errors.accounting_basis && <p className="text-xs text-red-600">{errors.accounting_basis}</p>}
        </div>

        {/* VAT Settings */}
        <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">VAT Settings</h3>
          <Toggle
            checked={settings.vat_enabled}
            onChange={(checked) => updateSetting("vat_enabled", checked)}
            label="Enable VAT"
            description="Calculate VAT on sales and purchases"
          />
          {isVatEnabled && (
            <div className="ml-14 space-y-2">
              <label className="text-sm font-medium text-slate-700">VAT Basis</label>
              <SegmentControl
                segments={[
                  { label: "Accrual", value: "accrual" },
                  { label: "Cash", value: "cash" },
                ]}
                value={settings.vat_basis ?? "accrual"}
                onChange={(value) => updateSetting("vat_basis", value as VatBasis)}
                ariaLabel="VAT basis"
              />
              {errors.vat_basis && <p className="text-xs text-red-600">{errors.vat_basis}</p>}
            </div>
          )}
        </div>

        {/* Tax Settings */}
        <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
          <h3 className="text-base font-semibold text-slate-900">Tax Settings</h3>
          <Toggle
            checked={settings.include_corporation_tax}
            onChange={(checked) => updateSetting("include_corporation_tax", checked)}
            disabled={isSoleTrader}
            label="Corporation Tax"
            description={isSoleTrader ? "Not applicable for Sole Trader" : "Calculate Corporation Tax on taxable profit"}
          />
          <Toggle
            checked={settings.include_paye_nic}
            onChange={(checked) => updateSetting("include_paye_nic", checked)}
            label="PAYE/NIC"
            description="Calculate monthly PAYE and employer NIC"
          />
          <Toggle
            checked={settings.include_dividends}
            onChange={(checked) => updateSetting("include_dividends", checked)}
            disabled={isSoleTrader}
            label="Dividends"
            description={isSoleTrader ? "Not applicable for Sole Trader" : "Calculate dividends from post-tax profit"}
          />
        </div>

        {/* Working Capital (only if Accrual) */}
        {!isCashBasis && (
          <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Working Capital</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Debtor Days</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings.debtor_days}
                  onChange={(e) => updateSetting("debtor_days", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5] focus:border-transparent"
                />
                {errors.debtor_days && <p className="text-xs text-red-600">{errors.debtor_days}</p>}
                <p className="text-xs text-slate-500">Average days to receive payment from customers</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Creditor Days</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings.creditor_days}
                  onChange={(e) => updateSetting("creditor_days", parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5] focus:border-transparent"
                />
                {errors.creditor_days && <p className="text-xs text-red-600">{errors.creditor_days}</p>}
                <p className="text-xs text-slate-500">Average days to pay suppliers</p>
              </div>
            </div>
          </div>
        )}

        {/* Dividend Settings (only if Dividends enabled and Limited Company) */}
        {isDividendsEnabled && (
          <div className="space-y-4 mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-base font-semibold text-slate-900">Dividend Settings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Director Salary (£)</label>
                <input
                  type="number"
                  min="0"
                  value={settings.director_salary}
                  onChange={(e) => updateSetting("director_salary", parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#53E9C5] focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dividend Payout Ratio</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.dividend_payout_ratio}
                    onChange={(e) => updateSetting("dividend_payout_ratio", parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-slate-700 w-16 text-right">
                    {Math.round(settings.dividend_payout_ratio * 100)}%
                  </span>
                </div>
                {errors.dividend_payout_ratio && <p className="text-xs text-red-600">{errors.dividend_payout_ratio}</p>}
                <p className="text-xs text-slate-500">Percentage of post-tax profit paid as dividends</p>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
            {successMessage}
          </div>
        )}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {errors.general}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

