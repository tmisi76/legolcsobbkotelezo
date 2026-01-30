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
import { Loader2, Search, Car, Calendar, User, Eye, Mail, Clock, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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
    email?: string | null;
  } | null;
  user_email?: string;
}

type StatusFilter = "all" | "pending" | "in_progress" | "offer_sent" | "closed";
type DaysFilter = "all" | "60" | "50" | "40" | "30" | "outside";

export default function AdminClients() {
  const [cars, setCars] = useState<CarWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [daysFilter, setDaysFilter] = useState<DaysFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarWithUser | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCars();
  }, [sortDirection]);

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
            phone,
            email
          )
        `)
        .order("anniversary_date", { ascending: sortDirection === 'asc' });

      if (carsError) {
        console.error("Error fetching cars:", carsError);
        toast.error("Hiba az adatok betöltésekor");
        return;
      }

      // Profile email is now available directly from the profiles table
      const carsWithEmail = (carsData || []).map(car => ({
        ...car,
        user_email: car.profiles?.email || undefined,
      }));

      setCars(carsWithEmail);
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

      const statusLabels: Record<string, string> = {
        pending: "Feldolgozásra vár",
        in_progress: "Folyamatban",
        offer_sent: "Ajánlat küldve",
        closed: "Lezárva",
      };
      toast.success(`${statusLabels[newStatus] || newStatus} státuszra állítva`);
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

    // Days filter (switching period filter)
    if (daysFilter !== "all") {
      const daysUntil = getDaysUntilAnniversary(car.anniversary_date);
      if (daysFilter === "60" && !(daysUntil <= 60 && daysUntil > 50)) return false;
      if (daysFilter === "50" && !(daysUntil <= 50 && daysUntil > 40)) return false;
      if (daysFilter === "40" && !(daysUntil <= 40 && daysUntil > 30)) return false;
      if (daysFilter === "30" && !(daysUntil <= 30 && daysUntil >= 0)) return false;
      if (daysFilter === "outside" && daysUntil <= 60 && daysUntil >= 0) return false;
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
        car.user_email,
      ].filter(Boolean).map(f => f?.toLowerCase());
      
      return searchableFields.some(field => field?.includes(query));
    }

    return true;
  });

  const pendingCount = cars.filter(c => (c.processing_status || "pending") === "pending").length;
  const inProgressCount = cars.filter(c => c.processing_status === "in_progress").length;
  const offerSentCount = cars.filter(c => c.processing_status === "offer_sent").length;
  const closedCount = cars.filter(c => c.processing_status === "closed").length;

  return (
    <DashboardLayout title="Potenciális szerződők">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Összes</p>
                  <p className="text-xl font-bold">{cars.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <Clock className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Feldolgozásra vár</p>
                  <p className="text-xl font-bold text-red-600">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Folyamatban</p>
                  <p className="text-xl font-bold text-blue-600">{inProgressCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ajánlat küldve</p>
                  <p className="text-xl font-bold text-purple-600">{offerSentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lezárva</p>
                  <p className="text-xl font-bold text-green-600">{closedCount}</p>
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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Keresés név, email, autó, rendszám alapján..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
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
                    <SelectItem value="in_progress">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Folyamatban
                      </span>
                    </SelectItem>
                    <SelectItem value="offer_sent">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Ajánlat küldve
                      </span>
                    </SelectItem>
                    <SelectItem value="closed">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Lezárva
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground self-center mr-2">Évfordulóig:</span>
                {[
                  { value: "all", label: "Mind" },
                  { value: "60", label: "60 nap" },
                  { value: "50", label: "50 nap" },
                  { value: "40", label: "40 nap" },
                  { value: "30", label: "≤30 nap" },
                  { value: "outside", label: "Időszakon kívül" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={daysFilter === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDaysFilter(option.value as DaysFilter)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
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
                      <TableHead 
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                      >
                        <div className="flex items-center gap-1">
                          Évforduló
                          {sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Hátralevő</TableHead>
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
                              {car.user_email && (
                                <span className="text-xs text-muted-foreground">
                                  {car.user_email}
                                </span>
                              )}
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
                            {format(parseISO(car.anniversary_date), "MM. dd.", { locale: hu })}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium", urgencyColor)}>
                              {daysUntil} nap
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={status}
                              onValueChange={(value) => updateCarStatus(car.id, value)}
                              disabled={updatingId === car.id}
                            >
                              <SelectTrigger 
                                className={cn(
                                  "w-[160px]",
                                  status === "pending" && "border-red-300 bg-red-50 text-red-700",
                                  status === "in_progress" && "border-blue-300 bg-blue-50 text-blue-700",
                                  status === "offer_sent" && "border-purple-300 bg-purple-50 text-purple-700",
                                  status === "closed" && "border-green-300 bg-green-50 text-green-700"
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
                                <SelectItem value="in_progress">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    Folyamatban
                                  </span>
                                </SelectItem>
                                <SelectItem value="offer_sent">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    Ajánlat küldve
                                  </span>
                                </SelectItem>
                                <SelectItem value="closed">
                                  <span className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    Lezárva
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
        onNotesUpdate={(carId, notes) => {
          setCars(prev => prev.map(c => c.id === carId ? { ...c, notes } : c));
          if (selectedCar?.id === carId) {
            setSelectedCar({ ...selectedCar, notes });
          }
        }}
      />
    </DashboardLayout>
  );
}
