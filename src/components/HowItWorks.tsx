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

const HowItWorks = () => {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Hogyan működik?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            3 egyszerű lépésben akár több tízezer forintot is spórolhatsz
          </p>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto relative"
        >
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />

          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`relative transition-all duration-700 ${
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-button">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl">{step.emoji}</span>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-primary/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
