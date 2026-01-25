import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Car, Shield, Loader2, Lock, Mail, Eye, EyeOff, Calendar, Bell, CheckCircle } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Érvénytelen email cím"),
  password: z.string().min(1, "Add meg a jelszót"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { error } = await login(data.email, data.password);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Bejelentkezés sikertelen",
          description: error.message,
        });
      } else {
        toast({
          title: "Sikeres bejelentkezés!",
          description: "Üdvözlünk vissza!",
        });
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              Bejelentkezés
            </h1>
            <p className="text-muted-foreground">
              Üdvözlünk újra nálunk!
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Jelszó</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Elfelejtett jelszó?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
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
                    Bejelentkezés...
                  </>
                ) : (
                  "Bejelentkezés"
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Nincs még fiókod?{" "}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Regisztrálj ingyen!
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
        <div className="relative z-10 text-white max-w-md">
          <h2 className="text-3xl font-bold mb-6">
            Miért válassz minket?
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-white/90">50 nappal a lejárat előtt emlékeztetünk</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-white/90">Személyre szabott ajánlatok telefonon</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-white/90">Akár több autót is hozzáadhatsz</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5" />
              <span className="text-white/90">100% ingyenes, nincs rejtett díj</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
