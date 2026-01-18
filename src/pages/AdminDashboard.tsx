import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, Car, Bell, Calendar, CheckCircle, AlertTriangle, 
  RefreshCw, Send, ArrowLeft, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatHungarianDate, formatHungarianNumber } from "@/lib/database";
import { calculateCarStatus } from "@/lib/carStatus";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton-card";

interface DashboardStats {
  totalUsers: number;
  totalCars: number;
  carsNeedingReminders: number;
  remindersSentToday: number;
}

interface CarWithDetails {
  id: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  anniversary_date: string;
  user_id: string;
  userEmail?: string;
  wantsCallback?: boolean;
}

interface ReminderLog {
  id: string;
  car_id: string;
  reminder_type: string;
  sent_at: string;
  carNickname?: string;
  userEmail?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingCars, setUpcomingCars] = useState<CarWithDetails[]>([]);
  const [todayReminders, setTodayReminders] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTest, setSendingTest] = useState<string | null>(null);
  const [runningCheck, setRunningCheck] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // Get stats
      const { data: appStats } = await supabase
        .from('app_stats')
        .select('*')
        .eq('id', 1)
        .single();

      // Get cars needing reminders in next 60 days
      const today = new Date();
      const sixtyDaysLater = new Date();
      sixtyDaysLater.setDate(today.getDate() + 60);

      const { data: cars } = await supabase
        .from('cars')
        .select('*')
        .gte('anniversary_date', today.toISOString().split('T')[0])
        .lte('anniversary_date', sixtyDaysLater.toISOString().split('T')[0])
        .order('anniversary_date', { ascending: true })
        .limit(20);

      // Get today's reminders
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { data: reminders } = await supabase
        .from('reminder_logs')
        .select('*')
        .gte('sent_at', todayStart.toISOString())
        .order('sent_at', { ascending: false })
        .limit(20);

      // Count cars needing reminders (anniversary in 50, 30, or 7 days)
      const reminderDates = [50, 30, 7].map(days => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      });

      const { count: carsNeedingReminders } = await supabase
        .from('cars')
        .select('id', { count: 'exact', head: true })
        .in('anniversary_date', reminderDates);

      setStats({
        totalUsers: appStats?.total_users || 0,
        totalCars: appStats?.total_cars || 0,
        carsNeedingReminders: carsNeedingReminders || 0,
        remindersSentToday: reminders?.length || 0,
      });

      setUpcomingCars(cars || []);
      setTodayReminders(reminders || []);
    } catch (error) {
      console.error('[Admin] Data load failed');
      toast({
        title: "Hiba",
        description: "Nem sikerült betölteni az adatokat. Kérjük, próbálja újra.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendTestEmail(carId: string) {
    setSendingTest(carId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('No user email found');
      }

      const response = await supabase.functions.invoke('send-reminder-email', {
        body: { 
          carId, 
          reminderType: '50_days',
          testEmail: user.email 
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "✅ Teszt email elküldve!",
        description: `Az email a(z) ${user.email} címre lett küldve.`,
      });
    } catch (error: any) {
      console.error('[Admin] Test email failed');
      toast({
        title: "Hiba",
        description: "Nem sikerült elküldeni a teszt emailt. Kérjük, próbálja újra.",
        variant: "destructive",
      });
    } finally {
      setSendingTest(null);
    }
  }

  async function runReminderCheck() {
    setRunningCheck(true);
    try {
      const response = await supabase.functions.invoke('check-reminders');

      if (response.error) {
        throw response.error;
      }

      const results = response.data?.results;
      const totalSent = results?.reduce((acc: number, r: any) => acc + (r.carsSent || 0), 0) || 0;
      
      toast({
        title: "✅ Emlékeztető ellenőrzés lefutott!",
        description: `${totalSent} emlékeztető elküldve.`,
      });
      
      loadData();
    } catch (error: any) {
      console.error('[Admin] Reminder check failed');
      toast({
        title: "Hiba",
        description: "Nem sikerült lefuttatni az ellenőrzést. Kérjük, próbálja újra.",
        variant: "destructive",
      });
    } finally {
      setRunningCheck(false);
    }
  }

  function getDaysUntil(date: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Emlékeztető rendszer kezelése</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to="/admin/email-preview">
                  Email előnézet
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button 
                onClick={runReminderCheck} 
                disabled={runningCheck}
                variant="default"
              >
                {runningCheck ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
                Emlékeztetők futtatása
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Összes felhasználó
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-3xl font-bold">{stats?.totalUsers}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Összes autó
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary/10">
                        <Car className="w-5 h-5 text-secondary" />
                      </div>
                      <span className="text-3xl font-bold">{stats?.totalCars}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Ma küldendő
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      </div>
                      <span className="text-3xl font-bold">{stats?.carsNeedingReminders}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Mai emlékeztetők
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-3xl font-bold">{stats?.remindersSentToday}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Expirations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Következő lejáratok (60 napon belül)
              </CardTitle>
              <CardDescription>
                Autók amelyek biztosítása hamarosan lejár
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Autó</TableHead>
                    <TableHead>Évforduló</TableHead>
                    <TableHead>Napok</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      <TableRowSkeleton columns={4} />
                      <TableRowSkeleton columns={4} />
                      <TableRowSkeleton columns={4} />
                    </>
                  ) : upcomingCars.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        Nincs közelgő lejárat
                      </TableCell>
                    </TableRow>
                  ) : (
                    upcomingCars.map((car) => {
                      const days = getDaysUntil(car.anniversary_date);
                      const status = calculateCarStatus(car.anniversary_date);
                      
                      return (
                        <TableRow key={car.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{car.nickname}</p>
                              <p className="text-sm text-muted-foreground">
                                {car.brand} {car.model}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatHungarianDate(car.anniversary_date)}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.statusColor}>
                              {days} nap
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => sendTestEmail(car.id)}
                              disabled={sendingTest === car.id}
                            >
                              {sendingTest === car.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Today's Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Mai emlékeztetők
              </CardTitle>
              <CardDescription>
                Ma elküldött emlékeztető emailek
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Időpont</TableHead>
                    <TableHead>Típus</TableHead>
                    <TableHead>Státusz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <>
                      <TableRowSkeleton columns={3} />
                      <TableRowSkeleton columns={3} />
                    </>
                  ) : todayReminders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        Ma még nem küldtünk emlékeztetőt
                      </TableCell>
                    </TableRow>
                  ) : (
                    todayReminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell>
                          {new Date(reminder.sent_at).toLocaleTimeString('hu-HU')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {reminder.reminder_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Elküldve
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
