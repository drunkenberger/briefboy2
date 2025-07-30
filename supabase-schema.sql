-- BriefBoy Database Schema
-- Run this in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
-- This is already enabled by default in Supabase

-- 1. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  beta_code text NOT NULL,
  is_approved boolean DEFAULT true, -- Set to true since valid beta code = approved
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Beta codes table
CREATE TABLE beta_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  max_uses integer DEFAULT 1,
  current_uses integer DEFAULT 0,
  expires_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_codes ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for profiles table
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Allow profile creation during signup
CREATE POLICY "Enable profile creation during signup" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Create policies for beta_codes table
-- Anyone can read active beta codes for validation (but not see usage stats)
CREATE POLICY "Anyone can validate beta codes" ON beta_codes 
  FOR SELECT USING (is_active = true);

-- Only service role can create beta codes (restrict admin access)
CREATE POLICY "Service role can create beta codes" ON beta_codes 
  FOR INSERT TO service_role;

-- 6. Create function to automatically create profile after user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, beta_code)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'beta_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Create some initial beta codes for testing
INSERT INTO beta_codes (code, max_uses, expires_at) VALUES 
  ('BRIEFBOY2024', 10, '2024-12-31 23:59:59+00'),
  ('EARLYBIRD', 5, '2024-12-31 23:59:59+00'),
  ('BETATEST', 20, NULL), -- No expiration
  ('DEMO123', 1, '2024-06-30 23:59:59+00');

-- 9. Create updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- View to check beta code usage (helpful for monitoring)
CREATE VIEW beta_code_stats AS
SELECT 
  code,
  max_uses,
  current_uses,
  (max_uses - current_uses) as remaining_uses,
  CASE 
    WHEN expires_at IS NULL THEN 'Never'
    WHEN expires_at > now() THEN 'Active'
    ELSE 'Expired'
  END as status,
  expires_at,
  created_at
FROM beta_codes
WHERE is_active = true
ORDER BY created_at DESC;

-- Grant access to the view
GRANT SELECT ON beta_code_stats TO authenticated;