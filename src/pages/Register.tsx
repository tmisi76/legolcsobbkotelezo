import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Car, Shield, Loader2, Lock, Mail, User, Eye, EyeOff, Calendar, Bell } from "lucide-react";

const registerSchema = z.object({
  fullName: z.string().min(2, "A név minimum 2 karakter legyen").max(100, "A név maximum 100 karakter lehet"),
  email: z.string().email("Érvénytelen email cím").max(255, "Az email maximum 255 karakter lehet"),
  password: z.string().min(8, "A jelszó minimum 8 karakter legyen"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, "El kell fogadnod a feltételeket"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Call our custom Edge Function to handle registration with email confirmation
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email-confirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            fullName: data.fullName,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Regisztráció sikertelen",
          description: result.error || "Hiba történt a regisztráció során.",
        });
      } else {
        setRegistrationSuccess(true);
        toast({
          title: "✉️ Kérlek erősítsd meg az email címed!",
          description: "Küldtünk egy megerősítő linket az email címedre. Kattints rá a regisztráció befejezéséhez.",
          duration: 10000,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Regisztráció sikertelen",
        description: error.message || "Hiba történt a regisztráció során.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" />
              <Car className="w-4 h-4 text-primary-light absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-xl text-foreground">
              Legolcsóbb<span className="text-primary">Kötelező</span>
            </span>
          </Link>

          <div className="bg-card rounded-xl border border-border p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Erősítsd meg az email címed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Küldtünk egy megerősítő linket az email címedre. Kattints rá a regisztráció befejezéséhez.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Ha nem látod az emailt, nézd meg a spam mappát is.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                Vissza a bejelentkezéshez
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" />
              <Car className="w-4 h-4 text-primary-light absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-xl text-foreground">
              Legolcsóbb<span className="text-primary">Kötelező</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Ingyenes regisztráció
            </h1>
            <p className="text-muted-foreground">
              Hozd létre a fiókodat és soha ne maradj le a váltásról!
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teljes név</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Kovács János"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email cím</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="pelda@email.com"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jelszó</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 8 karakter"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jelszó megerősítése</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Írd be újra a jelszót"
                          className="pl-10 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal text-muted-foreground">
                        Elfogadom az{" "}
                        <Link to="/adatvedelem" className="text-primary hover:underline">
                          Adatvédelmi szabályzatot
                        </Link>{" "}
                        és az{" "}
                        <Link to="/aszf" className="text-primary hover:underline">
                          ÁSZF
                        </Link>
                        -et
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                variant="hero"
                size="xl"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Regisztráció...
                  </>
                ) : (
                  "Regisztráció"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              Az adataid biztonságban vannak
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Már van fiókod?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Jelentkezz be!
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative (desktop only) */}
      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        {/* Floating icons */}
        <div className="absolute top-20 left-20 animate-float">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Car className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute top-40 right-32 animate-float-delayed">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Calendar className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-40 left-32 animate-float" style={{ animationDelay: "-2s" }}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="absolute bottom-20 right-20 animate-float-delayed">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-md">
          <h2 className="text-3xl font-bold mb-4">
            Csatlakozz a 2,500+ felhasználóhoz!
          </h2>
          <p className="text-white/80 text-lg">
            Ingyenes emlékeztetőkkel és személyre szabott ajánlatokkal segítünk spórolni a kötelező biztosításodon.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
