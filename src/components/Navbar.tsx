import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Car, Shield, Menu, X, User, LogOut, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, profile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      toast({
        variant: "destructive",
        title: "Hiba történt",
        description: error.message,
      });
    } else {
      toast({
        title: "Kijelentkezve",
        description: "Sikeres kijelentkezés!",
      });
      navigate("/");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-card/80 backdrop-blur-lg shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" />
              <Car className="w-4 h-4 text-primary-light absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg md:text-xl text-foreground">
              Legolcsóbb<span className="text-primary">Kötelező</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isLoading ? (
              <div className="w-24 h-10 bg-muted animate-pulse rounded-lg" />
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-32 truncate">
                      {profile?.full_name || "Felhasználó"}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      Vezérlőpult
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Beállítások
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4" />
                    Kijelentkezés
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Bejelentkezés</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/register">Regisztráció</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="w-full h-10 bg-muted animate-pulse rounded-lg" />
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-medium truncate">
                      {profile?.full_name || "Felhasználó"}
                    </span>
                  </div>
                  <Button variant="ghost" size="lg" className="w-full justify-start" asChild>
                    <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                      <LayoutDashboard className="w-5 h-5 mr-2" />
                      Vezérlőpult
                    </Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="w-full justify-start" asChild>
                    <Link to="/dashboard/settings" onClick={() => setIsMobileMenuOpen(false)}>
                      <Settings className="w-5 h-5 mr-2" />
                      Beállítások
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Kijelentkezés
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="lg" className="w-full justify-center" asChild>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Bejelentkezés
                    </Link>
                  </Button>
                  <Button variant="default" size="lg" className="w-full justify-center" asChild>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Regisztráció
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
