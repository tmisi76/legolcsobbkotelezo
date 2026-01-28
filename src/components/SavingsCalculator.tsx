import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SavingsCalculator = () => {
  const { ref, isInView } = useInView({ threshold: 0.2 });
  const navigate = useNavigate();

  const benefits = [
    "Bonus-malus besorolás figyelembevétele",
    "Díjkedvezmények összehasonlítása",
    "Egyedi igények felmérése",
  ];

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
            <div className="bg-card rounded-2xl p-8 md:p-12 text-center">
              {/* Title */}
              <motion.h2
                className="text-2xl md:text-3xl font-bold text-foreground mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 }}
              >
                💰 Mennyit spórolhatsz?
              </motion.h2>

              {/* Main message */}
              <motion.div
                className="space-y-4 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
              >
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  Évente akár több tízezer forintot is!
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto">
                  Ez nagyban függ attól, hogy kihasználtunk-e minden rendelkezésünkre álló kedvezményt.
                </p>
              </motion.div>

              {/* Benefits list */}
              <motion.ul
                className="space-y-3 mb-8 text-left max-w-sm mx-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 }}
              >
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </motion.ul>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full sm:w-auto"
                  onClick={() => navigate("/register")}
                >
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
