-- SQL script to update the beta_codes INSERT policy for better security
-- Run this in your Supabase SQL Editor

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can create beta codes" ON beta_codes;

-- Create new restrictive policy that only allows service role to create beta codes
CREATE POLICY "Service role can create beta codes" ON beta_codes 
  FOR INSERT TO service_role;

-- Verify the policy was created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'beta_codes' AND cmd = 'INSERT';