-- Create profiles table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL DEFAULT '',
    phone text,
    wants_callback boolean NOT NULL DEFAULT false,
    email_reminders_enabled boolean NOT NULL DEFAULT true,
    reminder_days text NOT NULL DEFAULT '50,30,7',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create cars table
CREATE TABLE public.cars (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    nickname text NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    year integer NOT NULL,
    engine_power_kw integer,
    current_annual_fee integer,
    anniversary_date date NOT NULL,
    license_plate text,
    notes text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create reminder_logs table
CREATE TABLE public.reminder_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id uuid NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
    reminder_type text NOT NULL CHECK (reminder_type IN ('50_days', '30_days', '7_days')),
    sent_at timestamp with time zone NOT NULL DEFAULT now(),
    email_opened boolean NOT NULL DEFAULT false
);

-- Create app_stats table (for landing page social proof)
CREATE TABLE public.app_stats (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    total_users integer NOT NULL DEFAULT 150,
    total_cars integer NOT NULL DEFAULT 230,
    total_estimated_savings integer NOT NULL DEFAULT 12500000,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_cars_user_id ON public.cars(user_id);
CREATE INDEX idx_cars_anniversary_date ON public.cars(anniversary_date);
CREATE INDEX idx_reminder_logs_car_id ON public.reminder_logs(car_id);
CREATE INDEX idx_reminder_logs_sent_at ON public.reminder_logs(sent_at);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_stats ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Cars RLS policies
CREATE POLICY "Users can view their own cars"
    ON public.cars FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cars"
    ON public.cars FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cars"
    ON public.cars FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cars"
    ON public.cars FOR DELETE
    USING (auth.uid() = user_id);

-- Reminder logs RLS policies (users can only view logs for their own cars)
CREATE POLICY "Users can view reminder logs for their own cars"
    ON public.reminder_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.cars
            WHERE cars.id = reminder_logs.car_id
            AND cars.user_id = auth.uid()
        )
    );

-- App stats RLS policy (everyone can read for landing page)
CREATE POLICY "Anyone can view app stats"
    ON public.app_stats FOR SELECT
    USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
    BEFORE UPDATE ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_stats_updated_at
    BEFORE UPDATE ON public.app_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    
    -- Increment user count in app_stats
    UPDATE public.app_stats SET total_users = total_users + 1 WHERE id = 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create function to increment car count
CREATE OR REPLACE FUNCTION public.increment_car_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.app_stats SET total_cars = total_cars + 1 WHERE id = 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to increment car count on new car
CREATE TRIGGER on_car_created
    AFTER INSERT ON public.cars
    FOR EACH ROW
    EXECUTE FUNCTION public.increment_car_count();

-- Insert initial app_stats row
INSERT INTO public.app_stats (id, total_users, total_cars, total_estimated_savings)
VALUES (1, 2847, 4123, 47000000)
ON CONFLICT (id) DO NOTHING;