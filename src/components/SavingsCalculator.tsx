import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const SavingsCalculator = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const [currentPremium, setCurrentPremium] = useState(85000);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [savingsPercent, setSavingsPercent] = useState(18);
  const [showConfetti, setShowConfetti] = useState(false);

  // Randomize savings percentage on first interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setSavingsPercent(Math.floor(Math.random() * 6) + 15); // 15-20%
      setHasInteracted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
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

  // Confetti particles
  const confettiParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 200 - 100,
    delay: Math.random() * 0.3,
    color: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--warning))'][i % 3],
  }));

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Card with gradient border */}
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary">
            <div className="bg-card rounded-2xl p-6 md:p-10 relative overflow-hidden">
              {/* Confetti Effect */}
              <AnimatePresence>
                {showConfetti && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {confettiParticles.map((particle) => (
                      <motion.div
                        key={particle.id}
                        initial={{ 
                          top: "60%", 
                          left: "50%", 
                          scale: 0,
                          opacity: 1 
                        }}
                        animate={{ 
                          top: "20%",
                          left: `calc(50% + ${particle.x}px)`,
                          scale: 1,
                          opacity: 0,
                          rotate: 720,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ 
                          duration: 1,
                          delay: particle.delay,
                          ease: "easeOut"
                        }}
                        className="absolute w-2 h-2 rounded-full"
                        style={{ backgroundColor: particle.color }}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Title */}
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  💰 Mennyit spórolhatsz?
                </h2>
                <p className="text-muted-foreground">
                  Add meg a jelenlegi éves díjad és számold ki!
                </p>
              </motion.div>

              {/* Input Section */}
              <div className="space-y-6">
                <label className="block text-sm font-medium text-foreground">
                  Jelenlegi éves kötelező díjam:
                </label>

                {/* Current Value Display */}
                <div className="text-center">
                  <motion.div 
                    className="inline-flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Input
                      type="text"
                      value={formatNumber(currentPremium)}
                      onChange={handleInputChange}
                      className="text-3xl md:text-4xl font-bold text-primary text-center w-48 h-auto py-2 border-none bg-transparent focus:ring-0"
                    />
                    <span className="text-2xl md:text-3xl font-bold text-primary">Ft</span>
                  </motion.div>
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
              <motion.div
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ 
                  opacity: hasInteracted ? 1 : 0.5, 
                  scale: hasInteracted ? 1 : 0.95 
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-8 p-6 rounded-xl bg-secondary/10 border border-secondary/20 relative"
              >
                {hasInteracted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-3 -right-3"
                  >
                    <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </motion.div>
                )}
                <div className="text-center">
                  <p className="text-lg text-muted-foreground mb-2">
                    Akár
                  </p>
                  <motion.p 
                    className="text-3xl md:text-4xl font-extrabold text-secondary mb-2"
                    key={animatedSavings}
                  >
                    {formatNumber(animatedSavings)} Ft-ot
                  </motion.p>
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
              </motion.div>

              {/* CTA */}
              <motion.div 
                className="mt-8 text-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Regisztrálj az ingyenes emlékeztetőért!
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SavingsCalculator;
