import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EmailPreviewData {
  userName: string;
  carNickname: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  anniversaryDate: string;
  currentAnnualFee: number;
  wantsCallback: boolean;
}

function formatHungarianDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getUrgencyColors(reminderType: string): { primary: string; bg: string; text: string } {
  switch (reminderType) {
    case "50_days":
      return { primary: "#1e40af", bg: "#dbeafe", text: "#1e3a8a" };
    case "30_days":
      return { primary: "#ea580c", bg: "#ffedd5", text: "#9a3412" };
    case "7_days":
      return { primary: "#dc2626", bg: "#fee2e2", text: "#991b1b" };
    default:
      return { primary: "#1e40af", bg: "#dbeafe", text: "#1e3a8a" };
  }
}

function getDaysText(reminderType: string): string {
  switch (reminderType) {
    case "50_days":
      return "50 nap múlva";
    case "30_days":
      return "30 nap múlva";
    case "7_days":
      return "7 nap múlva";
    default:
      return "hamarosan";
  }
}

function getUrgencyTitle(reminderType: string): string {
  switch (reminderType) {
    case "50_days":
      return "Ideje elkezdeni a tervezést!";
    case "30_days":
      return "Figyelj, közeleg a határidő!";
    case "7_days":
      return "🚨 Utolsó figyelmeztetés!";
    default:
      return "Emlékeztető";
  }
}

