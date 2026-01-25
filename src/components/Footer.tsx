import { Car, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Shield className="w-7 h-7 text-primary-foreground/80 transition-transform duration-200 group-hover:scale-110" />
              <Car className="w-3.5 h-3.5 text-primary-light absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg text-primary-foreground/90">
              Legolcsóbb<span className="text-primary-light">Kötelező</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            <Link
              to="/adatvedelem"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 text-sm"
            >
              Adatvédelem
            </Link>
            <Link
              to="/aszf"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 text-sm"
            >
              ÁSZF
            </Link>
            <Link
              to="/impresszum"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 text-sm"
            >
              Impresszum
            </Link>
            <Link
              to="/jogi-nyilatkozat"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 text-sm"
            >
              Jogi nyilatkozat
            </Link>
            <Link
              to="/kapcsolat"
              className="text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-200 text-sm"
            >
              Kapcsolat
            </Link>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-primary-foreground/10 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <p className="text-primary-foreground/50 text-sm">
              © {currentYear} LegolcsóbbKötelező.hu - Minden jog fenntartva
            </p>
            <p className="text-primary-foreground/40 text-xs">
              Független biztosítási alkusz - emlékeztetünk, hogy spórolhass!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
