import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { useAppStats } from "@/hooks/useAppStats";
import { Users, Car, PiggyBank } from "lucide-react";

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
    <div
      className={`text-center transition-all duration-700 ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <div className="text-4xl md:text-5xl font-extrabold text-primary mb-2" style={{ textShadow: "0 2px 10px rgba(30, 64, 175, 0.15)" }}>
        {formatNumber(count)}{suffix}
      </div>
      <p className="text-muted-foreground font-medium">{label}</p>
    </div>
  );
};

const SocialProof = () => {
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const { stats, loading } = useAppStats();

  // Use stats from database or fallback defaults
  const statsData = [
    { 
      value: stats?.total_users ?? 2847, 
      suffix: "", 
      label: "Regisztrált felhasználó", 
      icon: Users 
    },
    { 
      value: stats?.total_cars ?? 4123, 
      suffix: "", 
      label: "Figyelt autó", 
      icon: Car 
    },
    { 
      value: Math.floor((stats?.total_estimated_savings ?? 47000000) / 1000000), 
      suffix: "+ millió Ft", 
      label: "Becsült megtakarítás", 
      icon: PiggyBank 
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto"
        >
          {statsData.map((stat, index) => (
            <StatItem
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              delay={index * 150}
              isInView={isInView && !loading}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
