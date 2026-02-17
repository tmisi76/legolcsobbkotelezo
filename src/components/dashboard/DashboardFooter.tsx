import { Link } from "react-router-dom";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-4 px-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
        <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link to="/adatvedelem" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Adatvédelem
          </Link>
          <Link to="/aszf" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ÁSZF
          </Link>
          <Link to="/impresszum" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Impresszum
          </Link>
          <Link to="/kapcsolat" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            Kapcsolat
          </Link>
        </nav>
        <span className="text-xs text-muted-foreground/60">
          © {currentYear} LegolcsóbbKötelező
        </span>
      </div>
    </footer>
  );
}
