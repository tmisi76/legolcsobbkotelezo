import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { useAppStats } from "@/hooks/useAppStats";
import { Users, Car } from "lucide-react";
import { StatCardSkeleton } from "@/components/ui/skeleton-card";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  delay: number;
  isInView: boolean;
}

const StatItem = ({ value, suffix = "", label, icon: Icon, delay, isInView }: StatItemProps) => {
  const count = useCountUp({
    end: value,
    duration: 2000,
    enabled: isInView,
  });

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.5, 
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <motion.div 
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : {}}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: delay / 1000 + 0.1
        }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="w-7 h-7 text-primary" />
      </motion.div>
      <motion.div 
        className="text-4xl md:text-5xl font-extrabold text-primary mb-2"
        style={{ textShadow: "0 2px 10px rgba(30, 64, 175, 0.15)" }}
      >
        {formatNumber(count)}{suffix}
      </motion.div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
};

const SocialProof = () => {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const { stats, loading } = useAppStats();

  // Use stats from database or fallback defaults (csak felhasználók és autók)
  const statsData = [
    { 
      value: stats?.total_users ?? 2847, 
      suffix: "+", 
      label: "Regisztrált felhasználó", 
      icon: Users 
    },
    { 
      value: stats?.total_cars ?? 4123, 
      suffix: "+", 
      label: "Figyelt autó", 
      icon: Car 
    },
  ];

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto">
            {[1, 2].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.3 }}
        >
          {statsData.map((stat, index) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              delay={index * 150}
              isInView={isInView}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default SocialProof;
