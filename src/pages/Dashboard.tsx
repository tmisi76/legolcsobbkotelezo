import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, Plus, Loader2 } from "lucide-react";

const DashboardPage = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Üdvözlünk, {profile?.full_name || "Felhasználó"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Itt kezelheted az autóidat és az emlékeztetőidet.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Regisztrált autó</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Közelgő lejárat</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0 Ft</p>
                <p className="text-sm text-muted-foreground">Becsült megtakarítás</p>
              </div>
            </div>
          </div>
        </div>

        {/* Cars Section */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Autóim</h2>
            <Button variant="default" size="default">
              <Plus className="w-4 h-4" />
              Autó hozzáadása
            </Button>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Car className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Még nincs autód regisztrálva
            </h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add hozzá az első autódat, és mi emlékeztetünk a kötelező biztosítás lejártára!
            </p>
            <Button variant="hero" size="lg">
              <Plus className="w-5 h-5" />
              Első autó hozzáadása
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
