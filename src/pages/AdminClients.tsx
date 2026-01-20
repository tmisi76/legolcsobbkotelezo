import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Car, Calendar, User, Eye } from "lucide-react";
import { toast } from "sonner";
import { format, differenceInDays, parseISO } from "date-fns";
import { hu } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CarDetailsDialog } from "@/components/admin/CarDetailsDialog";

interface CarWithUser {
  id: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  anniversary_date: string;
  license_plate: string | null;
  engine_power_kw: number | null;
  processing_status: string | null;
  current_annual_fee: number | null;
  payment_method: string | null;
  payment_frequency: string | null;
  has_child_under_18: boolean | null;
  accepts_email_only: boolean | null;
  notes: string | null;
  document_url: string | null;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    phone: string | null;
  } | null;
}

export default function AdminClients() {
  const [cars, setCars] = useState<CarWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "processed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarWithUser | null>(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      
      // Fetch cars with profile data
      const { data: carsData, error: carsError } = await supabase
        .from("cars")
        .select(`
          id,
          nickname,
          brand,
          model,
          year,
          anniversary_date,
          license_plate,
          engine_power_kw,
          processing_status,
          current_annual_fee,
          payment_method,
          payment_frequency,
          has_child_under_18,
          accepts_email_only,
          notes,
          document_url,
          created_at,
          user_id,
          profiles!cars_user_id_fkey (
            full_name,
            phone
          )
        `)
        .order("anniversary_date", { ascending: true });

      if (carsError) {
        console.error("Error fetching cars:", carsError);
        toast.error("Hiba az adatok betöltésekor");
        return;
      }

      setCars(carsData || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hiba történt az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const updateCarStatus = async (carId: string, newStatus: string) => {
    setUpdatingId(carId);
    try {
      const { error } = await supabase
        .from("cars")
        .update({ processing_status: newStatus })
        .eq("id", carId);

      if (error) {
        console.error("Error updating status:", error);
        toast.error("Hiba az állapot frissítésekor");
        return;
      }

      setCars(prev =>
        prev.map(car =>
          car.id === carId ? { ...car, processing_status: newStatus } : car
        )
      );

      toast.success(
        newStatus === "processed" 
          ? "Feldolgozva státuszra állítva" 
          : "Feldolgozásra vár státuszra állítva"
      );
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hiba történt");
    } finally {
      setUpdatingId(null);
    }
  };

  const getDaysUntilAnniversary = (anniversaryDate: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const anniversary = parseISO(anniversaryDate);
    const thisYear = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
    
    if (thisYear < today) {
      thisYear.setFullYear(thisYear.getFullYear() + 1);
    }
    
    return differenceInDays(thisYear, today);
  };

  const getUrgencyColor = (daysUntil: number): string => {
    if (daysUntil <= 7) return "text-red-600 bg-red-50";
    if (daysUntil <= 30) return "text-orange-600 bg-orange-50";
    if (daysUntil <= 50) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const filteredCars = cars.filter(car => {
    // Status filter
    if (statusFilter !== "all") {
      const status = car.processing_status || "pending";
      if (statusFilter !== status) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        car.nickname,
        car.brand,
        car.model,
        car.license_plate,
        car.profiles?.full_name,
        car.profiles?.phone,
      ].filter(Boolean).map(f => f?.toLowerCase());
      
      return searchableFields.some(field => field?.includes(query));
    }

    return true;
  });

  const pendingCount = cars.filter(c => (c.processing_status || "pending") === "pending").length;
  const processedCount = cars.filter(c => c.processing_status === "processed").length;

  return (
    <DashboardLayout title="Potenciális szerződők">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Összes autó</p>
                  <p className="text-2xl font-bold">{cars.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Feldolgozásra vár</p>
                  <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Feldolgozva</p>
                  <p className="text-2xl font-bold text-green-600">{processedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Szűrés és keresés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Keresés név, autó, rendszám alapján..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Állapot szűrése" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes állapot</SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Feldolgozásra vár
                    </span>
                  </SelectItem>
                  <SelectItem value="processed">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Feldolgozva
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Potenciális szerződők listája
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredCars.length} találat)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCars.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {cars.length === 0 
                  ? "Még nincsenek regisztrált autók a rendszerben."
                  : "Nincs találat a megadott szűrési feltételeknek megfelelően."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Tulajdonos</TableHead>
                      <TableHead>Autó</TableHead>
                      <TableHead>Rendszám</TableHead>
                      <TableHead>Évforduló</TableHead>
                      <TableHead>Hátralevő napok</TableHead>
                      <TableHead>Díj</TableHead>
                      <TableHead className="text-right">Állapot</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCars.map((car) => {
                      const daysUntil = getDaysUntilAnniversary(car.anniversary_date);
                      const urgencyColor = getUrgencyColor(daysUntil);
                      const status = car.processing_status || "pending";
                      
                      return (
                        <TableRow key={car.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedCar(car)}
                              title="Részletek megtekintése"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-primary" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {car.profiles?.full_name || "N/A"}
                              </span>
                              {car.profiles?.phone && (
                                <span className="text-xs text-muted-foreground">
                                  {car.profiles.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{car.nickname}</span>
                              <span className="text-xs text-muted-foreground">
                                {car.brand} {car.model} ({car.year})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {car.license_plate || "-"}
                          </TableCell>
                          <TableCell>
                            {format(parseISO(car.anniversary_date), "yyyy. MM. dd.", { locale: hu })}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium", urgencyColor)}>
                              {daysUntil} nap
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {car.current_annual_fee 
                              ? `${car.current_annual_fee.toLocaleString("hu-HU")} Ft`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={status}
                              onValueChange={(value) => updateCarStatus(car.id, value)}
                              disabled={updatingId === car.id}
                            >
                              <SelectTrigger 
                                className={cn(
                                  "w-[180px]",
                                  status === "pending"
                                    ? "border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
                                    : "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                                )}
                              >
                                {updatingId === car.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                    Feldolgozásra vár
                                  </span>
                                </SelectItem>
                                <SelectItem value="processed">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    Feldolgozva
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CarDetailsDialog
        car={selectedCar}
        open={!!selectedCar}
        onOpenChange={(open) => !open && setSelectedCar(null)}
      />
    </DashboardLayout>
  );
}
