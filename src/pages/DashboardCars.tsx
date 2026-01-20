import { useState, useMemo } from "react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CarCard } from "@/components/dashboard/CarCard";
import { CarFormModal, CarFormSubmitData } from "@/components/dashboard/CarFormModal";
import { DeleteCarDialog } from "@/components/dashboard/DeleteCarDialog";
import { useCars } from "@/hooks/useCars";
import { getDaysUntilAnniversary } from "@/lib/database";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Car } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SortOption = "expiry" | "name" | "created";
type FilterOption = "all" | "urgent" | "upcoming" | "safe";

export default function DashboardCars() {
  const { cars, isLoading, createCar, updateCar, deleteCar, isCreating, isUpdating, isDeleting } = useCars();
  const { user } = useAuth();
  
  const [sortBy, setSortBy] = useState<SortOption>("expiry");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingCar, setDeletingCar] = useState<Car | null>(null);

  // Process cars with days until anniversary
  const processedCars = useMemo(() => {
    return cars.map((car) => ({
      ...car,
      daysUntilAnniversary: getDaysUntilAnniversary(car.anniversary_date),
    }));
  }, [cars]);

  // Filter cars
  const filteredCars = useMemo(() => {
    return processedCars.filter((car) => {
      if (filterBy === "all") return true;
      if (filterBy === "urgent") return car.daysUntilAnniversary <= 30;
      if (filterBy === "upcoming") return car.daysUntilAnniversary > 30 && car.daysUntilAnniversary <= 60;
      if (filterBy === "safe") return car.daysUntilAnniversary > 60;
      return true;
    });
  }, [processedCars, filterBy]);

  // Sort cars
  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      if (sortBy === "expiry") {
        return a.daysUntilAnniversary - b.daysUntilAnniversary;
      }
      if (sortBy === "name") {
        return a.nickname.localeCompare(b.nickname);
      }
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });
  }, [filteredCars, sortBy]);

  const handleOpenAdd = () => {
    setEditingCar(null);
    setIsFormOpen(true);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setIsFormOpen(true);
  };

  const handleDelete = (car: Car) => {
    setDeletingCar(car);
    setIsDeleteOpen(true);
  };

  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('insurance-documents')
      .upload(fileName, file);
    
    if (error) {
      console.error('Error uploading document:', error);
      throw new Error('Nem sikerült feltölteni a dokumentumot');
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('insurance-documents')
      .getPublicUrl(data.path);
    
    return publicUrl;
  };

  const handleFormSubmit = async (data: CarFormSubmitData) => {
    try {
      setIsUploading(true);
      
      let documentUrl: string | null = null;
      
      // Upload document if provided
      if (data.documentFile) {
        documentUrl = await uploadDocument(data.documentFile);
      }
      
      const formattedData = {
        nickname: data.nickname,
        brand: data.brand,
        model: data.model,
        year: data.year,
        engine_power_kw: data.engine_power_kw ?? null,
        current_annual_fee: data.current_annual_fee ?? null,
        anniversary_date: format(data.anniversary_date, "yyyy-MM-dd"),
        license_plate: data.license_plate ?? null,
        notes: data.notes ?? null,
        document_url: documentUrl,
        payment_method: data.payment_method ?? null,
        has_child_under_18: data.has_child_under_18=== "yes",
        accepts_email_only: data.accepts_email_only === "yes",
        payment_frequency: data.payment_frequency ?? null,
      };

      if (editingCar) {
        await updateCar({ carId: editingCar.id, updates: formattedData });
        toast.success("✅ Módosítások mentve!");
      } else {
        await createCar(formattedData);
        toast.success("✅ Autó sikeresen hozzáadva!");
      }
      setIsFormOpen(false);
      setEditingCar(null);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error("Hiba történt. Próbáld újra!");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCar) return;
    try {
      await deleteCar(deletingCar.id);
      toast.success("🗑️ Autó törölve");
      setIsDeleteOpen(false);
      setDeletingCar(null);
    } catch (error) {
      toast.error("Hiba történt a törlés során.");
    }
  };

  return (
    <DashboardLayout title="Autóim">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Regisztrált autók</h2>
            <p className="text-sm text-muted-foreground">
              Kezeld a regisztrált autóidat és kövesd az évfordulókat
            </p>
          </div>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4" />
            Új autó hozzáadása
          </Button>
        </div>

        {/* Filter/Sort Bar */}
        {cars.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Rendezés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expiry">Lejárat szerint</SelectItem>
                <SelectItem value="name">Név szerint</SelectItem>
                <SelectItem value="created">Hozzáadás szerint</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={(v) => setFilterBy(v as FilterOption)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Szűrés" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Mind ({processedCars.length})</SelectItem>
                <SelectItem value="urgent">
                  Sürgős ({processedCars.filter(c => c.daysUntilAnniversary <= 30).length})
                </SelectItem>
                <SelectItem value="upcoming">
                  Közelgő ({processedCars.filter(c => c.daysUntilAnniversary > 30 && c.daysUntilAnniversary <= 60).length})
                </SelectItem>
                <SelectItem value="safe">
                  Rendben ({processedCars.filter(c => c.daysUntilAnniversary > 60).length})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Cars Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-5">
              <div className="flex justify-between mb-4">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="flex gap-3 mb-4">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-lg mb-4" />
              <Skeleton className="h-9 w-full rounded" />
            </div>
          ))}
        </div>
      ) : cars.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8">
          <EmptyState
            title="Még nem adtál hozzá autót"
            description="Add hozzá az első autódat és mi emlékeztetünk a biztosítás váltására!"
            actionLabel="Első autó hozzáadása"
            actionTo="#"
          />
          <div className="text-center -mt-6">
            <Button variant="hero" size="lg" onClick={handleOpenAdd}>
              <Plus className="w-5 h-5" />
              Első autó hozzáadása
            </Button>
          </div>
        </div>
      ) : sortedCars.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <p className="text-muted-foreground">Nincs találat a szűrési feltételeknek megfelelően.</p>
          <Button variant="outline" className="mt-4" onClick={() => setFilterBy("all")}>
            Összes megjelenítése
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedCars.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              daysUntilAnniversary={car.daysUntilAnniversary}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <CarFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        car={editingCar}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating || isUploading}
      />

      {/* Delete Confirmation */}
      <DeleteCarDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        carNickname={deletingCar?.nickname || ""}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
