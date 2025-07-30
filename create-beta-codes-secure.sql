-- Secure way to create beta codes directly in Supabase SQL Editor
-- This bypasses RLS policies and runs with service role permissions

-- Insert new beta codes (example usage)
-- Uncomment and modify as needed:

/*
INSERT INTO beta_codes (code, max_uses, expires_at, is_active) VALUES
('NEWCODE2025', 20, NULL, true),
('SPECIAL2025', 10, '2025-12-31 23:59:59+00', true);
*/

-- View existing active codes
SELECT code, max_uses, current_uses, expires_at, is_active 
FROM beta_codes 
WHERE is_active = true 
ORDER BY created_at DESC;

-- Template for creating a new code:
-- INSERT INTO beta_codes (code, max_uses, expires_at, is_active) VALUES
-- ('YOUR_CODE', 20, NULL, true);

-- Template for deactivating a code:
-- UPDATE beta_codes SET is_active = false WHERE code = 'CODE_TO_DEACTIVATE';