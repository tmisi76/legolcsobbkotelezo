import { differenceInDays, addDays, format } from "date-fns";

export interface CarStatus {
  status: "ok" | "attention" | "switching_period" | "expired";
  daysRemaining: number;
  statusLabel: string;
  statusColor: string;
  bgColor: string;
  textColor: string;
  canSwitch: boolean;
  switchingPeriodStart: Date | null;
  switchingPeriodEnd: Date | null;
  progressPercent: number;
}

export function calculateCarStatus(anniversaryDate: string | Date): CarStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const anniversary = new Date(anniversaryDate);
  anniversary.setHours(0, 0, 0, 0);
  
  const daysRemaining = differenceInDays(anniversary, today);
  
  // Calculate switching period (60 days before anniversary to anniversary)
  const switchingPeriodStart = addDays(anniversary, -60);
  const switchingPeriodEnd = anniversary;
  
  // Progress: 60 days = 0%, 0 days = 100%
  const maxDays = 60;
  const progressPercent = Math.max(0, Math.min(100, ((maxDays - daysRemaining) / maxDays) * 100));
  
  // Hungarian insurance rules:
  // - Can switch between Nov 1 and Dec 31 for next year
  // - Must notify current insurer by Dec 1 (30 days before)
  // - 60 days before anniversary is when to start thinking
  
  if (daysRemaining < 0) {
    return {
      status: "expired",
      daysRemaining,
      statusLabel: "Lejárt",
      statusColor: "bg-destructive",
      bgColor: "bg-destructive/10",
      textColor: "text-destructive",
      canSwitch: false,
      switchingPeriodStart,
      switchingPeriodEnd,
      progressPercent: 100,
    };
  }
  
  if (daysRemaining <= 30) {
    return {
      status: "switching_period",
      daysRemaining,
      statusLabel: "Váltási időszak!",
      statusColor: "bg-warning",
      bgColor: "bg-warning/10",
      textColor: "text-warning",
      canSwitch: true,
      switchingPeriodStart,
      switchingPeriodEnd,
      progressPercent,
    };
  }
  
  if (daysRemaining <= 60) {
    return {
      status: "attention",
      daysRemaining,
      statusLabel: "Hamarosan lejár",
      statusColor: "bg-primary",
      bgColor: "bg-primary/10",
      textColor: "text-primary",
      canSwitch: true,
      switchingPeriodStart,
      switchingPeriodEnd,
      progressPercent,
    };
  }
  
  return {
    status: "ok",
    daysRemaining,
    statusLabel: "Rendben",
    statusColor: "bg-secondary",
    bgColor: "bg-secondary/10",
    textColor: "text-secondary",
    canSwitch: false,
    switchingPeriodStart,
    switchingPeriodEnd,
    progressPercent: 0,
  };
}

export function getTimelineMarkers(anniversaryDate: string | Date) {
  const anniversary = new Date(anniversaryDate);
  anniversary.setHours(0, 0, 0, 0);
  
  return {
    today: new Date(),
    sixtyDaysBefore: addDays(anniversary, -60),
    fiftyDaysBefore: addDays(anniversary, -50),
    thirtyDaysBefore: addDays(anniversary, -30),
    sevenDaysBefore: addDays(anniversary, -7),
    anniversary,
  };
}

export function formatHungarianDateShort(date: Date): string {
  return format(date, "MM.dd.");
}
