import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
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
import { Car, Shield, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Érvénytelen email cím"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("send-password-reset", {
        body: { email: data.email },
      });

      if (response.error) {
        console.error("[ForgotPassword] Edge function error:", response.error);
        toast({
          variant: "destructive",
          title: "Hiba történt",
          description: "Nem sikerült elküldeni az emailt. Próbáld újra később.",
        });
      } else {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error("[ForgotPassword] Error:", error);
      toast({
        variant: "destructive",
        title: "Hiba történt",
        description: "Váratlan hiba történt. Próbáld újra később.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          {!isSubmitted ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Elfelejtett jelszó
                </h1>
                <p className="text-muted-foreground">
                  Add meg az email címed és küldünk egy visszaállító linket.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        Küldés...
                      </>
                    ) : (
                      "Visszaállító link küldése"
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
                Email elküldve!
              </h2>
              <p className="text-muted-foreground mb-6">
                Ha létezik ilyen fiók, elküldtük a visszaállító linket. Nézd meg az email fiókod (és a spam mappát is).
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
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
};

export default ForgotPasswordPage;
