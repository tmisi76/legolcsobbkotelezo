import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { ArrowRight } from "lucide-react";

const SavingsCalculator = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [currentPremium, setCurrentPremium] = useState(85000);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState(18);

  // Randomize savings percentage on first interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setSavingsPercent(Math.floor(Math.random() * 6) + 15); // 15-20%
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  const yearlySavings = Math.round(currentPremium * (savingsPercent / 100));
  const fiveYearSavings = yearlySavings * 5;

  const animatedSavings = useCountUp({
    end: yearlySavings,
    duration: 800,
    enabled: hasInteracted,
  });

  const animatedFiveYear = useCountUp({
    end: fiveYearSavings,
    duration: 1000,
    enabled: hasInteracted,
  });

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleSliderChange = (value: number[]) => {
    setCurrentPremium(value[0]);
    handleInteraction();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\s/g, ""), 10);
    if (!isNaN(value)) {
      const clampedValue = Math.min(Math.max(value, 20000), 200000);
      setCurrentPremium(clampedValue);
      handleInteraction();
    }
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`max-w-2xl mx-auto transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Card with gradient border */}
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary">
            <div className="bg-card rounded-2xl p-6 md:p-10">
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  💰 Mennyit spórolhatsz?
                </h2>
                <p className="text-muted-foreground">
                  Add meg a jelenlegi éves díjad és számold ki!
                </p>
              </div>

              {/* Input Section */}
              <div className="space-y-6">
                <label className="block text-sm font-medium text-foreground">
                  Jelenlegi éves kötelező díjam:
                </label>

                {/* Current Value Display */}
                <div className="text-center">
                  <div className="inline-flex items-center gap-2">
                    <Input
                      type="text"
                      value={formatNumber(currentPremium)}
                      onChange={handleInputChange}
                      className="text-3xl md:text-4xl font-bold text-primary text-center w-48 h-auto py-2 border-none bg-transparent"
                    />
                    <span className="text-2xl md:text-3xl font-bold text-primary">Ft</span>
                  </div>
                </div>

                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[currentPremium]}
                    onValueChange={handleSliderChange}
                    min={20000}
                    max={200000}
                    step={5000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>20 000 Ft</span>
                    <span>200 000 Ft</span>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div
                className={`mt-8 p-6 rounded-xl bg-secondary/10 border border-secondary/20 transition-all duration-500 ${
                  hasInteracted ? "opacity-100 scale-100" : "opacity-50 scale-95"
                }`}
              >
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    Akár
                  </p>
                  <p className="text-3xl md:text-4xl font-extrabold text-secondary mb-2">
                    {formatNumber(animatedSavings)} Ft-ot
                  </p>
                  <p className="text-lg text-muted-foreground mb-4">
                    spórolhatsz évente!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ez 5 év alatt{" "}
                    <span className="font-semibold text-foreground">
                      {formatNumber(animatedFiveYear)} Ft
                    </span>
                    !
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-8 text-center">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Regisztrálj az ingyenes emlékeztetőért!
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
