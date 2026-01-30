import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  index?: number;
}

export function CarCard({ car, daysUntilAnniversary, onEdit, onDelete, index = 0 }: CarCardProps) {
  const status = calculateCarStatus(car.anniversary_date);

  const isUrgent = status.status === 'switching_period' || status.status === 'expired';

  return (
    <motion.div 
      className={cn(
        "bg-card rounded-xl border border-border p-5 will-change-transform",
        "hover:border-primary/30"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ 
        y: -4, 
        boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
        transition: { duration: 0.2 }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <motion.div
          animate={isUrgent ? { 
            scale: [1, 1.05, 1],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Badge className={cn(status.statusColor, "text-white")}>
            {status.statusLabel}
          </Badge>
        </motion.div>
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
        <motion.div 
          className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <CarIcon className="w-6 h-6 text-primary" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-lg truncate">{car.brand} {car.model}</h3>
          <p className="text-sm text-muted-foreground">
            {car.year}
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
      <motion.div 
        className={cn("rounded-lg p-3 mb-4", status.bgColor)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.08 + 0.2 }}
      >
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
      </motion.div>

      {/* Fee Info - without estimated savings */}
      {car.current_annual_fee && (
        <motion.div 
          className="text-sm mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.08 + 0.3 }}
        >
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jelenlegi díj:</span>
            <span className="font-medium text-foreground">
              {formatHungarianNumber(car.current_annual_fee)} Ft/év
            </span>
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onEdit(car)}
          >
            <Pencil className="w-4 h-4" />
            Szerkesztés
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
        </motion.div>
      </div>
    </motion.div>
  );
}
