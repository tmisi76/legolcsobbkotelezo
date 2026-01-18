import { motion } from "framer-motion";
import { ArrowRight, Check, Lock, Mail, Car, Calendar, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  },
};

const floatingIconVariants = {
  animate: (custom: number) => ({
    y: [0, -20, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
      delay: custom,
    },
  }),
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6] 
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5] 
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-blob rounded-full blur-3xl opacity-50" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-32 left-[15%]"
          variants={floatingIconVariants}
          animate="animate"
          custom={0}
        >
          <motion.div 
            className="bg-card shadow-card rounded-2xl p-3"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <Car className="w-6 h-6 text-primary" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute top-48 right-[20%]"
          variants={floatingIconVariants}
          animate="animate"
          custom={1.5}
        >
          <motion.div 
            className="bg-card shadow-card rounded-2xl p-3"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          >
            <Calendar className="w-6 h-6 text-secondary" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-48 left-[25%]"
          variants={floatingIconVariants}
          animate="animate"
          custom={2}
        >
          <motion.div 
            className="bg-card shadow-card rounded-2xl p-3"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
          >
            <Bell className="w-6 h-6 text-warning" />
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-32 right-[15%]"
          variants={floatingIconVariants}
          animate="animate"
          custom={3}
        >
          <motion.div 
            className="bg-card shadow-card rounded-2xl p-3"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
          >
            <Shield className="w-6 h-6 text-primary-light" />
          </motion.div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 bg-card shadow-soft rounded-full px-4 py-2 mb-6 md:mb-8"
            variants={itemVariants}
          >
            <span className="text-lg">🚗</span>
            <span className="text-sm font-medium text-muted-foreground">
              Több mint <span className="text-primary font-semibold">2,500</span> autós már használja
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4 md:mb-6"
            variants={itemVariants}
          >
            Soha többé ne fizess{" "}
            <span className="text-primary">többet</span>{" "}
            a kötelezőért, mint amennyit muszáj!
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed"
            variants={itemVariants}
          >
            Regisztrálj ingyen, add meg mikor jár le a biztosításod, és mi{" "}
            <span className="font-semibold text-foreground">50 nappal előtte</span>{" "}
            emlékeztetünk a váltásra.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Ingyenes regisztráció
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                Megnézem hogyan működik
              </Button>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
            variants={itemVariants}
          >
            {[
              { icon: Check, text: "100% ingyenes", color: "bg-secondary/10", iconColor: "text-secondary" },
              { icon: Lock, text: "Biztonságos", color: "bg-primary/10", iconColor: "text-primary" },
              { icon: Mail, text: "Nem spammelünk", color: "bg-primary-light/10", iconColor: "text-primary-light" },
            ].map((item, index) => (
              <motion.div 
                key={item.text}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className={`flex items-center justify-center w-6 h-6 rounded-full ${item.color}`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
