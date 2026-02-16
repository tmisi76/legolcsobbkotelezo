import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const handler = async (req: Request): Promise<Response> => {
  try {
    const requestUrl = new URL(req.url);
    const logId = requestUrl.searchParams.get("log_id");
    const targetUrl = requestUrl.searchParams.get("url");

    if (logId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from('reminder_logs')
        .update({ link_clicked: true })
        .eq('id', logId);
    }

    const redirectTo = targetUrl || "https://legolcsobbkotelezo.lovable.app/dashboard";

    return new Response(null, {
      status: 302,
      headers: {
        "Location": redirectTo,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: { "Location": "https://legolcsobbkotelezo.lovable.app/dashboard" },
    });
  }
};

serve(handler);
