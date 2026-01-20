import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Car,
  Calendar,
  Settings,
  FileText,
  MessageSquare,
  ExternalLink,
  Phone,
  Loader2,
} from "lucide-react";
import { formatHungarianDate, formatHungarianNumber, getDaysUntilAnniversary } from "@/lib/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CarWithUser {
  id: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string | null;
  engine_power_kw: number | null;
  anniversary_date: string;
  current_annual_fee: number | null;
  payment_method: string | null;
  payment_frequency: string | null;
  has_child_under_18: boolean | null;
  accepts_email_only: boolean | null;
  notes: string | null;
  document_url: string | null;
  processing_status: string | null;
  created_at: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
}

interface CarDetailsDialogProps {
  car: CarWithUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Függőben</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-500 hover:bg-blue-600">Folyamatban</Badge>;
    case "quoted":
      return <Badge className="bg-purple-500 hover:bg-purple-600">Ajánlat küldve</Badge>;
    case "completed":
      return <Badge className="bg-green-500 hover:bg-green-600">Lezárva</Badge>;
    default:
      return <Badge variant="outline">Ismeretlen</Badge>;
  }
};

const getPaymentMethodLabel = (method: string | null) => {
  switch (method) {
    case "transfer":
      return "Átutalás";
    case "card":
      return "Bankkártya";
    case "csekk":
      return "Csekk";
    default:
      return method || "Nincs megadva";
  }
};

const getPaymentFrequencyLabel = (frequency: string | null) => {
  switch (frequency) {
    case "annual":
      return "Éves";
    case "semi_annual":
      return "Féléves";
    case "quarterly":
      return "Negyedéves";
    default:
      return frequency || "Nincs megadva";
  }
};

// Extract file path from document_url (handles both full URLs and paths)
const getFilePath = (documentUrl: string): string => {
  // If it's already just a path (e.g., "user_id/filename.pdf")
  if (!documentUrl.startsWith('http')) {
    return documentUrl;
  }
  // Extract path from full URL
  const match = documentUrl.match(/insurance-documents\/(.+)$/);
  return match ? match[1] : documentUrl;
};

export function CarDetailsDialog({ car, open, onOpenChange }: CarDetailsDialogProps) {
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  
  if (!car) return null;

  const daysUntil = getDaysUntilAnniversary(car.anniversary_date);
  const estimatedSavings = car.current_annual_fee
    ? Math.round(car.current_annual_fee * 0.18)
    : null;

  const openDocument = async () => {
    if (!car.document_url) return;
    
    setIsLoadingDocument(true);
    try {
      const filePath = getFilePath(car.document_url);
      
      // Generate signed URL (valid for 1 hour)
      const { data, error } = await supabase.storage
        .from('insurance-documents')
        .createSignedUrl(filePath, 3600);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        toast.error("Nem sikerült megnyitni a dokumentumot");
        return;
      }
      
      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening document:', error);
      toast.error("Hiba történt a dokumentum megnyitásakor");
    } finally {
      setIsLoadingDocument(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {car.profiles?.full_name || "Ismeretlen"} – {car.nickname}
            </span>
            {getStatusBadge(car.processing_status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tulajdonos adatai */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Tulajdonos adatai
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              <div>
                <span className="text-muted-foreground text-sm">Név</span>
                <p className="font-medium">{car.profiles?.full_name || "Nincs megadva"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Telefon</span>
                <p className="font-medium flex items-center gap-1">
                  {car.profiles?.phone ? (
                    <>
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${car.profiles.phone}`} className="hover:underline">
                        {car.profiles.phone}
                      </a>
                    </>
                  ) : (
                    "Nincs megadva"
                  )}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Autó adatai */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Car className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Autó adatai
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-6">
              <div>
                <span className="text-muted-foreground text-sm">Márka</span>
                <p className="font-medium">{car.brand}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Típus</span>
                <p className="font-medium">{car.model}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Évjárat</span>
                <p className="font-medium">{car.year}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Rendszám</span>
                <p className="font-medium">{car.license_plate || "Nincs megadva"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Motor</span>
                <p className="font-medium">
                  {car.engine_power_kw ? `${car.engine_power_kw} kW` : "Nincs megadva"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Becenév</span>
                <p className="font-medium">{car.nickname}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Biztosítás */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Biztosítás
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-6">
              <div>
                <span className="text-muted-foreground text-sm">Évforduló</span>
                <p className="font-medium">{formatHungarianDate(car.anniversary_date)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Hátralevő</span>
                <p className={`font-medium ${daysUntil <= 30 ? "text-destructive" : daysUntil <= 60 ? "text-yellow-600" : "text-green-600"}`}>
                  {daysUntil} nap
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Jelenlegi díj</span>
                <p className="font-medium">
                  {car.current_annual_fee
                    ? `${formatHungarianNumber(car.current_annual_fee)} Ft/év`
                    : "Nincs megadva"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Becsült megtakarítás</span>
                <p className="font-medium text-green-600">
                  {estimatedSavings ? `~${formatHungarianNumber(estimatedSavings)} Ft` : "–"}
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Preferenciák */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Preferenciák
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-6">
              <div>
                <span className="text-muted-foreground text-sm">Fizetési mód</span>
                <p className="font-medium">{getPaymentMethodLabel(car.payment_method)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Gyakoriság</span>
                <p className="font-medium">{getPaymentFrequencyLabel(car.payment_frequency)}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">18 év alatti gyermek</span>
                <p className="font-medium">{car.has_child_under_18 ? "Igen" : "Nem"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Email értesítés</span>
                <p className="font-medium">{car.accepts_email_only ? "Elfogadja" : "Nem kér"}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Dokumentum */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Dokumentum
              </h3>
            </div>
            <div className="pl-6">
              {car.document_url ? (
                <Button 
                  variant="outline" 
                  onClick={openDocument} 
                  className="gap-2"
                  disabled={isLoadingDocument}
                >
                  {isLoadingDocument ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4" />
                  )}
                  Dokumentum megtekintése
                </Button>
              ) : (
                <p className="text-muted-foreground">Nincs feltöltve</p>
              )}
            </div>
          </section>

          {/* Megjegyzések */}
          {car.notes && (
            <>
              <Separator />
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    Megjegyzések
                  </h3>
                </div>
                <div className="pl-6">
                  <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                    {car.notes}
                  </p>
                </div>
              </section>
            </>
          )}

          {/* Regisztráció dátuma */}
          <div className="text-xs text-muted-foreground text-right pt-2">
            Regisztrálva: {formatHungarianDate(car.created_at.split("T")[0])}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
