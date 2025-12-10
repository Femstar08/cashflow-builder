"use client";

import { cn } from "@/lib/utils";

type Segment<TValue extends string> = {
  label: string;
  value: TValue;
};

type SegmentControlProps<TValue extends string> = {
  segments: Segment<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel?: string;
};

export function SegmentControl<TValue extends string>({
  segments,
  value,
  onChange,
  ariaLabel,
}: SegmentControlProps<TValue>) {
  return (
    <div
      className="inline-flex items-center gap-1 bg-white p-1"
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {segments.map((segment) => (
        <button
          key={segment.value}
          type="button"
          role="radio"
          aria-checked={value === segment.value}
          className={cn(
            "relative px-4 py-2 text-sm font-medium transition-colors duration-200",
            value === segment.value
              ? "text-[#15213C]"
              : "text-[#5C6478] hover:text-[#15213C]",
          )}
          onClick={() => onChange(segment.value)}
        >
          {segment.label}
          {value === segment.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#53E9C5] rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}

