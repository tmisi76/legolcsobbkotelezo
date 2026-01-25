// Database types for LegolcsóbbKötelező application

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  wants_callback: boolean;
  email_reminders_enabled: boolean;
  reminder_days: string;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  user_id: string;
  nickname: string;
  brand: string;
  model: string;
  year: number;
  engine_power_kw: number | null;
  current_annual_fee: number | null;
  anniversary_date: string;
  license_plate: string | null;
  notes: string | null;
  payment_method: string | null;
  has_child_under_18: boolean | null;
  accepts_email_only: boolean | null;
  payment_frequency: string | null;
  processing_status: string | null;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReminderLog {
  id: string;
  car_id: string;
  reminder_type: '50_days' | '30_days' | '7_days';
  sent_at: string;
  email_opened: boolean;
}

export interface AppStats {
  id: number;
  total_users: number;
  total_cars: number;
  total_estimated_savings: number;
  updated_at: string;
}

// Input types for creating/updating
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type CarInsert = Omit<Car, 'id' | 'created_at' | 'updated_at' | 'processing_status' | 'document_url'> & {
  processing_status?: string | null;
  document_url?: string | null;
};
export type CarUpdate = Partial<Omit<Car, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