function generateEmailHtml(data: EmailPreviewData, reminderType: string): string {
  const colors = getUrgencyColors(reminderType);
  const daysText = getDaysText(reminderType);
  const urgencyTitle = getUrgencyTitle(reminderType);
  const dashboardUrl = "https://legolcsobbkotelezo.hu/dashboard";
  const estimatedSavings = data.currentAnnualFee ? Math.round(data.currentAnnualFee * 0.18) : null;

  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kötelező biztosítás emlékeztető</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${colors.primary} 0%, #3b82f6 100%); padding: 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">
                🚗 LegolcsóbbKötelező.hu
              </h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 22px;">
                Kedves ${data.userName || 'Felhasználó'}!
              </h2>
              
              <p style="color: #4b5563; font-size: 18px; line-height: 1.6; margin: 0 0 24px 0;">
                Az autód kötelező biztosítása <strong style="color: ${colors.primary};">${daysText}</strong> lejár!
              </p>
              
              <!-- Car Info Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.bg}; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="vertical-align: middle; width: 60px;">
                          <div style="width: 50px; height: 50px; background-color: ${colors.primary}; border-radius: 12px; text-align: center; line-height: 50px; font-size: 24px;">
                            🚗
                          </div>
                        </td>
                        <td style="vertical-align: middle; padding-left: 16px;">
                          <h3 style="color: ${colors.text}; margin: 0 0 4px 0; font-size: 18px; font-weight: bold;">
                            ${data.carNickname}
                          </h3>
                          <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            ${data.carBrand} ${data.carModel}, ${data.carYear}
                          </p>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.1);">
                      <p style="color: ${colors.text}; margin: 0; font-size: 14px;">
                        <strong>📅 Évforduló:</strong> ${formatHungarianDate(data.anniversaryDate)}
                      </p>
                      ${estimatedSavings ? `
                      <p style="color: #059669; margin: 8px 0 0 0; font-size: 14px;">
                        <strong>💰 Becsült megtakarítás:</strong> ~${estimatedSavings.toLocaleString('hu-HU')} Ft/év
                      </p>
                      ` : ''}
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Urgency Message -->
              <div style="background-color: #f9fafb; border-left: 4px solid ${colors.primary}; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
                <h4 style="color: ${colors.text}; margin: 0 0 8px 0; font-size: 16px;">
                  ${urgencyTitle}
                </h4>
                <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.5;">
                  ${reminderType === "50_days" 
                    ? "Most van itt a legjobb idő, hogy körülnézz és megtaláld a legolcsóbb ajánlatot. A biztosítást november 1. és december 31. között lehet váltani."
                    : reminderType === "30_days"
                    ? "A váltási időszak közeledik! Ne hagyd az utolsó pillanatra - a korai döntéssel elkerülheted a stresszt és jobb ajánlatokat találhatsz."
                    : "Ez az utolsó figyelmeztetésed! Ha még nem intézted el, most tedd meg, különben automatikusan megújul a biztosításod a régi feltételekkel."
                  }
                </p>
              </div>
              
              ${data.wantsCallback ? `
              <!-- Callback Confirmation -->
              <div style="background-color: #d1fae5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #065f46; margin: 0; font-size: 14px;">
                  ✅ <strong>Kértél személyes megkeresést</strong> - hamarosan felhívunk a legjobb ajánlattal!
                </p>
              </div>
              ` : ''}
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center; padding: 24px 0;">
                    <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, #3b82f6 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 14px 0 rgba(30, 64, 175, 0.25);">
                      Belépés a fiókomba →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 12px;">
                Ha nem szeretnél több emlékeztetőt kapni, <a href="${dashboardUrl}/settings" style="color: #6b7280;">itt leiratkozhatsz</a>.
              </p>
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2024 LegolcsóbbKötelező.hu - Minden jog fenntartva
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export default function AdminEmailPreview() {
  const [reminderType, setReminderType] = useState<string>("50_days");
  const [formData, setFormData] = useState<EmailPreviewData>({
    userName: "Kovács János",
    carNickname: "Családi autó",
    carBrand: "Opel",
    carModel: "Astra",
    carYear: 2018,
    anniversaryDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currentAnnualFee: 85000,
    wantsCallback: true,
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const emailHtml = generateEmailHtml(formData, reminderType);

  async function sendTestEmail() {
    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('Nincs bejelentkezve felhasználó');
      }

      // For preview, we'll use direct Resend API call via a simple edge function
      toast({
        title: "⚠️ Teszt funkció",
        description: "Az email előnézethez használd az Admin Dashboard-ot és válassz egy valós autót.",
      });
    } catch (error: any) {
      toast({
        title: "Hiba",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Email Előnézet</h1>
              <p className="text-sm text-muted-foreground">Emlékeztető email sablonok tesztelése</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Email beállítások</CardTitle>
              <CardDescription>Szerkeszd a teszt adatokat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email típus</Label>
                <Select value={reminderType} onValueChange={setReminderType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50_days">50 napos emlékeztető</SelectItem>
                    <SelectItem value="30_days">30 napos emlékeztető</SelectItem>
                    <SelectItem value="7_days">7 napos emlékeztető</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Felhasználó neve</Label>
                <Input
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                />
              </div>

              <div>
                <Label>Autó becenév</Label>
                <Input
                  value={formData.carNickname}
                  onChange={(e) => setFormData({ ...formData, carNickname: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Márka</Label>
                  <Input
                    value={formData.carBrand}
                    onChange={(e) => setFormData({ ...formData, carBrand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Típus</Label>
                  <Input
                    value={formData.carModel}
                    onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Évjárat</Label>
                  <Input
                    type="number"
                    value={formData.carYear}
                    onChange={(e) => setFormData({ ...formData, carYear: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Éves díj (Ft)</Label>
                  <Input
                    type="number"
                    value={formData.currentAnnualFee}
                    onChange={(e) => setFormData({ ...formData, currentAnnualFee: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Évforduló dátum</Label>
                <Input
                  type="date"
                  value={formData.anniversaryDate}
                  onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="callback"
                  checked={formData.wantsCallback}
                  onCheckedChange={(checked) => setFormData({ ...formData, wantsCallback: checked as boolean })}
                />
                <Label htmlFor="callback" className="cursor-pointer">
                  Telefonos visszahívás kérése
                </Label>
              </div>

              <Button 
                className="w-full" 
                onClick={sendTestEmail}
                disabled={sending}
              >
                {sending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Teszt email küldése
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Előnézet
              </CardTitle>
              <CardDescription>
                Az email így fog kinézni a felhasználónak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden bg-gray-100">
                <iframe
                  srcDoc={emailHtml}
                  className="w-full h-[700px]"
                  title="Email Preview"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
