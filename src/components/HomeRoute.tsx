import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface HomeRouteProps {
  children: ReactNode;
}

export function HomeRoute({ children }: HomeRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Betöltés...</p>
        </div>
      </div>
    );
  }

  // Ha be van jelentkezve, irányítsuk a dashboard-ra
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Ha nincs bejelentkezve, mutassuk a landing page-t
  return <>{children}</>;
}
