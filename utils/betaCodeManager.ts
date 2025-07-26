import { supabase } from './supabase';

/**
 * Beta Code Management Utilities
 * These functions help you create and manage beta codes for your testers
 */

export interface BetaCodeCreate {
  code: string;
  maxUses?: number;
  expiresAt?: Date;
}

export interface BetaCodeInfo {
  id: string;
  code: string;
  max_uses: number;
  current_uses: number;
  remaining_uses: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  status: 'active' | 'expired' | 'exhausted';
}

/**
 * Create a new beta code
 */
export const createBetaCode = async (codeData: BetaCodeCreate): Promise<BetaCodeInfo> => {
  const { data, error } = await supabase
    .from('beta_codes')
    .insert({
      code: codeData.code.toUpperCase(),
      max_uses: codeData.maxUses || 1,
      expires_at: codeData.expiresAt?.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating beta code: ${error.message}`);
  }

  return {
    ...data,
    remaining_uses: data.max_uses - data.current_uses,
    status: getCodeStatus(data),
  };
};

/**
 * Create multiple beta codes at once
 */
export const createBulkBetaCodes = async (codes: BetaCodeCreate[]): Promise<BetaCodeInfo[]> => {
  const codesData = codes.map(code => ({
    code: code.code.toUpperCase(),
    max_uses: code.maxUses || 1,
    expires_at: code.expiresAt?.toISOString(),
  }));

  const { data, error } = await supabase
    .from('beta_codes')
    .insert(codesData)
    .select();

  if (error) {
    throw new Error(`Error creating beta codes: ${error.message}`);
  }

  return data.map(code => ({
    ...code,
    remaining_uses: code.max_uses - code.current_uses,
    status: getCodeStatus(code),
  }));
};

/**
 * Get all beta codes with their stats
 */
export const getAllBetaCodes = async (): Promise<BetaCodeInfo[]> => {
  const { data, error } = await supabase
    .from('beta_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching beta codes: ${error.message}`);
  }

  return data.map(code => ({
    ...code,
    remaining_uses: code.max_uses - code.current_uses,
    status: getCodeStatus(code),
  }));
};

/**
 * Get beta code statistics
 */
export const getBetaCodeStats = async () => {
  const { data, error } = await supabase
    .from('beta_code_stats')
    .select('*');

  if (error) {
    throw new Error(`Error fetching beta code stats: ${error.message}`);
  }

  const total = data.length;
  const active = data.filter(code => code.status === 'Active').length;
  const expired = data.filter(code => code.status === 'Expired').length;
  const totalUses = data.reduce((sum, code) => sum + code.current_uses, 0);
  const totalCapacity = data.reduce((sum, code) => sum + code.max_uses, 0);

  return {
    total,
    active,
    expired,
    totalUses,
    totalCapacity,
    utilizationRate: totalCapacity > 0 ? (totalUses / totalCapacity) * 100 : 0,
    codes: data,
  };
};

/**
 * Deactivate a beta code
 */
export const deactivateBetaCode = async (codeId: string): Promise<void> => {
  const { error } = await supabase
    .from('beta_codes')
    .update({ is_active: false })
    .eq('id', codeId);

  if (error) {
    throw new Error(`Error deactivating beta code: ${error.message}`);
  }
};

/**
 * Reactivate a beta code
 */
export const reactivateBetaCode = async (codeId: string): Promise<void> => {
  const { error } = await supabase
    .from('beta_codes')
    .update({ is_active: true })
    .eq('id', codeId);

  if (error) {
    throw new Error(`Error reactivating beta code: ${error.message}`);
  }
};

/**
 * Generate random beta codes
 */
export const generateRandomCodes = (count: number, prefix = 'BRIEF'): string[] => {
  const codes: string[] = [];
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  
  for (let i = 0; i < count; i++) {
    let code = prefix;
    for (let j = 0; j < 6; j++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    codes.push(code);
  }
  
  return codes;
};

/**
 * Batch create codes with generated names
 */
export const createRandomBetaCodes = async (
  count: number, 
  maxUses = 1, 
  expiresAt?: Date, 
  prefix = 'BRIEF'
): Promise<BetaCodeInfo[]> => {
  const codes = generateRandomCodes(count, prefix);
  const codeData = codes.map(code => ({
    code,
    maxUses,
    expiresAt,
  }));
  
  return await createBulkBetaCodes(codeData);
};

/**
 * Helper function to determine code status
 */
function getCodeStatus(code: any): 'active' | 'expired' | 'exhausted' {
  if (!code.is_active) return 'exhausted';
  if (code.current_uses >= code.max_uses) return 'exhausted';
  if (code.expires_at && new Date(code.expires_at) < new Date()) return 'expired';
  return 'active';
}

/**
 * Quick setup function - creates initial beta codes for testing
 */
export const setupInitialBetaCodes = async () => {
  const initialCodes: BetaCodeCreate[] = [
    {
      code: 'BRIEFBOY2024',
      maxUses: 10,
      expiresAt: new Date('2024-12-31'),
    },
    {
      code: 'EARLYBIRD',
      maxUses: 5,
      expiresAt: new Date('2024-06-30'),
    },
    {
      code: 'BETATEST',
      maxUses: 20,
      // No expiration date
    },
    {
      code: 'DEMO123',
      maxUses: 1,
      expiresAt: new Date('2024-12-31'),
    },
  ];

  try {
    const createdCodes = await createBulkBetaCodes(initialCodes);
    console.log('Initial beta codes created:', createdCodes);
    return createdCodes;
  } catch (error: any) {
    // Codes might already exist, that's ok
    if (error.message?.includes('duplicate key')) {
      console.log('Initial beta codes already exist');
      return [];
    }
    throw error;
  }
};