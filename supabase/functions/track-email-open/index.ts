import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF
const TRANSPARENT_GIF = Uint8Array.from(atob("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"), c => c.charCodeAt(0));

const handler = async (req: Request): Promise<Response> => {
  try {
    const url = new URL(req.url);
    const logId = url.searchParams.get("log_id");

    if (logId) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from('reminder_logs')
        .update({ email_opened: true })
        .eq('id', logId);
    }

    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response(TRANSPARENT_GIF, {
      status: 200,
      headers: { "Content-Type": "image/gif" },
    });
  }
};

serve(handler);
