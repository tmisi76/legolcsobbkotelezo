import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useInView } from "@/hooks/useInView";

const FinalCTA = () => {
  const { ref, isInView } = useInView({ threshold: 0.3 });

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div
          ref={ref}
          className={`relative overflow-hidden rounded-3xl gradient-primary p-8 md:p-16 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              Kezdd el most - teljesen ingyen!
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8">
              Regisztrálj 30 másodperc alatt és soha ne maradj le a váltásról.
            </p>
            <Button
              asChild
              size="xl"
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              <Link to="/register">
                Regisztráció
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
