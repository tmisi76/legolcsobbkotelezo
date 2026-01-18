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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const reminderDays = [50, 30, 7];
    const results: { type: string; carsSent: number; errors: string[] }[] = [];

    console.log(`Checking reminders for ${today.toISOString()}`);

    for (const days of reminderDays) {
      const targetDate = addDays(today, days);
      const targetDateStr = formatDateForDB(targetDate);
      const reminderType = `${days}_days`;

      console.log(`Checking cars with anniversary on ${targetDateStr} (${days} days)`);

      // Get cars with this anniversary date
      const { data: cars, error: carsError } = await supabase
        .from('cars')
        .select('id, user_id, nickname')
        .eq('anniversary_date', targetDateStr);

      if (carsError) {
        console.error(`Error fetching cars for ${days} days:`, carsError);
        results.push({ type: reminderType, carsSent: 0, errors: [carsError.message] });
        continue;
      }

      if (!cars || cars.length === 0) {
        console.log(`No cars found for ${days} days reminder`);
        results.push({ type: reminderType, carsSent: 0, errors: [] });
        continue;
      }

      console.log(`Found ${cars.length} cars for ${days} days reminder`);

      let sentCount = 0;
      const errors: string[] = [];

      for (const car of cars) {
        try {
          // Check if user has email reminders enabled
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email_reminders_enabled, reminder_days')
            .eq('user_id', car.user_id)
            .single();

          if (profileError || !profile) {
            console.log(`No profile found for user ${car.user_id}`);
            continue;
          }

          if (!profile.email_reminders_enabled) {
            console.log(`Email reminders disabled for user ${car.user_id}`);
            continue;
          }

          // Check if this reminder day is in user's preferences
          const reminderDaysArray = profile.reminder_days.split(',').map((d: string) => parseInt(d.trim()));
          if (!reminderDaysArray.includes(days)) {
            console.log(`User ${car.user_id} doesn't want ${days}-day reminders`);
            continue;
          }

          // Check if reminder already sent
          const { data: existingLog, error: logError } = await supabase
            .from('reminder_logs')
            .select('id')
            .eq('car_id', car.id)
            .eq('reminder_type', reminderType)
            .maybeSingle();

          if (logError) {
            console.error(`Error checking reminder log for car ${car.id}:`, logError);
            errors.push(`Log check failed for ${car.nickname}`);
            continue;
          }

          if (existingLog) {
            console.log(`Reminder already sent for car ${car.id}`);
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
            console.log(`Reminder sent for car ${car.id} (${car.nickname})`);
          } else {
            const errorText = await sendResponse.text();
            console.error(`Failed to send reminder for car ${car.id}:`, errorText);
            errors.push(`Send failed for ${car.nickname}: ${errorText}`);
          }
        } catch (err: any) {
          console.error(`Error processing car ${car.id}:`, err);
          errors.push(`Error for ${car.nickname}: ${err.message}`);
        }
      }

      results.push({ type: reminderType, carsSent: sentCount, errors });
    }

    console.log('Check reminders completed:', results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in check-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
