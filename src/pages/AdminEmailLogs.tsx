import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useEmailLogs } from "@/hooks/useEmailLogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Loader2, Mail, MailOpen, MousePointer, Phone, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { hu } from "date-fns/locale";

const TYPE_LABELS: Record<string, string> = {
  "60_days": "60 nap",
  "50_days": "50 nap",
  "40_days": "40 nap",
};

const TYPE_COLORS: Record<string, string> = {
  "60_days": "bg-blue-100 text-blue-800",
  "50_days": "bg-amber-100 text-amber-800",
  "40_days": "bg-red-100 text-red-800",
};

export default function AdminEmailLogs() {
  const { data: logs, isLoading } = useEmailLogs();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [openedFilter, setOpenedFilter] = useState<string>("all");

  const filteredLogs = logs?.filter(log => {
    if (typeFilter !== "all" && log.reminder_type !== typeFilter) return false;
    if (openedFilter === "opened" && !log.email_opened) return false;
    if (openedFilter === "not_opened" && log.email_opened) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.user_name?.toLowerCase().includes(q) ||
        log.user_email?.toLowerCase().includes(q) ||
        log.car_nickname?.toLowerCase().includes(q) ||
        log.license_plate?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Email napló">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Email napló">
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Keresés név, email, autó vagy rendszám alapján..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Típus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes típus</SelectItem>
              <SelectItem value="60_days">60 nap</SelectItem>
              <SelectItem value="50_days">50 nap</SelectItem>
              <SelectItem value="40_days">40 nap</SelectItem>
            </SelectContent>
          </Select>
          <Select value={openedFilter} onValueChange={setOpenedFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Megnyitás" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Összes</SelectItem>
              <SelectItem value="opened">Megnyitott</SelectItem>
              <SelectItem value="not_opened">Nem nyitotta meg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{logs?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Összes email</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {logs?.filter(l => l.email_opened).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Megnyitott</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {logs?.filter(l => l.callback_requested).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Visszahívás kérés</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              {logs?.filter(l => l.offer_requested).length || 0}
            </p>
            <p className="text-xs text-muted-foreground">Ajánlat kérés</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead>Név</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Autó</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead className="text-center">Megnyitva</TableHead>
                <TableHead className="text-center">Kattintott</TableHead>
                <TableHead className="text-center">Visszahívás</TableHead>
                <TableHead className="text-center">Ajánlat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nincs találat
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {format(new Date(log.sent_at), "yyyy.MM.dd HH:mm", { locale: hu })}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {log.user_name || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.user_email || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{log.car_nickname || "-"}</div>
                      {log.license_plate && (
                        <span className="text-xs text-muted-foreground">{log.license_plate}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={TYPE_COLORS[log.reminder_type] || ""}>
                        {TYPE_LABELS[log.reminder_type] || log.reminder_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {log.email_opened ? (
                        <MailOpen className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <Mail className="w-4 h-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {log.link_clicked ? (
                        <MousePointer className="w-4 h-4 text-blue-600 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {log.callback_requested ? (
                        <Phone className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {log.offer_requested ? (
                        <FileText className="w-4 h-4 text-blue-600 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
