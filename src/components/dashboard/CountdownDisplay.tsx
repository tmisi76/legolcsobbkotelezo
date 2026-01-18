import { cn } from "@/lib/utils";
import { CarStatus } from "@/lib/carStatus";

interface CountdownDisplayProps {
  status: CarStatus;
  size?: "sm" | "md" | "lg";
  showPulse?: boolean;
}

export function CountdownDisplay({ status, size = "md", showPulse = true }: CountdownDisplayProps) {
  const isUrgent = status.daysRemaining <= 7 && status.daysRemaining >= 0;
  const isExpired = status.daysRemaining < 0;
  
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-6 rounded-2xl",
      status.bgColor
    )}>
      <div className={cn(
        "font-bold tabular-nums",
        sizeClasses[size],
        status.textColor,
        isUrgent && showPulse && "animate-pulse"
      )}>
        {isExpired ? Math.abs(status.daysRemaining) : status.daysRemaining}
      </div>
      <p className={cn("text-sm font-medium mt-1", status.textColor)}>
        {isExpired 
          ? "napja lejárt" 
          : status.daysRemaining === 1 
            ? "nap van hátra" 
            : "nap van hátra"
        }
      </p>
      {status.canSwitch && !isExpired && (
        <p className="text-xs text-muted-foreground mt-2">
          a biztosítás váltásig
        </p>
      )}
    </div>
  );
}
