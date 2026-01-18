import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile, updateUserProfile } from "@/lib/database";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile, ProfileUpdate } from "@/types/database";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  register: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: ProfileUpdate) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await getUserProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        return { error: new Error(translateAuthError(error.message)) };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Ismeretlen hiba történt") };
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(translateAuthError(error.message)) };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Ismeretlen hiba történt") };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: new Error(translateAuthError(error.message)) };
      }
      setProfile(null);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Ismeretlen hiba történt") };
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: new Error(translateAuthError(error.message)) };
      }

      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Ismeretlen hiba történt") };
    }
  }, []);

  const updateProfileFn = useCallback(async (data: ProfileUpdate) => {
    if (!user) {
      return { error: new Error("Nincs bejelentkezett felhasználó") };
    }

    try {
      const updatedProfile = await updateUserProfile(user.id, data);
      setProfile(updatedProfile);
      return { error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error("Profil frissítés sikertelen") };
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    resetPassword,
    updateProfile: updateProfileFn,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Translate Supabase auth errors to Hungarian
function translateAuthError(message: string): string {
  const translations: Record<string, string> = {
    "Invalid login credentials": "Hibás email cím vagy jelszó",
    "Email not confirmed": "Az email cím nincs megerősítve",
    "User already registered": "Ez az email cím már regisztrálva van",
    "Password should be at least 6 characters": "A jelszó minimum 6 karakter legyen",
    "Unable to validate email address: invalid format": "Érvénytelen email formátum",
    "Signup requires a valid password": "Érvényes jelszó szükséges",
    "User not found": "Nem találjuk ezt a fiókot",
    "Email rate limit exceeded": "Túl sok próbálkozás, várj néhány percet",
    "For security purposes, you can only request this once every 60 seconds": "Biztonsági okokból csak 60 másodpercenként kérheted ezt",
    "Network request failed": "Hálózati hiba, próbáld újra",
  };

  for (const [key, value] of Object.entries(translations)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
}
