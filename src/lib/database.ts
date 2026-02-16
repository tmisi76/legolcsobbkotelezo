import { supabase } from "@/integrations/supabase/client";
import type { Profile, ProfileUpdate, Car, CarInsert, CarUpdate, AppStats } from "@/types/database";

// ============= Profile Functions =============

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Database] Profile fetch failed');
    throw new Error('Unable to fetch profile');
  }

  return data;
}

export async function createUserProfile(userId: string, fullName: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      full_name: fullName,
    })
    .select()
    .single();

  if (error) {
    console.error('[Database] Profile creation failed');
    throw new Error('Unable to create profile');
  }

  return data;
}

export async function updateUserProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[Database] Profile update failed');
    throw new Error('Unable to update profile');
  }

  return data;
}

// ============= Car Functions =============

export async function getUserCars(userId: string): Promise<Car[]> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('user_id', userId)
    .order('anniversary_date', { ascending: true });

  if (error) {
    console.error('[Database] Cars fetch failed');
    throw new Error('Unable to fetch cars');
  }

  return data || [];
}

export async function getCarById(carId: string): Promise<Car | null> {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', carId)
    .maybeSingle();

  if (error) {
    console.error('[Database] Car fetch failed');
    throw new Error('Unable to fetch car');
  }

  return data;
}

export async function createCar(carData: CarInsert): Promise<Car> {
  const { data, error } = await supabase
    .from('cars')
    .insert(carData)
    .select()
    .single();

  if (error) {
    console.error('[Database] Car creation failed');
    throw new Error('Unable to create car');
  }

  return data;
}

export async function updateCar(carId: string, updates: CarUpdate): Promise<Car> {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)
    .select()
    .single();

  if (error) {
    console.error('[Database] Car update failed');
    throw new Error('Unable to update car');
  }

  return data;
}

export async function deleteCar(carId: string): Promise<void> {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', carId);

  if (error) {
    console.error('[Database] Car deletion failed');
    throw new Error('Unable to delete car');
  }
}

// ============= App Stats Functions =============

export async function getAppStats(): Promise<AppStats | null> {
  const { data, error } = await supabase
    .from('app_stats')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  if (error) {
    console.error('[Database] App stats fetch failed');
    throw new Error('Unable to fetch app stats');
  }

  return data;
}

// ============= Utility Functions =============

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getDaysUntilAnniversary(anniversaryDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const anniversary = parseLocalDate(anniversaryDate);
  anniversary.setHours(0, 0, 0, 0);
  
  // If anniversary has passed this year, calculate for next year
  if (anniversary < today) {
    anniversary.setFullYear(anniversary.getFullYear() + 1);
  }
  
  const diffTime = anniversary.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

export function getInsuranceStatus(daysUntil: number): 'urgent' | 'warning' | 'upcoming' | 'safe' {
  if (daysUntil <= 0) return 'urgent';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'warning';
  if (daysUntil <= 50) return 'upcoming';
  return 'safe';
}

export function formatHungarianNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatHungarianDate(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
