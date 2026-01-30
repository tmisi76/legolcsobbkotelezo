import { useMemo } from "react";
import { format, differenceInDays, addDays } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getTimelineMarkers } from "@/lib/carStatus";
import { Check, AlertTriangle, Clock } from "lucide-react";

interface InsuranceTimelineProps {
  anniversaryDate: string;
}

interface TimelineEvent {
  date: Date;
  label: string;
  description: string;
  icon: React.ReactNode;
  isPast: boolean;
  isCurrent: boolean;
  color: string;
}

export function InsuranceTimeline({ anniversaryDate }: InsuranceTimelineProps) {
  const markers = useMemo(() => getTimelineMarkers(anniversaryDate), [anniversaryDate]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const events: TimelineEvent[] = useMemo(() => {
    const daysToAnniversary = differenceInDays(markers.anniversary, today);
    
    return [
      {
        date: markers.sixtyDaysBefore,
        label: "60 nap",
        description: "Váltási időszak kezdete - emlékeztető email",
        icon: <Clock className="w-4 h-4" />,
        isPast: today >= markers.sixtyDaysBefore,
        isCurrent: daysToAnniversary <= 60 && daysToAnniversary > 50,
        color: "text-primary",
      },
      {
        date: markers.fiftyDaysBefore,
        label: "50 nap",
        description: "1. emlékeztető - váltásig még 20 nap",
        icon: <AlertTriangle className="w-4 h-4" />,
        isPast: today >= markers.fiftyDaysBefore,
        isCurrent: daysToAnniversary <= 50 && daysToAnniversary > 40,
        color: "text-primary",
      },
      {
        date: addDays(markers.anniversary, -40),
        label: "40 nap",
        description: "2. emlékeztető - sürgős, váltásig még 10 nap",
        icon: <AlertTriangle className="w-4 h-4" />,
        isPast: today >= addDays(markers.anniversary, -40),
        isCurrent: daysToAnniversary <= 40 && daysToAnniversary > 30,
        color: "text-warning",
      },
      {
        date: markers.thirtyDaysBefore,
        label: "30 nap",
        description: "Váltási időszak vége",
        icon: <AlertTriangle className="w-4 h-4" />,
        isPast: today >= markers.thirtyDaysBefore,
        isCurrent: daysToAnniversary <= 30 && daysToAnniversary > 0,
        color: "text-destructive",
      },
    ];
  }, [markers, today]);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-foreground mb-4">Időszaki áttekintés</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Events */}
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="relative flex items-start gap-4 pl-10">
              {/* Dot */}
              <div className={cn(
                "absolute left-2 w-5 h-5 rounded-full border-2 flex items-center justify-center -translate-x-1/2",
                event.isCurrent
                  ? "bg-primary border-primary"
                  : event.isPast
                    ? "bg-muted border-muted-foreground/30"
                    : "bg-card border-border"
              )}>
                {event.isPast && !event.isCurrent && (
                  <Check className="w-3 h-3 text-muted-foreground" />
                )}
                {event.isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                )}
              </div>
              
              {/* Content */}
              <div className={cn(
                "flex-1 pb-4",
                event.isCurrent && "font-medium"
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-sm font-medium",
                    event.isCurrent ? event.color : event.isPast ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {event.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(event.date, "yyyy.MM.dd", { locale: hu })}
                  </span>
                </div>
                <p className={cn(
                  "text-sm",
                  event.isCurrent ? event.color : "text-muted-foreground"
                )}>
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
