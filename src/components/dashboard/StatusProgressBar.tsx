import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CarStatus } from "@/lib/carStatus";

interface StatusProgressBarProps {
  status: CarStatus;
  showLabel?: boolean;
}

export function StatusProgressBar({ status, showLabel = true }: StatusProgressBarProps) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Idő az évfordulóig</span>
          <span className={cn("font-medium", status.textColor)}>
            {status.daysRemaining < 0 
              ? `${Math.abs(status.daysRemaining)} napja lejárt`
              : `${status.daysRemaining} nap`
            }
          </span>
        </div>
      )}
      <div className="relative">
        <Progress 
          value={status.progressPercent} 
          className="h-2"
        />
        <div 
          className={cn(
            "absolute top-0 h-2 rounded-full transition-all",
            status.status === "expired" ? "bg-destructive" :
            status.status === "switching_period" ? "bg-warning" :
            status.status === "attention" ? "bg-primary" :
            "bg-secondary"
          )}
          style={{ width: `${status.progressPercent}%` }}
        />
      </div>
    </div>
  );
}
