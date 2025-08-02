import { SavedBrief as LocalSavedBrief } from '../hooks/useBriefStorage';
import { DatabaseBrief, BriefData } from './brief';

/**
 * Unified type for handling both local and Supabase briefs throughout the application
 * This replaces the use of 'any' and provides proper type safety
 */
export type UnifiedBrief = LocalSavedBrief | DatabaseBrief;

/**
 * Type guards to distinguish between brief types at runtime
 */
export const isLocalBrief = (brief: UnifiedBrief): brief is LocalSavedBrief => {
  return 'createdAt' in brief && 'updatedAt' in brief && !('created_at' in brief);
};

export const isDatabaseBrief = (brief: UnifiedBrief): brief is DatabaseBrief => {
  return 'created_at' in brief && 'updated_at' in brief && 'user_id' in brief;
};

/**
 * Helper functions to access common properties regardless of brief type
 */
export const getBriefId = (brief: UnifiedBrief): string => {
  return brief.id;
};

export const getBriefTitle = (brief: UnifiedBrief): string => {
  return brief.title;
};

export const getBriefCreatedAt = (brief: UnifiedBrief): string => {
  return isLocalBrief(brief) ? brief.createdAt : brief.created_at;
};

export const getBriefUpdatedAt = (brief: UnifiedBrief): string => {
  return isLocalBrief(brief) ? brief.updatedAt : brief.updated_at;
};

export const getBriefTranscription = (brief: UnifiedBrief): string => {
  return isLocalBrief(brief) ? brief.transcription : (brief.transcription || '');
};

export const getBriefData = (brief: UnifiedBrief): BriefData => {
  return isLocalBrief(brief) ? brief.brief : brief.brief_data;
};