import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Car as CarIcon } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  carsCount: number;
  nextExpiryDays?: number;
  nextExpiryCar?: string;
}

export function WelcomeBanner({
  userName,
  carsCount,
  nextExpiryDays,
  nextExpiryCar,
}: WelcomeBannerProps) {
  const getSubtext = () => {
    if (carsCount === 0) {
      return "Add hozzá az első autódat és soha ne maradj le a váltásról!";
    }
    if (nextExpiryDays !== undefined && nextExpiryCar) {
      if (nextExpiryDays <= 7) {
        return `⚠️ Figyelem! ${nextExpiryCar} biztosítása ${nextExpiryDays} nap múlva lejár!`;
      }
      if (nextExpiryDays <= 30) {
        return `🔔 ${nextExpiryCar} biztosítása ${nextExpiryDays} nap múlva lejár.`;
      }
      return `✅ Minden rendben! Következő lejárat: ${nextExpiryDays} nap múlva.`;
    }
    return "Tartsd karban autóid biztosítását egy helyen!";
  };

  return (
    <div className="gradient-primary rounded-2xl p-6 md:p-8 text-primary-foreground mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Üdvözlünk, {userName}! 👋
          </h2>
          <p className="text-primary-foreground/80">{getSubtext()}</p>
        </div>
        {carsCount === 0 && (
          <Button
            asChild
            variant="secondary"
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
          >
            <Link to="/dashboard/cars">
              <Plus className="w-5 h-5 mr-2" />
              Első autó hozzáadása
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
