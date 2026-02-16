import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  User, 
  Bell, 
  Phone, 
  Star, 
  Lock, 
  Trash2, 
  Loader2,
  ChevronDown,
  Check,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Personal info schema
const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, "A név minimum 2 karakter").max(100, "Maximum 100 karakter"),
  phone: z
    .string()
    .trim()
    .regex(/^(\+36|06)?[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{3,4}$|^$/, "Érvénytelen telefonszám formátum")
    .optional()
    .or(z.literal("")),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Add meg a jelenlegi jelszavad"),
  newPassword: z.string().min(8, "Minimum 8 karakter"),
  confirmPassword: z.string().min(1, "Erősítsd meg az új jelszót"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "A jelszavak nem egyeznek",
  path: ["confirmPassword"],
});

// Delete account schema
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Add meg a jelszavad"),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;

export default function DashboardSettings() {
  const { user, profile, updateProfile, logout } = useAuth();
  
  // States
  const [isSavingPersonal, setIsSavingPersonal] = useState(false);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isSavingPremium, setIsSavingPremium] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  
  // Notification settings state
  const [emailReminders, setEmailReminders] = useState(profile?.email_reminders_enabled ?? true);
  const [wantsCallback, setWantsCallback] = useState(profile?.wants_callback ?? false);

  // Update state when profile loads
  useEffect(() => {
    if (profile) {
      setEmailReminders(profile.email_reminders_enabled);
      setWantsCallback(profile.wants_callback);
    }
  }, [profile]);

  // Personal info form
  const personalForm = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: profile?.full_name || "",
      phone: profile?.phone || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Delete account form
  const deleteForm = useForm<DeleteAccountForm>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      password: "",
    },
  });

  // Update form when profile changes
  useEffect(() => {
    if (profile) {
      personalForm.reset({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, personalForm]);

  // Handle personal info save
  const handleSavePersonal = async (data: PersonalInfoForm) => {
    setIsSavingPersonal(true);
    try {
      const result = await updateProfile({
        full_name: data.full_name,
        phone: data.phone || null,
      });
      if (result.error) throw result.error;
      toast.success("✅ Személyes adatok mentve!");
    } catch (error) {
      toast.error("Hiba történt a mentés során.");
    } finally {
      setIsSavingPersonal(false);
    }
  };

  // Handle notification settings save
  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      const result = await updateProfile({
        email_reminders_enabled: emailReminders,
      });
      if (result.error) throw result.error;
      toast.success("✅ Értesítési beállítások mentve!");
    } catch (error) {
      toast.error("Hiba történt a mentés során.");
    } finally {
      setIsSavingNotifications(false);
    }
  };

  // Handle premium service toggle
  const handlePremiumToggle = async (checked: boolean) => {
    setWantsCallback(checked);
    setIsSavingPremium(true);
    try {
      const result = await updateProfile({ wants_callback: checked });
      if (result.error) throw result.error;
      toast.success(checked 
        ? "✅ Személyes megkeresés bekapcsolva!" 
        : "Személyes megkeresés kikapcsolva"
      );
    } catch (error) {
      setWantsCallback(!checked); // Revert on error
      toast.error("Hiba történt a mentés során.");
    } finally {
      setIsSavingPremium(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (data: PasswordForm) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) throw error;
      
      toast.success("✅ Jelszó sikeresen megváltoztatva!");
      passwordForm.reset();
      setIsPasswordOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Hiba történt a jelszó módosítása során.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async (data: DeleteAccountForm) => {
    setIsDeletingAccount(true);
    try {
      // Get the current session token
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      if (!accessToken) {
        toast.error("Nincs aktív munkamenet. Kérlek jelentkezz be újra.");
        return;
      }

      // Call the Edge Function to delete the account
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ password: data.password }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Hiba történt a fiók törlése során.");
        return;
      }

      // Success - show prominent success message
      setShowDeleteSuccess(true);
      await logout();
      
      // Redirect after a delay
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error("Hiba történt a fiók törlése során.");
      setIsDeletingAccount(false);
      setIsDeleteDialogOpen(false);
    }
  };


  // Show success overlay after account deletion
  if (showDeleteSuccess) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            A fiókod sikeresen törölve lett
          </h2>
          <p className="text-muted-foreground mb-6">
            Minden adatodat véglegesen töröltük a rendszerből. Köszönjük, hogy velünk tartottál!
          </p>
          <p className="text-sm text-muted-foreground">
            Átirányítunk a főoldalra...
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title="Beállítások">
      <div className="max-w-2xl space-y-6">
        {/* Section 1: Personal Information */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Személyes adatok</h3>
              <p className="text-sm text-muted-foreground">
                Alapvető fiókbeállítások
              </p>
            </div>
          </div>

          <Form {...personalForm}>
            <form onSubmit={personalForm.handleSubmit(handleSavePersonal)} className="space-y-4">
              <FormField
                control={personalForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teljes név</FormLabel>
                    <FormControl>
                      <Input placeholder="Kovács János" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email (read-only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email cím</label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={user?.email || ""} 
                    disabled 
                    className="bg-muted"
                  />
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary rounded-md text-xs font-medium">
                    <Shield className="w-3 h-3" />
                    Megerősítve
                  </div>
                </div>
              </div>

              <FormField
                control={personalForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefonszám</FormLabel>
                    <FormControl>
                      <Input placeholder="+36 30 123 4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      Magyar formátum: +36 30 123 4567
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSavingPersonal}>
                {isSavingPersonal && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Mentés
              </Button>
            </form>
          </Form>
        </div>

        {/* Section 2: Premium Service */}
        <div className="relative rounded-xl p-[2px] bg-gradient-to-r from-warning via-primary to-secondary">
          <div className="bg-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  🌟 Személyre szabott ajánlat szolgáltatás
                </h3>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-4">
              Add meg a telefonszámodat és a váltási időszakban személyesen felhívunk 
              a számodra elérhető legjobb kötelező biztosítás ajánlattal. 
              Ez a szolgáltatás teljesen ingyenes!
            </p>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-4">
              <div>
                <p className="font-medium text-foreground">
                  Kérek személyes megkeresést
                </p>
                {wantsCallback && (
                  <p className="text-sm text-secondary flex items-center gap-1 mt-1">
                    <Check className="w-4 h-4" />
                    A következő váltási időszakban keresni fogunk!
                  </p>
                )}
              </div>
              <Switch
                checked={wantsCallback}
                onCheckedChange={handlePremiumToggle}
                disabled={isSavingPremium}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-secondary" />
                Személyre szabott ajánlat
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-secondary" />
                Díjmentes szolgáltatás
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-secondary" />
                Nincs elköteleződés
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-secondary" />
                Profi tanácsadás
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Notification Settings */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Értesítési beállítások</h3>
              <p className="text-sm text-muted-foreground">
                Email emlékeztetők konfigurálása
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email reminders toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email emlékeztetők</p>
                <p className="text-sm text-muted-foreground">
                  Értesítünk a biztosítás évfordulójáról
                </p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            {/* Info about reminder timing */}
            {emailReminders && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Automatikusan 3 emlékeztetőt küldünk:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>60 nappal az évforduló előtt (váltási időszak kezdete)</li>
                  <li>50 nappal az évforduló előtt</li>
                  <li>40 nappal az évforduló előtt (sürgős)</li>
                </ul>
              </div>
            )}

            <Button 
              onClick={handleSaveNotifications} 
              disabled={isSavingNotifications}
              variant="outline"
            >
              {isSavingNotifications && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Értesítések mentése
            </Button>
          </div>
        </div>

        {/* Section 4: Change Password */}
        <Collapsible open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">Jelszó módosítása</h3>
                  <p className="text-sm text-muted-foreground">
                    Biztonságos jelszócsere
                  </p>
                </div>
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 text-muted-foreground transition-transform",
                isPasswordOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-6 pb-6 pt-2 border-t border-border">
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jelenlegi jelszó</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Új jelszó</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>Minimum 8 karakter</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Új jelszó megerősítése</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Jelszó módosítása
                    </Button>
                  </form>
                </Form>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Section 5: Delete Account */}
        <div className="bg-card rounded-xl p-6 border-2 border-destructive/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive">Fiók törlése</h3>
              <p className="text-sm text-muted-foreground">
                Veszélyes zóna
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              A fiók törlése végleges és nem visszavonható. 
              Minden autód, beállításod és emlékeztetőd véglegesen törlődik.
            </p>
          </div>

          <Button 
            variant="outline" 
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
            Fiók törlése
          </Button>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törölni szeretnéd a fiókodat?</AlertDialogTitle>
            <AlertDialogDescription>
              Ez a művelet nem visszafordítható. A fiókod és minden adatod 
              véglegesen törlődik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <Form {...deleteForm}>
            <form onSubmit={deleteForm.handleSubmit(handleDeleteAccount)}>
              <FormField
                control={deleteForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Írd be a jelszavad a megerősítéshez</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeletingAccount}>
                  Mégse
                </AlertDialogCancel>
                <Button 
                  type="submit"
                  variant="destructive"
                  disabled={isDeletingAccount}
                >
                  {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Fiók végleges törlése
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
