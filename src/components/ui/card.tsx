import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

type CardProps = PropsWithChildren<{
  title?: string | React.ReactNode;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}>;

export function Card({ title, description, children, className, actions }: CardProps) {
  return (
    <section className={cn("rounded-xl border border-[#E1E4EA] bg-white p-6 shadow-sm card-hover", className)}>
      {(title || description || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-[#15213C]">
                {typeof title === "string" ? title : title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-[#5C6478]">{description}</p>
            )}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

