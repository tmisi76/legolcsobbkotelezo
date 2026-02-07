import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const REDIRECT_URL = "https://legolcsobbkotelezo.lovable.app/reset-password";

interface PasswordResetRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("[send-password-reset] RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const { email }: PasswordResetRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email cím szükséges" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-password-reset] Processing request for email`);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate recovery link using admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: REDIRECT_URL,
      },
    });

    if (linkError) {
      console.log(`[send-password-reset] Error generating link: ${linkError.message}`);
      // Don't reveal whether email exists or not for security
      return new Response(
        JSON.stringify({ success: true, message: "Ha létezik ilyen fiók, elküldtük a visszaállító linket." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recoveryLink = linkData.properties?.action_link;
    
    if (!recoveryLink) {
      console.error("[send-password-reset] No recovery link generated");
      throw new Error("Failed to generate recovery link");
    }

    console.log("[send-password-reset] Recovery link generated successfully");

    // Send email via Resend
    const emailHtml = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jelszó visszaállítás</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 520px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
              <div style="display: inline-flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px; font-weight: 700; color: #1e293b;">
                  Legolcsóbb<span style="color: #16a34a;">Kötelező</span>
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #1e293b; text-align: center;">
                Jelszó visszaállítás
              </h1>
              
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
                Kaptunk egy kérést a fiókod jelszavának visszaállítására. Ha te kérted, kattints az alábbi gombra:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${recoveryLink}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(22, 163, 74, 0.39);">
                      Jelszó visszaállítása
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Ez a link <strong>1 órán belül</strong> lejár biztonsági okokból.
              </p>
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Ha nem te kérted a jelszó visszaállítását, nyugodtan figyelmen kívül hagyhatod ezt az emailt.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-radius: 0 0 16px 16px; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                © ${new Date().getFullYear()} LegolcsóbbKötelező. Minden jog fenntartva.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; line-height: 1.5; color: #94a3b8; text-align: center;">
                <a href="https://legolcsobbkotelezo.lovable.app" style="color: #16a34a; text-decoration: none;">legolcsobbkotelezo.lovable.app</a>
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

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LegolcsóbbKötelező <noreply@legolcsobbkotelezo.hu>",
        to: [email],
        subject: "Jelszó visszaállítás - LegolcsóbbKötelező",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-password-reset] Resend error:", resendData);
      throw new Error("Failed to send email");
    }

    console.log("[send-password-reset] Email sent successfully:", resendData.id);

    return new Response(
      JSON.stringify({ success: true, message: "Ha létezik ilyen fiók, elküldtük a visszaállító linket." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-password-reset] Error:", error.message);
    
    // Always return success message to prevent email enumeration
    return new Response(
      JSON.stringify({ success: true, message: "Ha létezik ilyen fiók, elküldtük a visszaállító linket." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
