import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Users, Shield, ShieldCheck, UserCog, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

interface UserWithRole {
  user_id: string;
  full_name: string;
  phone: string | null;
  created_at: string;
  role: "admin" | "moderator" | "user" | null;
  role_id?: string;
}

type RoleFilter = "all" | "admin" | "moderator" | "user" | "no_role";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; roleName: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast.error("Hiba a felhasználók betöltésekor");
        return;
      }

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role");

      if (rolesError) {
        console.error("Error fetching roles:", rolesError);
        toast.error("Hiba a jogosultságok betöltésekor");
        return;
      }

      // Merge profiles with roles
      const usersWithRoles: UserWithRole[] = (profilesData || []).map((profile) => {
        const userRole = rolesData?.find((r) => r.user_id === profile.user_id);
        return {
          user_id: profile.user_id,
          full_name: profile.full_name,
          phone: profile.phone,
          created_at: profile.created_at,
          role: userRole?.role as "admin" | "moderator" | "user" | null,
          role_id: userRole?.id,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hiba történt az adatok betöltésekor");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: "admin" | "moderator" | "user" | "remove") => {
    setUpdatingId(userId);
    try {
      const user = users.find((u) => u.user_id === userId);

      if (newRole === "remove") {
        // Remove role
        if (user?.role_id) {
          const { error } = await supabase
            .from("user_roles")
            .delete()
            .eq("id", user.role_id);

          if (error) {
            console.error("Error removing role:", error);
            toast.error("Hiba a jogosultság eltávolításakor");
            return;
          }

          setUsers((prev) =>
            prev.map((u) =>
              u.user_id === userId ? { ...u, role: null, role_id: undefined } : u
            )
          );
          toast.success("Jogosultság eltávolítva");
        }
      } else if (user?.role_id) {
        // Update existing role
        const { error } = await supabase
          .from("user_roles")
          .update({ role: newRole })
          .eq("id", user.role_id);

        if (error) {
          console.error("Error updating role:", error);
          toast.error("Hiba a jogosultság frissítésekor");
          return;
        }

        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === userId ? { ...u, role: newRole } : u
          )
        );
        toast.success(`Jogosultság frissítve: ${getRoleLabel(newRole)}`);
      } else {
        // Insert new role
        const { data, error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: newRole })
          .select("id")
          .single();

        if (error) {
          console.error("Error inserting role:", error);
          toast.error("Hiba a jogosultság hozzáadásakor");
          return;
        }

        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === userId ? { ...u, role: newRole, role_id: data.id } : u
          )
        );
        toast.success(`Jogosultság hozzáadva: ${getRoleLabel(newRole)}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Hiba történt");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleLabel = (role: string | null): string => {
    const labels: Record<string, string> = {
      admin: "Admin",
      moderator: "Moderátor",
      user: "Felhasználó",
    };
    return role ? labels[role] || role : "Nincs";
  };

  const getRoleBadgeVariant = (role: string | null): "default" | "secondary" | "destructive" | "outline" => {
    if (role === "admin") return "destructive";
    if (role === "moderator") return "default";
    if (role === "user") return "secondary";
    return "outline";
  };

  const filteredUsers = users.filter((user) => {
    // Role filter
    if (roleFilter !== "all") {
      if (roleFilter === "no_role" && user.role !== null) return false;
      if (roleFilter !== "no_role" && user.role !== roleFilter) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        user.full_name?.toLowerCase().includes(query) ||
        user.phone?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const adminCount = users.filter((u) => u.role === "admin").length;
  const moderatorCount = users.filter((u) => u.role === "moderator").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const noRoleCount = users.filter((u) => u.role === null).length;

  return (
    <DashboardLayout title="Felhasználói jogosultságok">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Összes</p>
                  <p className="text-xl font-bold">{users.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <ShieldCheck className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Admin</p>
                  <p className="text-xl font-bold text-red-600">{adminCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Moderátor</p>
                  <p className="text-xl font-bold text-blue-600">{moderatorCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <UserCog className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Felhasználó</p>
                  <p className="text-xl font-bold text-green-600">{userCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nincs jogosultság</p>
                  <p className="text-xl font-bold text-gray-600">{noRoleCount}</p>
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
                  placeholder="Keresés név vagy telefonszám alapján..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Jogosultság szűrése" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Összes</SelectItem>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Admin
                    </span>
                  </SelectItem>
                  <SelectItem value="moderator">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Moderátor
                    </span>
                  </SelectItem>
                  <SelectItem value="user">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Felhasználó
                    </span>
                  </SelectItem>
                  <SelectItem value="no_role">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400" />
                      Nincs jogosultság
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
              Felhasználók listája
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredUsers.length} találat)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {users.length === 0
                  ? "Még nincsenek regisztrált felhasználók."
                  : "Nincs találat a megadott szűrési feltételeknek megfelelően."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Név</TableHead>
                      <TableHead>Telefonszám</TableHead>
                      <TableHead>Regisztráció</TableHead>
                      <TableHead>Jelenlegi jogosultság</TableHead>
                      <TableHead className="text-right">Jogosultság kezelése</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.user_id}>
                        <TableCell>
                          <span className="font-medium">{user.full_name || "N/A"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{user.phone || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {format(parseISO(user.created_at), "yyyy. MM. dd.", { locale: hu })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Select
                              value={user.role || "no_role"}
                              onValueChange={(v) => {
                                if (v === "no_role") {
                                  setDeleteConfirm({ userId: user.user_id, roleName: getRoleLabel(user.role) });
                                } else {
                                  updateUserRole(user.user_id, v as "admin" | "moderator" | "user");
                                }
                              }}
                              disabled={updatingId === user.user_id}
                            >
                              <SelectTrigger className="w-[140px]">
                                {updatingId === user.user_id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">
                                  <span className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-red-500" />
                                    Admin
                                  </span>
                                </SelectItem>
                                <SelectItem value="moderator">
                                  <span className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    Moderátor
                                  </span>
                                </SelectItem>
                                <SelectItem value="user">
                                  <span className="flex items-center gap-2">
                                    <UserCog className="w-4 h-4 text-green-500" />
                                    Felhasználó
                                  </span>
                                </SelectItem>
                                <SelectItem value="no_role">
                                  <span className="flex items-center gap-2 text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                    Eltávolítás
                                  </span>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Jogosultság eltávolítása</AlertDialogTitle>
            <AlertDialogDescription>
              Biztosan el szeretnéd távolítani a "{deleteConfirm?.roleName}" jogosultságot ettől a felhasználótól?
              A felhasználó elveszíti az ehhez tartozó hozzáféréseket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Mégse</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteConfirm) {
                  updateUserRole(deleteConfirm.userId, "remove");
                  setDeleteConfirm(null);
                }
              }}
            >
              Eltávolítás
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
