import { Link } from "react-router-dom";
import { Car as CarIcon, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CarPreviewCardProps {
  id: string;
  brand: string;
  model: string;
  year: number;
  daysUntilAnniversary: number;
}

function getStatusInfo(days: number) {
  if (days <= 7) {
    return {
      label: "Sürgős!",
      variant: "destructive" as const,
      color: "text-destructive",
    };
  }
  if (days <= 30) {
    return {
      label: "Hamarosan",
      variant: "default" as const,
      color: "text-warning",
    };
  }
  if (days <= 50) {
    return {
      label: "Közelgő",
      variant: "secondary" as const,
      color: "text-primary",
    };
  }
  return {
    label: "Rendben",
    variant: "outline" as const,
    color: "text-secondary",
  };
}

export function CarPreviewCard({
  id,
  brand,
  model,
  year,
  daysUntilAnniversary,
}: CarPreviewCardProps) {
  const status = getStatusInfo(daysUntilAnniversary);

  return (
    <Link
      to={`/dashboard/cars/${id}`}
      className="block bg-card rounded-xl p-4 border border-border hover:border-primary/50 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <CarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{brand} {model}</h4>
            <p className="text-sm text-muted-foreground">
              {year}
            </p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Calendar className={cn("w-4 h-4", status.color)} />
        <span className={status.color}>
          {daysUntilAnniversary} nap múlva lejár
        </span>
      </div>
    </Link>
  );
}
