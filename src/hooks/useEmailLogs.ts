import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmailLog {
  id: string;
  car_id: string;
  reminder_type: string;
  sent_at: string;
  email_opened: boolean;
  user_email: string | null;
  user_name: string | null;
  car_nickname: string | null;
  license_plate: string | null;
  link_clicked: boolean;
  callback_requested: boolean;
  offer_requested: boolean;
}

export function useEmailLogs() {
  return useQuery({
    queryKey: ["email-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminder_logs")
        .select("*")
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data as unknown as EmailLog[];
    },
  });
}
