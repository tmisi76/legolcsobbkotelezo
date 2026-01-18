import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useCars } from "@/hooks/useCars";
import { CarPreviewCard } from "@/components/dashboard/CarPreviewCard";
import { getDaysUntilAnniversary } from "@/lib/database";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardCars() {
  const { cars, isLoading } = useCars();

  return (
    <DashboardLayout title="Autóim">
      <div className="bg-card rounded-xl border border-border">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">Regisztrált autók</h2>
            <p className="text-sm text-muted-foreground">
              {cars.length} autó regisztrálva
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4" />
            Új autó
          </Button>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border border-border rounded-xl">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : cars.length === 0 ? (
            <EmptyState
              title="Még nincs autód regisztrálva"
              description="Add hozzá az első autódat, és mi emlékeztetünk a kötelező biztosítás lejártára!"
              actionLabel="Első autó hozzáadása"
              actionTo="/dashboard/cars"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cars.map((car) => (
                <CarPreviewCard
                  key={car.id}
                  id={car.id}
                  nickname={car.nickname}
                  brand={car.brand}
                  model={car.model}
                  daysUntilAnniversary={getDaysUntilAnniversary(car.anniversary_date)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
