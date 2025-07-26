-- Fix RLS policy and update beta codes
-- Run this in your Supabase SQL Editor

-- 1. Drop the restrictive policy for creating beta codes
DROP POLICY IF EXISTS "Authenticated users can create beta codes" ON beta_codes;

-- 2. Create a more permissive policy for admin operations
-- This allows anyone with the anon key to create codes (for your admin script)
CREATE POLICY "Allow beta code creation" ON beta_codes 
  FOR INSERT WITH CHECK (true);

-- 3. Update existing beta codes to have 20 uses and no expiration
UPDATE beta_codes 
SET 
  max_uses = 20,
  expires_at = NULL
WHERE code IN ('BRIEFBOY2024', 'EARLYBIRD', 'BETATEST', 'DEMO123');

-- 4. Add the new MASMXBOOTCAMPER code
INSERT INTO beta_codes (code, max_uses, expires_at) 
VALUES ('MASMXBOOTCAMPER', 20, NULL)
ON CONFLICT (code) DO UPDATE SET
  max_uses = 20,
  expires_at = NULL;

-- 5. Verify the changes
SELECT 
  code,
  max_uses,
  current_uses,
  (max_uses - current_uses) as remaining_uses,
  CASE 
    WHEN expires_at IS NULL THEN 'Never expires'
    WHEN expires_at > now() THEN 'Active'
    ELSE 'Expired'
  END as expiration_status,
  is_active,
  created_at
FROM beta_codes
ORDER BY created_at DESC;