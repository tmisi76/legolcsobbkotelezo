import { ArrowRight, Check, Lock, Mail, Car, Calendar, Bell, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 md:pt-0 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "-1.5s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] gradient-blob rounded-full blur-3xl opacity-50" />
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-[15%] animate-float">
          <div className="bg-card shadow-card rounded-2xl p-3">
            <Car className="w-6 h-6 text-primary" />
          </div>
        </div>
        <div className="absolute top-48 right-[20%] animate-float-delayed">
          <div className="bg-card shadow-card rounded-2xl p-3">
            <Calendar className="w-6 h-6 text-secondary" />
          </div>
        </div>
        <div className="absolute bottom-48 left-[25%] animate-float" style={{ animationDelay: "-2s" }}>
          <div className="bg-card shadow-card rounded-2xl p-3">
            <Bell className="w-6 h-6 text-warning" />
          </div>
        </div>
        <div className="absolute bottom-32 right-[15%] animate-float-delayed">
          <div className="bg-card shadow-card rounded-2xl p-3">
            <Shield className="w-6 h-6 text-primary-light" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-card shadow-soft rounded-full px-4 py-2 mb-6 md:mb-8 animate-fade-in">
            <span className="text-lg">🚗</span>
            <span className="text-sm font-medium text-muted-foreground">
              Több mint <span className="text-primary font-semibold">2,500</span> autós már használja
            </span>
          </div>

          {/* Main Headline */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4 md:mb-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Soha többé ne fizess{" "}
            <span className="text-primary">túl sokat</span>{" "}
            a kötelezőért!
          </h1>

          {/* Subheadline */}
          <p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            Regisztrálj ingyen, add meg mikor jár le a biztosításod, és mi{" "}
            <span className="font-semibold text-foreground">50 nappal előtte</span>{" "}
            emlékeztetünk a váltásra.
          </p>

          {/* CTA Buttons */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 md:mb-12 animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button variant="hero" size="xl" className="w-full sm:w-auto">
              Ingyenes regisztráció
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
              Megnézem hogyan működik
            </Button>
          </div>

          {/* Trust Indicators */}
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary/10">
                <Check className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">100% ingyenes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Biztonságos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-light/10">
                <Mail className="w-4 h-4 text-primary-light" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Nem spammelünk</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
