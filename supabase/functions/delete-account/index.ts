import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { password } = await req.json();
    if (!password) {
      return new Response(
        JSON.stringify({ error: "Password is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token to get their info
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify the user's JWT and get claims
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;

    // Verify password by attempting to sign in
    const { error: signInError } = await supabaseUser.auth.signInWithPassword({
      email: userEmail,
      password: password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: "Hibás jelszó" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get all car IDs for this user (needed for deleting related records)
    const { data: cars } = await supabaseAdmin
      .from("cars")
      .select("id")
      .eq("user_id", userId);

    const carIds = cars?.map((car) => car.id) || [];

    // Delete in correct order due to foreign key constraints
    // 1. Delete car_documents (references cars)
    if (carIds.length > 0) {
      await supabaseAdmin
        .from("car_documents")
        .delete()
        .in("car_id", carIds);

      // 2. Delete reminder_logs (references cars)
      await supabaseAdmin
        .from("reminder_logs")
        .delete()
        .in("car_id", carIds);
    }

    // 3. Delete personal_documents (references user_id)
    await supabaseAdmin
      .from("personal_documents")
      .delete()
      .eq("user_id", userId);

    // 4. Delete cars (references user_id via profiles)
    await supabaseAdmin
      .from("cars")
      .delete()
      .eq("user_id", userId);

    // 5. Delete user_roles
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    // 6. Delete profile
    await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    // 7. Delete the user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      return new Response(
        JSON.stringify({ error: "Hiba történt a fiók törlése során" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrement user count and car count in app_stats
    try {
      const { data: statsData } = await supabaseAdmin
        .from("app_stats")
        .select("total_users, total_cars")
        .eq("id", 1)
        .single();

      if (statsData) {
        await supabaseAdmin
          .from("app_stats")
          .update({ 
            total_users: Math.max(0, statsData.total_users - 1),
            total_cars: Math.max(0, statsData.total_cars - carIds.length)
          })
          .eq("id", 1);
      }
    } catch {
      // Ignore if update fails
    }

    return new Response(
      JSON.stringify({ success: true, message: "Fiók sikeresen törölve" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Delete account error:", error);
    return new Response(
      JSON.stringify({ error: "Váratlan hiba történt" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
