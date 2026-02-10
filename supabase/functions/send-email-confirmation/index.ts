import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max requests per window
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const FROM_EMAIL = Deno.env.get("RESEND_FROM") || "noreply@digitalisbirodalom.hu";

const REDIRECT_URL = "https://legolcsobbkotelezo.lovable.app/";

interface EmailConfirmationRequest {
  email: string;
  password: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting by IP
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Túl sok kérés. Próbáld újra később." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      console.error("[send-email-confirmation] RESEND_API_KEY is not configured");
      throw new Error("Email service not configured");
    }

    const { email, password, fullName }: EmailConfirmationRequest = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email és jelszó szükséges" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-email-confirmation] Processing confirmation for email`);

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate signup confirmation link using admin API
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: email,
      password: password,
      options: {
        redirectTo: REDIRECT_URL,
        data: {
          full_name: fullName,
        },
      },
    });

    if (linkError) {
      console.error(`[send-email-confirmation] Error generating link: ${linkError.message}`);
      throw new Error(linkError.message);
    }

    const confirmationLink = linkData.properties?.action_link;
    
    if (!confirmationLink) {
      console.error("[send-email-confirmation] No confirmation link generated");
      throw new Error("Failed to generate confirmation link");
    }

    console.log("[send-email-confirmation] Confirmation link generated successfully");

    // Send email via Resend
    const emailHtml = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email megerősítés</title>
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
                Üdvözlünk${fullName ? `, ${fullName}` : ""}! 🎉
              </h1>
              
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #475569; text-align: center;">
                Köszönjük, hogy regisztráltál a LegolcsóbbKötelező szolgáltatásra! Kérjük, erősítsd meg az email címedet az alábbi gombra kattintva:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding: 8px 0 24px;">
                    <a href="${confirmationLink}" 
                       style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 10px; box-shadow: 0 4px 14px 0 rgba(22, 163, 74, 0.39);">
                      Email cím megerősítése
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Ez a link <strong>24 órán belül</strong> lejár biztonsági okokból.
              </p>
              
              <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #94a3b8; text-align: center;">
                Ha nem te regisztráltál, nyugodtan figyelmen kívül hagyhatod ezt az emailt.
              </p>
            </td>
          </tr>
          
          <!-- Features -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #1e293b;">
                  Amit a regisztráció után élvezhetsz:
                </p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8; color: #475569;">
                  <li>🚗 Autóid nyilvántartása egy helyen</li>
                  <li>📧 Automatikus emlékeztetők a váltási időszakról</li>
                  <li>💰 Segítünk megtalálni a legjobb kötelező biztosítást</li>
                  <li>🌟 Személyre szabott ajánlatok (opcionális)</li>
                </ul>
              </div>
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
        from: `LegolcsóbbKötelező <${FROM_EMAIL}>`,
        to: [email],
        subject: "Erősítsd meg az email címed - LegolcsóbbKötelező",
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-email-confirmation] Resend error:", resendData);
      throw new Error(`Resend API error: ${resendData.message || "Unknown error"}`);
    }

    console.log("[send-email-confirmation] Email sent successfully:", resendData.id);

    return new Response(
      JSON.stringify({ success: true, message: "Megerősítő email elküldve." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[send-email-confirmation] Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message || "Hiba történt az email küldése során." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
