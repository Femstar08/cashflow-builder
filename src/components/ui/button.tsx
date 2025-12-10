"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef, ReactElement, cloneElement as reactCloneElement } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  asChild?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#53E9C5]";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3] font-semibold shadow-sm hover:shadow-md",
  ghost: "bg-transparent text-[#5C6478] hover:bg-[#F8F9FA] hover:text-[#15213C]",
  outline:
    "border border-[#15213C] bg-white text-[#15213C] hover:bg-[#F8F9FA] font-semibold",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && children) {
      // When asChild is true, clone the child and merge className
      const child = children as ReactElement<{ className?: string }>;
      return reactCloneElement(child, {
        className: cn(classes, child.props?.className),
        ...child.props,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

