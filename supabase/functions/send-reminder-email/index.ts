import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmailWithResend(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "LegolcsóbbKötelező <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReminderEmailRequest {
  carId: string;
  reminderType: "50_days" | "30_days" | "7_days";
  testEmail?: string; // Optional: for testing purposes
}

interface CarWithProfile {
  id: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  anniversary_date: string;
  current_annual_fee: number | null;
  user_id: string;
  profile: {
    full_name: string;
    email: string;
    wants_callback: boolean;
  };
}

function formatHungarianDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getEmailSubject(reminderType: string, carNickname: string): string {
  switch (reminderType) {
    case "50_days":
      return `⏰ ${carNickname} - 50 nap múlva lejár a kötelező!`;
    case "30_days":
      return `⚠️ ${carNickname} - Már csak 30 nap a váltásig!`;
    case "7_days":
      return `🚨 ${carNickname} - Utolsó figyelmeztetés: 7 nap!`;
    default:
      return `Emlékeztető: ${carNickname} kötelező biztosítás`;
  }
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

function generateEmailHtml(car: CarWithProfile, reminderType: string): string {
  const colors = getUrgencyColors(reminderType);
  const daysText = getDaysText(reminderType);
  const urgencyTitle = getUrgencyTitle(reminderType);
  const dashboardUrl = "https://legolcsobbkotelezo.hu/dashboard";
  const estimatedSavings = car.current_annual_fee ? Math.round(car.current_annual_fee * 0.18) : null;

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
                Kedves ${car.profile.full_name || 'Felhasználó'}!
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
                            ${car.nickname}
                          </h3>
                          <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            ${car.brand} ${car.model}, ${car.year}
                          </p>
                        </td>
                      </tr>
                    </table>
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.1);">
                      <p style="color: ${colors.text}; margin: 0; font-size: 14px;">
                        <strong>📅 Évforduló:</strong> ${formatHungarianDate(car.anniversary_date)}
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
              
              ${car.profile.wants_callback ? `
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { carId, reminderType, testEmail }: ReminderEmailRequest = await req.json();

    console.log(`Processing reminder email for car ${carId}, type: ${reminderType}`);

    // Get car with profile data
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      console.error('Car not found:', carError);
      return new Response(
        JSON.stringify({ error: 'Car not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', car.user_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from auth
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(car.user_id);
    
    if (authError || !authUser.user) {
      console.error('Auth user not found:', authError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const carWithProfile: CarWithProfile = {
      ...car,
      profile: {
        full_name: profile.full_name,
        email: authUser.user.email!,
        wants_callback: profile.wants_callback,
      }
    };

    const recipientEmail = testEmail || carWithProfile.profile.email;
    const subject = getEmailSubject(reminderType, car.nickname);
    const html = generateEmailHtml(carWithProfile, reminderType);

    console.log(`Sending email to ${recipientEmail}`);

    const emailResponse = await sendEmailWithResend(recipientEmail, subject, html);

    console.log("Email sent successfully:", emailResponse);

    // Log the reminder (only for non-test emails)
    if (!testEmail) {
      await supabase
        .from('reminder_logs')
        .insert({
          car_id: carId,
          reminder_type: reminderType,
        });
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-reminder-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
