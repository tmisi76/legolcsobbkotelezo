import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Bell, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardSettings() {
  const { profile, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    wants_callback: profile?.wants_callback || false,
    email_reminders_enabled: profile?.email_reminders_enabled ?? true,
    reminder_days: profile?.reminder_days || "50,30,7",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success("Beállítások mentve!");
    } catch (error) {
      toast.error("Hiba történt a mentés során.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout title="Beállítások">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Section */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Profil adatok</h3>
                <p className="text-sm text-muted-foreground">
                  Alapvető fiókbeállítások
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Teljes név</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Kovács János"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefonszám (opcionális)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="+36 30 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Értesítések</h3>
                <p className="text-sm text-muted-foreground">
                  Email emlékeztetők beállítása
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Email emlékeztetők</p>
                  <p className="text-sm text-muted-foreground">
                    Értesítünk a lejárati dátumokról
                  </p>
                </div>
                <Switch
                  checked={formData.email_reminders_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      email_reminders_enabled: checked,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="reminder_days">
                  Emlékeztető napok (vesszővel elválasztva)
                </Label>
                <Input
                  id="reminder_days"
                  value={formData.reminder_days}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reminder_days: e.target.value,
                    }))
                  }
                  placeholder="50,30,7"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pl.: 50,30,7 = emlékeztető 50, 30 és 7 nappal a lejárat előtt
                </p>
              </div>
            </div>
          </div>

          {/* Callback Section */}
          <div className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Visszahívás</h3>
                <p className="text-sm text-muted-foreground">
                  Személyes tanácsadás telefonon
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  Szeretnék visszahívást kapni
                </p>
                <p className="text-sm text-muted-foreground">
                  Szakértőnk felhív a legjobb ajánlatokkal
                </p>
              </div>
              <Switch
                checked={formData.wants_callback}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, wants_callback: checked }))
                }
              />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isLoading}>
            {isLoading ? "Mentés..." : "Változtatások mentése"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
