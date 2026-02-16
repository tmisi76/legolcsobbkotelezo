import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function EmailActionConfirmation() {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
      <div className="text-center max-w-md bg-card rounded-xl border p-8 shadow-sm">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Köszönjük!
        </h1>
        <p className="text-muted-foreground mb-6">
          Kérésedet rögzítettük. Kollégánk hamarosan felveszi Veled a kapcsolatot!
        </p>
        <Button asChild>
          <Link to="/">Vissza a főoldalra</Link>
        </Button>
      </div>
    </div>
  );
}
