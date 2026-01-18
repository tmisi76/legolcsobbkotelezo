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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Check authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[check-reminders] Missing authorization header');
      return new Response(
        JSON.stringify({ errorCode: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to validate
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('[check-reminders] Invalid token');
      return new Response(
        JSON.stringify({ errorCode: 'UNAUTHORIZED' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    // Use service role client for admin check and operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user is admin using the has_role function
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      console.log('[check-reminders] User is not admin');
      return new Response(
        JSON.stringify({ errorCode: 'FORBIDDEN' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('[check-reminders] Admin authorization verified');

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
        console.error(`[check-reminders] Cars fetch error for ${days} days`);
        results.push({ type: reminderType, carsSent: 0, errors: ['Database error'] });
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
            console.error(`[check-reminders] Log check error for car`);
            errors.push(`Log check failed`);
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
            console.log(`[check-reminders] Reminder sent for car ${car.id}`);
          } else {
            console.error(`[check-reminders] Send failed for car ${car.id}`);
            errors.push(`Send failed`);
          }
        } catch (err: any) {
          console.error(`[check-reminders] Error processing car ${car.id}`);
          errors.push(`Processing error`);
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
    console.error("[check-reminders] Function error:", error);
    return new Response(
      JSON.stringify({ errorCode: 'INTERNAL_ERROR' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
