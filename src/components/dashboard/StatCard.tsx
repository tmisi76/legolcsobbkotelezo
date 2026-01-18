import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  linkText?: string;
  linkTo?: string;
  variant?: "default" | "success" | "warning" | "danger";
  isLoading?: boolean;
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-secondary/10 text-secondary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
};

export function StatCard({
  icon,
  label,
  value,
  subtext,
  linkText,
  linkTo,
  variant = "default",
  isLoading = false,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variantStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-4 w-24" />
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {subtext && (
              <p className={cn("text-xs mt-1", variantStyles[variant].split(" ")[1])}>
                {subtext}
              </p>
            )}
          </>
        )}
      </div>
      {linkText && linkTo && !isLoading && (
        <Link
          to={linkTo}
          className="inline-flex items-center text-sm text-primary hover:underline mt-3"
        >
          {linkText} →
        </Link>
      )}
    </div>
  );
}
