// Simple script to create beta codes for BriefBoy
// Run this in Node.js with your Supabase credentials

const { createClient } = require('@supabase/supabase-js');

// Add your Supabase credentials here (these match your .env file)
const supabaseUrl = 'https://jgseezalzmforvkcyvnx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impnc2VlemFsem1mb3J2a2N5dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NzczMzAsImV4cCI6MjA2OTA1MzMzMH0.zWRCzh1LVn6XDCbvfsz4eMvH6ivGALooLMSXEdJ98ek'; // Using anon key since RLS policy was fixed

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to create beta codes
async function createBetaCode(code, maxUses = 1, expiresAt = null) {
  const { data, error } = await supabase
    .from('beta_codes')
    .insert({
      code: code.toUpperCase(),
      max_uses: maxUses,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error(`❌ Error creating code ${code}:`, error.message);
    return null;
  }

  console.log(`✅ Created code: ${data.code} (${data.max_uses} uses)`);
  return data;
}

// Function to create multiple codes
async function createMultipleCodes(codes) {
  console.log(`Creating ${codes.length} beta codes...`);
  
  for (const codeData of codes) {
    await createBetaCode(codeData.code, codeData.maxUses, codeData.expiresAt);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Function to generate random codes
function generateRandomCode(prefix = 'BRIEF', length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix;
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Main function to run
async function main() {
  console.log('🚀 BriefBoy Beta Code Creator');
  console.log('===============================');

  // Example: Create some initial beta codes
  const initialCodes = [
    {
      code: 'BRIEFBOY2024',
      maxUses: 10,
      expiresAt: '2024-12-31T23:59:59Z'
    },
    {
      code: 'EARLYBIRD',
      maxUses: 5,
      expiresAt: '2024-06-30T23:59:59Z'
    },
    {
      code: 'BETATEST',
      maxUses: 20,
      expiresAt: null // No expiration
    }
  ];

  // Create initial codes
  await createMultipleCodes(initialCodes);

  // Generate 5 random codes
  console.log('\nGenerating random codes...');
  for (let i = 0; i < 5; i++) {
    const randomCode = generateRandomCode('BRIEF', 4);
    await createBetaCode(randomCode, 1, '2024-12-31T23:59:59Z');
  }

  // Check existing codes
  console.log('\nCurrent beta codes:');
  const { data: codes, error } = await supabase
    .from('beta_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching codes:', error);
  } else {
    codes.forEach(code => {
      const remaining = code.max_uses - code.current_uses;
      const status = code.is_active ? 
        (remaining > 0 ? `Active (${remaining} remaining)` : 'Exhausted') : 
        'Inactive';
      console.log(`📄 ${code.code}: ${status}`);
    });
  }

  console.log('\n✨ Done! You can now use these codes in your app.');
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createBetaCode,
  createMultipleCodes,
  generateRandomCode
};