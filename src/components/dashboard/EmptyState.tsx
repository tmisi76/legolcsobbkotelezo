import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Car, Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-6">
      <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
        <Car className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionTo && (
        <Button asChild variant="hero" size="lg">
          <Link to={actionTo}>
            <Plus className="w-5 h-5 mr-2" />
            {actionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
}
