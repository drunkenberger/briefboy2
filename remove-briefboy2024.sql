-- SQL commands to run in your Supabase SQL Editor to remove BRIEFBOY2024

-- Option 1: Delete the code completely
DELETE FROM beta_codes WHERE code = 'BRIEFBOY2024';

-- Option 2: Deactivate the code (if delete doesn't work due to RLS)
UPDATE beta_codes SET is_active = false WHERE code = 'BRIEFBOY2024';

-- Verify the change
SELECT code, is_active, current_uses, max_uses 
FROM beta_codes 
WHERE is_active = true 
ORDER BY code;