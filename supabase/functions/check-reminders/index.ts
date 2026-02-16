import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDateForDB(date: Date): string {
  return date.toISOString().split('T')[0];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role client (called by cron job)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDays = [60, 50, 40];
    const results: { type: string; carsSent: number; errors: string[] }[] = [];

    console.log(`[check-reminders] Checking reminders for ${today.toISOString()}`);

    for (const days of reminderDays) {
      const targetDate = addDays(today, days);
      const targetDateStr = formatDateForDB(targetDate);
      const reminderType = `${days}_days`;

      console.log(`[check-reminders] Checking cars with anniversary on ${targetDateStr} (${days} days)`);

      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id, user_id, nickname')
        .eq('anniversary_date', targetDateStr);

      if (carsError) {
        console.error(`[check-reminders] Cars fetch error for ${days} days`);
        results.push({ type: reminderType, carsSent: 0, errors: ['Database error'] });
        continue;
      }

      if (!cars || cars.length === 0) {
        console.log(`[check-reminders] No cars found for ${days} days reminder`);
        results.push({ type: reminderType, carsSent: 0, errors: [] });
        continue;
      }

      console.log(`[check-reminders] Found ${cars.length} cars for ${days} days reminder`);

      let sentCount = 0;
      const errors: string[] = [];

      for (const car of cars) {
        try {
          // Check if user has email reminders enabled
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email_reminders_enabled')
            .eq('user_id', car.user_id)
            .single();

          if (profileError || !profile) {
            console.log(`[check-reminders] No profile found for user ${car.user_id}`);
            continue;
          }

          if (!profile.email_reminders_enabled) {
            console.log(`[check-reminders] Email reminders disabled for user ${car.user_id}`);
            continue;
          }

          // Check if reminder already sent
          const { data: existingLog } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('car_id', car.id)
            .eq('reminder_type', reminderType)
            .maybeSingle();

          if (existingLog) {
            console.log(`[check-reminders] Reminder already sent for car ${car.id}`);
            continue;
          }

          // Send reminder email via the other edge function
          const sendResponse = await fetch(`${supabaseUrl}/functions/v1/send-reminder-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              carId: car.id,
              reminderType: reminderType,
            }),
          });

          if (sendResponse.ok) {
            sentCount++;
            console.log(`[check-reminders] Reminder sent for car ${car.id}`);
          } else {
            console.error(`[check-reminders] Send failed for car ${car.id}`);
            errors.push(`Send failed`);
          }
        } catch (err) {
          console.error(`[check-reminders] Error processing car ${car.id}`);
          errors.push(`Processing error`);
        }
      }

      results.push({ type: reminderType, carsSent: sentCount, errors });
    }

    console.log('[check-reminders] Completed:', results);

    return new Response(
      JSON.stringify({ success: true, results, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[check-reminders] Function error:", error);
    return new Response(
      JSON.stringify({ errorCode: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
