import { useAuth } from "@/contexts/AuthContext";
import { useCars } from "@/hooks/useCars";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StatCard } from "@/components/dashboard/StatCard";
import { CarPreviewCard } from "@/components/dashboard/CarPreviewCard";
import { QuickTips } from "@/components/dashboard/QuickTips";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getDaysUntilAnniversary } from "@/lib/database";
import { Car, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

function getExpiryVariant(days: number | undefined): "default" | "success" | "warning" | "danger" {
  if (days === undefined) return "default";
  if (days <= 7) return "danger";
  if (days <= 30) return "warning";
  return "success";
}

export default function DashboardHome() {
  const { profile } = useAuth();
  const { cars, isLoading, getNextExpiry } = useCars();

  const nextExpiry = getNextExpiry();
  const recentCars = cars.slice(0, 3);

  return (
    <DashboardLayout title="Áttekintés">
      {/* Welcome Banner */}
      <WelcomeBanner
        userName={profile?.full_name || "Felhasználó"}
        carsCount={cars.length}
        nextExpiryDays={nextExpiry?.days}
        nextExpiryCar={nextExpiry?.car.nickname}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard
          icon={<Car className="w-6 h-6" />}
          label="Regisztrált autó"
          value={isLoading ? "-" : cars.length}
          linkText="Részletek"
          linkTo="/dashboard/cars"
          isLoading={isLoading}
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Következő lejárat"
          value={
            isLoading
              ? "-"
              : nextExpiry
              ? `${nextExpiry.days} nap`
              : "Nincs"
          }
          subtext={nextExpiry?.car.nickname}
          variant={getExpiryVariant(nextExpiry?.days)}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cars */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl p-5 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Autóim</h3>
              {cars.length > 0 && (
                <Link
                  to="/dashboard/cars"
                  className="text-sm text-primary hover:underline"
                >
                  Összes autó →
                </Link>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border border-border rounded-xl">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cars.length === 0 ? (
              <EmptyState
                title="Még nincs autód"
                description="Add hozzá az első autódat, és mi emlékeztetünk a kötelező biztosítás lejártára!"
                actionLabel="Autó hozzáadása"
                actionTo="/dashboard/cars"
              />
            ) : (
              <div className="space-y-3">
                {recentCars.map((car) => (
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

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickTips />
        </div>
      </div>
    </DashboardLayout>
  );
}
