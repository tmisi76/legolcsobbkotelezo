import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("RESEND_FROM") || "noreply@digitalisbirodalom.hu";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatHungarianDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`{{${key}}}`, value || '');
  }
  return result;
}

interface ReminderEmailRequest {
  carId: string;
  reminderType: string;
  testEmail?: string;
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
    console.log(`[send-reminder-email] Processing car ${carId}, type ${reminderType}`);

    // Get car data
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return new Response(
        JSON.stringify({ errorCode: 'RESOURCE_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', car.user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ errorCode: 'RESOURCE_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(car.user_id);
    if (!authUser?.user?.email) {
      return new Response(
        JSON.stringify({ errorCode: 'RESOURCE_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = testEmail || authUser.user.email;

    // Get email template from database
    const templateKey = `reminder_${reminderType}`;
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .single();

    if (!template) {
      console.error(`[send-reminder-email] Template not found: ${templateKey}`);
      return new Response(
        JSON.stringify({ errorCode: 'TEMPLATE_NOT_FOUND' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert reminder log first to get the ID for tracking
    const { data: logEntry, error: logError } = await supabase
      .from('reminder_logs')
      .insert({
        car_id: carId,
        reminder_type: reminderType,
        user_email: recipientEmail,
        user_name: profile.full_name,
        car_nickname: car.nickname,
        license_plate: car.license_plate,
      })
      .select('id')
      .single();

    const logId = logEntry?.id || 'unknown';

    // Build tracking URLs
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?log_id=${logId}`;
    const baseTrackUrl = `${supabaseUrl}/functions/v1/track-email-click`;
    const baseActionUrl = `${supabaseUrl}/functions/v1/email-action`;
    const dashboardUrl = "https://legolcsobbkotelezo.lovable.app/dashboard";
    const settingsUrl = "https://legolcsobbkotelezo.lovable.app/dashboard/settings";

    const estimatedSavings = car.current_annual_fee ? Math.round(car.current_annual_fee * 0.18) : 0;
    const daysNum = reminderType.replace('_days', '');

    // Placeholder data
    const placeholderData: Record<string, string> = {
      nev: profile.full_name || 'Felhasználó',
      rendszam: car.license_plate || 'N/A',
      auto_becenev: car.nickname,
      marka: car.brand,
      modell: car.model,
      evjarat: String(car.year),
      evfordulo: formatHungarianDate(car.anniversary_date),
      hatra_nap: daysNum,
      eves_dij: car.current_annual_fee ? car.current_annual_fee.toLocaleString('hu-HU') : '0',
      megtakaritas: estimatedSavings.toLocaleString('hu-HU'),
      dashboard_url: `${baseTrackUrl}?log_id=${logId}&url=${encodeURIComponent(dashboardUrl)}`,
      beallitasok_url: `${baseTrackUrl}?log_id=${logId}&url=${encodeURIComponent(settingsUrl)}`,
      visszahivas_url: `${baseActionUrl}?log_id=${logId}&action=callback`,
      ajanlat_url: `${baseActionUrl}?log_id=${logId}&action=offer`,
      tracking_pixel_url: trackingPixelUrl,
    };

    const subject = replacePlaceholders(template.subject, placeholderData);
    const html = replacePlaceholders(template.body_html, placeholderData);

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `LegolcsóbbKötelező <${FROM_EMAIL}>`,
        to: [recipientEmail],
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      console.error(`[send-reminder-email] Resend error: ${errorText}`);
      // Clean up log entry on failure
      if (logEntry?.id) {
        await supabase.from('reminder_logs').delete().eq('id', logEntry.id);
      }
      throw new Error(`Resend error: ${resendResponse.status}`);
    }

    const emailResult = await resendResponse.json();
    console.log(`[send-reminder-email] Email sent successfully to ${recipientEmail}`);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-reminder-email] Error:", error);
    return new Response(
      JSON.stringify({ errorCode: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
