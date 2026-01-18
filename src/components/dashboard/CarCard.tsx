import { useState } from "react";
import { Link } from "react-router-dom";
import { Car as CarIcon, MoreVertical, Pencil, Trash2, Calendar, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatHungarianNumber, formatHungarianDate } from "@/lib/database";
import { calculateCarStatus } from "@/lib/carStatus";
import { StatusProgressBar } from "./StatusProgressBar";
import { Car } from "@/types/database";

interface CarCardProps {
  car: Car;
  daysUntilAnniversary: number;
  onEdit: (car: Car) => void;
  onDelete: (car: Car) => void;
}

export function CarCard({ car, daysUntilAnniversary, onEdit, onDelete }: CarCardProps) {
  const status = calculateCarStatus(car.anniversary_date);
  const estimatedSavings = car.current_annual_fee 
    ? Math.round(car.current_annual_fee * 0.18) 
    : null;

  return (
    <div className="bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Badge className={cn(status.statusColor, "text-white")}>
          {status.statusLabel}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(car)}>
              <Pencil className="w-4 h-4 mr-2" />
              Szerkesztés
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(car)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Törlés
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Car Info */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <CarIcon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">{car.nickname}</h3>
          <p className="text-sm text-muted-foreground">
            {car.brand} {car.model}, {car.year}
          </p>
          {car.license_plate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {car.license_plate}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <StatusProgressBar status={status} />
      </div>

      {/* Anniversary Box */}
      <div className={cn("rounded-lg p-3 mb-4", status.bgColor)}>
        <div className="flex items-center gap-2 text-sm mb-1">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Évforduló:</span>
          <span className="font-medium text-foreground">
            {formatHungarianDate(car.anniversary_date)}
          </span>
        </div>
        <p className={cn("text-sm font-semibold", status.textColor)}>
          {status.daysRemaining < 0 
            ? `${Math.abs(status.daysRemaining)} napja lejárt`
            : `${status.daysRemaining} nap van hátra`
          }
        </p>
      </div>

      {/* Fee Info */}
      {car.current_annual_fee && (
        <div className="space-y-1 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jelenlegi díj:</span>
            <span className="font-medium text-foreground">
              {formatHungarianNumber(car.current_annual_fee)} Ft/év
            </span>
          </div>
          {estimatedSavings && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Becsült megtakarítás:</span>
              <span className="font-medium text-secondary">
                ~{formatHungarianNumber(estimatedSavings)} Ft
              </span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => onEdit(car)}
        >
          <Pencil className="w-4 h-4" />
          Szerkesztés
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          asChild
        >
          <Link to={`/dashboard/cars/${car.id}`}>
            Részletek
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
