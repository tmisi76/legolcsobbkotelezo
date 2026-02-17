import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Car, 
  Settings, 
  LogOut, 
  Plus, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Shield,
  FileText,
  FileEdit,
  Mail,
  History
} from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const baseNavItems = [
  { path: "/dashboard", label: "Áttekintés", icon: Home },
  { path: "/dashboard/cars", label: "Autóim", icon: Car },
  { path: "/dashboard/documents", label: "Dokumentumaim", icon: FileText },
  { path: "/dashboard/settings", label: "Beállítások", icon: Settings },
];

const adminNavItems = [
  { path: "/admin/clients", label: "Potenciális szerződők", icon: Users },
  { path: "/admin/users", label: "Jogosultságok", icon: Shield },
  { path: "/admin/pages", label: "Tartalom", icon: FileEdit },
  { path: "/admin/email-templates", label: "Email sablonok", icon: Mail },
  { path: "/admin/email-logs", label: "Email napló", icon: History },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { profile, logout } = useAuth();
  const { isAdmin } = useAdminRole();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 hidden md:flex flex-col",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Car className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-sm">
                LegolcsóbbKötelező
              </span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2">
          {baseNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 mx-1 h-px bg-border" />
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                  <Shield className="w-4 h-4 text-warning" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-warning">Adminisztráció</span>
                </div>
              )}
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors",
                      isActive
                        ? "bg-orange-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {profile?.full_name || "Felhasználó"}
                </p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "mt-3 text-muted-foreground hover:text-destructive",
              sidebarCollapsed ? "w-full justify-center px-0" : "w-full justify-start"
            )}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Kijelentkezés</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-30 h-14 bg-card border-b border-border md:hidden flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-sm">LK</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-64 bg-card border-l border-border transform transition-transform duration-300 md:hidden",
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b border-border flex justify-between items-center">
          <span className="font-semibold text-foreground">Menü</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <nav className="p-4">
          {baseNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
                <Shield className="w-4 h-4 text-warning" />
                <span className="text-xs font-semibold uppercase tracking-wider text-warning">Adminisztráció</span>
              </div>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors",
                      isActive
                        ? "bg-orange-600 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {profile?.full_name || "Felhasználó"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Kijelentkezés
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300 pt-14 md:pt-0",
          sidebarCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        {/* Top Header */}
        <header className="hidden md:flex h-16 bg-card border-b border-border items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Üdv, <span className="font-medium text-foreground">{profile?.full_name || "Felhasználó"}</span>! 👋
            </span>
            <Button asChild>
              <Link to="/dashboard/cars?add=true">
                <Plus className="w-4 h-4" />
                Új autó
              </Link>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Mobile Bottom Navigation - only base items */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border md:hidden">
        <div className="flex justify-around py-2">
          {baseNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
