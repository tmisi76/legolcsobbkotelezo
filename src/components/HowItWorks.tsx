import { motion } from "framer-motion";
import { FileText, Bell, Wallet } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    icon: FileText,
    emoji: "📝",
    title: "Regisztrálj",
    description:
      "Add meg az email címed és a köteleződ lejárati dátumát. Akár több autót is hozzáadhatsz egy fiókhoz.",
  },
  {
    icon: Bell,
    emoji: "⏰",
    title: "Emlékeztetünk",
    description:
      "50 nappal a lejárat előtt emailben értesítünk. Így biztosan nem csúszol le a váltási időszakról.",
  },
  {
    icon: Wallet,
    emoji: "💰",
    title: "Spórolsz",
    description:
      "Ha szeretnéd, megkeresünk telefonon is a legjobb személyre szabott ajánlattal.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: [0.16, 1, 0.3, 1] 
    }
  },
};

const iconBounceVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15,
      delay: 0.2
    }
  },
};

const HowItWorks = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hogyan működik?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3 egyszerű lépésben akár több tízezer forintot is spórolhatsz
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto relative"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {/* Connecting Line (Desktop) */}
          <motion.div 
            className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="relative"
              variants={cardVariants}
            >
              <motion.div 
                className="bg-card rounded-2xl p-6 md:p-8 shadow-card h-full"
                whileHover={{ 
                  y: -4, 
                  boxShadow: "0 12px 24px -8px rgba(0, 0, 0, 0.15)",
                  borderColor: "hsl(var(--primary) / 0.3)"
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Step Number */}
                <motion.div 
                  className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-button"
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : { scale: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 15,
                    delay: 0.3 + index * 0.15 
                  }}
                >
                  {index + 1}
                </motion.div>

                {/* Icon */}
                <motion.div 
                  className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto"
                  variants={iconBounceVariants}
                >
                  <motion.span 
                    className="text-3xl"
                    whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    {step.emoji}
                  </motion.span>
                </motion.div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>

              {/* Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="md:hidden flex justify-center my-4"
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={isInView ? { opacity: 1, scaleY: 1 } : {}}
                  transition={{ delay: 0.5 + index * 0.15 }}
                >
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/20" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
