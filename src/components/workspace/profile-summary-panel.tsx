"use client";

import { Card } from "@/components/ui/card";
import type { BusinessProfile } from "@/types/database";

type ProfileSummaryPanelProps = {
  profile: BusinessProfile;
};

export function ProfileSummaryPanel({ profile }: ProfileSummaryPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold text-[#15213C] mb-4">Business Details</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-[#5C6478]">Industry:</span>
            <span className="ml-2 text-[#15213C]">{profile.industry || "Not set"}</span>
          </div>
          {profile.description && (
            <div>
              <span className="text-[#5C6478]">Description:</span>
              <p className="mt-1 text-[#15213C]">{profile.description}</p>
            </div>
          )}
          {profile.headquarters && (
            <div>
              <span className="text-[#5C6478]">Location:</span>
              <span className="ml-2 text-[#15213C]">{profile.headquarters}</span>
            </div>
          )}
          {profile.revenue_model && (
            <div>
              <span className="text-[#5C6478]">Revenue Model:</span>
              <span className="ml-2 text-[#15213C]">{profile.revenue_model}</span>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-[#15213C] mb-4">Tax & Accounting</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-[#5C6478]">Entity Type:</span>
            <span className="ml-2 text-[#15213C] capitalize">
              {profile.entity_type?.replace("_", " ") || "Not set"}
            </span>
          </div>
          <div>
            <span className="text-[#5C6478]">Accounting Basis:</span>
            <span className="ml-2 text-[#15213C] capitalize">
              {profile.accounting_basis || "Not set"}
            </span>
          </div>
          <div>
            <span className="text-[#5C6478]">VAT Registered:</span>
            <span className="ml-2 text-[#15213C]">
              {profile.vat_enabled ? "Yes" : "No"}
            </span>
          </div>
          {profile.vat_enabled && (
            <div>
              <span className="text-[#5C6478]">VAT Basis:</span>
              <span className="ml-2 text-[#15213C] capitalize">
                {profile.vat_basis || "Not set"}
              </span>
            </div>
          )}
          {profile.entity_type === "limited_company" && (
            <>
              <div>
                <span className="text-[#5C6478]">Corporation Tax:</span>
                <span className="ml-2 text-[#15213C]">
                  {profile.include_corporation_tax ? "Included" : "Not included"}
                </span>
              </div>
              <div>
                <span className="text-[#5C6478]">PAYE/NIC:</span>
                <span className="ml-2 text-[#15213C]">
                  {profile.include_paye_nic ? "Included" : "Not included"}
                </span>
              </div>
              <div>
                <span className="text-[#5C6478]">Dividends:</span>
                <span className="ml-2 text-[#15213C]">
                  {profile.include_dividends ? "Included" : "Not included"}
                </span>
              </div>
            </>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold text-[#15213C] mb-4">Working Capital</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-[#5C6478]">Debtor Days:</span>
            <span className="ml-2 text-[#15213C]">
              {profile.debtor_days !== null ? `${profile.debtor_days} days` : "Not set"}
            </span>
          </div>
          <div>
            <span className="text-[#5C6478]">Creditor Days:</span>
            <span className="ml-2 text-[#15213C]">
              {profile.creditor_days !== null ? `${profile.creditor_days} days` : "Not set"}
            </span>
          </div>
        </div>
      </Card>

      {profile.entity_type === "limited_company" && (
        <Card className="p-4">
          <h3 className="font-semibold text-[#15213C] mb-4">Director Settings</h3>
          <div className="space-y-3 text-sm">
            {profile.director_salary !== null && (
              <div>
                <span className="text-[#5C6478]">Director Salary:</span>
                <span className="ml-2 text-[#15213C]">
                  £{profile.director_salary.toLocaleString()}
                </span>
              </div>
            )}
            {profile.dividend_payout_ratio !== null && (
              <div>
                <span className="text-[#5C6478]">Dividend Payout Ratio:</span>
                <span className="ml-2 text-[#15213C]">
                  {(profile.dividend_payout_ratio * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

