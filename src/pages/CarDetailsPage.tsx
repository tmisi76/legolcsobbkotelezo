import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { hu } from "date-fns/locale";
import { 
  ArrowLeft, 
  Car as CarIcon, 
  Pencil, 
  Trash2, 
  Calendar,
  FileText,
  Mail,
  CheckCircle2,
  Clock,
  Upload
} from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CountdownDisplay } from "@/components/dashboard/CountdownDisplay";
import { InsuranceTimeline } from "@/components/dashboard/InsuranceTimeline";
import { StatusProgressBar } from "@/components/dashboard/StatusProgressBar";
import { CarFormModal } from "@/components/dashboard/CarFormModal";
import { DeleteCarDialog } from "@/components/dashboard/DeleteCarDialog";
import { CarDocumentList } from "@/components/dashboard/CarDocumentList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useCars } from "@/hooks/useCars";
import { calculateCarStatus } from "@/lib/carStatus";
import { formatHungarianNumber, formatHungarianDate } from "@/lib/database";
import { cn } from "@/lib/utils";
import { Car, ReminderLog } from "@/types/database";
import { toast } from "sonner";

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateCar, deleteCar, isUpdating, isDeleting } = useCars();
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch car details
  const { data: car, isLoading: isLoadingCar, refetch } = useQuery({
    queryKey: ["car", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Car | null;
    },
    enabled: !!id,
  });

  // Fetch reminder logs
  const { data: reminderLogs = [], isLoading: isLoadingLogs } = useQuery({
    queryKey: ["reminder_logs", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_logs")
        .select("*")
        .eq("car_id", id)
        .order("sent_at", { ascending: false });
      
      if (error) throw error;
      return data as ReminderLog[];
    },
    enabled: !!id,
  });

  if (isLoadingCar) {
    return (
      <DashboardLayout title="Autó részletei">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!car) {
    return (
      <DashboardLayout title="Autó nem található">
        <div className="text-center py-12">
          <CarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Az autó nem található
          </h2>
          <p className="text-muted-foreground mb-6">
            A keresett autó nem létezik vagy törölve lett.
          </p>
          <Button asChild>
            <Link to="/dashboard/cars">
              <ArrowLeft className="w-4 h-4" />
              Vissza az autókhoz
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = calculateCarStatus(car.anniversary_date);

  const handleConfirmDelete = async () => {
    try {
      await deleteCar(car.id);
      toast.success("🗑️ Autó törölve");
      navigate("/dashboard/cars");
    } catch (error) {
      toast.error("Hiba történt a törlés során.");
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateCar({ carId: car.id, updates: { notes } });
      toast.success("Megjegyzés mentve!");
      setIsEditingNotes(false);
      refetch();
    } catch (error) {
      toast.error("Hiba történt a mentés során.");
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case "50_days": return "50 napos emlékeztető";
      case "30_days": return "30 napos emlékeztető";
      case "7_days": return "7 napos emlékeztető";
      default: return type;
    }
  };

  return (
    <DashboardLayout title="Autó részletei">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/cars">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{car.brand} {car.model}</h1>
              <Badge className={cn(status.statusColor, "text-white text-sm")}>
                {status.statusLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {car.year}
              {car.license_plate && ` • ${car.license_plate}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil className="w-4 h-4" />
            Szerkesztés
          </Button>
          <Button 
            variant="outline" 
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setIsDeleteOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Törlés
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Countdown */}
        <div className="lg:col-span-1">
          <CountdownDisplay status={status} size="lg" />
        </div>

        {/* Car Details Card */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <CarIcon className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Autó adatok</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Márka</span>
              <span className="font-medium text-foreground">{car.brand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Típus</span>
              <span className="font-medium text-foreground">{car.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Évjárat</span>
              <span className="font-medium text-foreground">{car.year}</span>
            </div>
            {car.engine_power_kw && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Motor</span>
                <span className="font-medium text-foreground">{car.engine_power_kw} kW</span>
              </div>
            )}
            {car.license_plate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rendszám</span>
                <span className="font-medium text-foreground">{car.license_plate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Insurance Card */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Biztosítás</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Évforduló</span>
              <span className="font-medium text-foreground">
                {formatHungarianDate(car.anniversary_date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hátralévő napok</span>
              <span className={cn("font-medium", status.textColor)}>
                {status.daysRemaining < 0 
                  ? `${Math.abs(status.daysRemaining)} napja lejárt`
                  : `${status.daysRemaining} nap`
                }
              </span>
            </div>
            {car.current_annual_fee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jelenlegi díj</span>
                <span className="font-medium text-foreground">
                  {formatHungarianNumber(car.current_annual_fee)} Ft/év
                </span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <StatusProgressBar status={status} showLabel={false} />
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        {/* Timeline - now full width */}
        <InsuranceTimeline anniversaryDate={car.anniversary_date} />
      </div>

      {/* Documents & Notes & Reminder History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Dokumentumok</h3>
          </div>
          <CarDocumentList carId={car.id} />
        </div>

        {/* Notes */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Megjegyzések</h3>
            </div>
            {!isEditingNotes && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setNotes(car.notes || "");
                  setIsEditingNotes(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
          </div>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Megjegyzések hozzáadása..."
                rows={4}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveNotes} disabled={isUpdating}>
                  Mentés
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditingNotes(false)}
                >
                  Mégse
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              {car.notes || "Nincs megjegyzés"}
            </p>
          )}
        </div>

        {/* Reminder History */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Emlékeztető előzmények</h3>
          </div>
          {isLoadingLogs ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : reminderLogs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Még nem küldtünk emlékeztetőt
            </p>
          ) : (
            <div className="space-y-3">
              {reminderLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {getReminderTypeLabel(log.reminder_type)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.sent_at), "yyyy.MM.dd HH:mm", { locale: hu })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {log.email_opened ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span className="text-xs text-secondary">Megnyitva</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Elküldve</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <CarFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        car={car}
        onCarUpdated={() => {
          setIsEditOpen(false);
          refetch();
        }}
      />

      {/* Delete Dialog */}
      <DeleteCarDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        carName={`${car.brand} ${car.model}`}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
