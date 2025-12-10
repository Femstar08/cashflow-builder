"use client";

import { cn } from "@/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
};

export function Toggle({ checked, onChange, disabled, label, description, className }: ToggleProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#53E9C5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-[#53E9C5]" : "bg-[#5C6478]/30",
          disabled && "cursor-not-allowed"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label className="text-sm font-medium text-[#15213C] cursor-pointer" onClick={() => !disabled && onChange(!checked)}>
              {label}
            </label>
          )}
          {description && <p className="text-xs text-[#5C6478] mt-0.5">{description}</p>}
        </div>
      )}
    </div>
  );
}

