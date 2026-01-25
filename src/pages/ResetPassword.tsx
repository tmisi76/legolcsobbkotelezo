import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
import { Car, Shield, Loader2, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "A jelszónak legalább 8 karakter hosszúnak kell lennie"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery token (Supabase redirects with hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          setIsValidToken(false);
        } else {
          setIsValidToken(true);
        }
      } else if (session) {
        // Already have a session (might be from recent recovery)
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
    };
    
    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Hiba történt",
          description: error.message,
        });
      } else {
        setIsSuccess(true);
        toast({
          title: "Jelszó megváltoztatva!",
          description: "Most már bejelentkezhetsz az új jelszavaddal.",
        });
        
        // Sign out to clear the recovery session
        await supabase.auth.signOut();
        
        // Redirect to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Still checking token validity
  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Ellenőrzés...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" />
              <Car className="w-4 h-4 text-primary-light absolute -bottom-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-xl text-foreground">
              Legolcsóbb<span className="text-primary">Kötelező</span>
            </span>
          </Link>
          
          <div className="bg-card rounded-2xl shadow-card p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Érvénytelen vagy lejárt link
            </h2>
            <p className="text-muted-foreground mb-6">
              A jelszó visszaállító link már nem érvényes. Kérj egy új linket az elfelejtett jelszó oldalon.
            </p>
            <Link to="/forgot-password">
              <Button variant="hero" size="lg" className="w-full">
                Új link kérése
              </Button>
            </Link>
            <div className="mt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Vissza a bejelentkezéshez
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <Shield className="w-8 h-8 text-primary transition-transform duration-200 group-hover:scale-110" />
            <Car className="w-4 h-4 text-primary-light absolute -bottom-0.5 -right-0.5" />
          </div>
          <span className="font-bold text-xl text-foreground">
            Legolcsóbb<span className="text-primary">Kötelező</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card p-8">
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Új jelszó beállítása
                </h1>
                <p className="text-muted-foreground">
                  Add meg az új jelszavadat.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Új jelszó</FormLabel>
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
                              placeholder="••••••••"
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

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mentés...
                      </>
                    ) : (
                      "Jelszó mentése"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Jelszó megváltoztatva!
              </h2>
              <p className="text-muted-foreground mb-6">
                Átirányítunk a bejelentkezési oldalra...
              </p>
              <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
