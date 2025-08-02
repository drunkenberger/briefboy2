# Token Tracking Implementation Guide

## Overview

This document explains the complete token tracking system implemented in BriefBoy to monitor API usage and costs across all AI services (OpenAI, Claude, Gemini).

## Database Schema Changes

### New Columns Added to `briefs` Table

```sql
-- Add token tracking columns to briefs table
ALTER TABLE public.briefs 
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 4) DEFAULT 0;
```

**Column Descriptions:**
- `tokens_used`: Total number of tokens consumed for this brief
- `tokens_breakdown`: JSON object with detailed breakdown by service
- `estimated_cost`: Estimated cost in USD based on current API pricing

### Example `tokens_breakdown` Structure

```json
{
  "whisper_transcription": 1500,
  "gpt4_generation": 3200,
  "gpt4_improvements": 2100,
  "gpt4_analysis": 1800,
  "claude_chat": 1500,
  "total": 10100
}
```

## Core Components

### 1. Token Tracking Hook (`useTokenTracking.ts`)

**Features:**
- Real-time token counting using GPT-3 encoder
- Support for multiple AI models with different pricing
- Automatic cost calculation based on current API rates
- Session tracking and breakdown by service

**Usage:**
```typescript
const { 
  countTokens, 
  trackTokenUsage, 
  calculateCost,
  currentSessionTokens,
  totalEstimatedCost 
} = useTokenTracking();

// Count tokens in text
const tokens = countTokens("Your text here");

// Track API usage
trackTokenUsage({
  service: 'gpt4_generation',
  model: 'gpt-4o-mini',
  input_tokens: 1200,
  output_tokens: 800,
  total_tokens: 2000,
  estimated_cost: 0.003
});
```

### 2. Enhanced API Hooks

#### `useWhisperTranscriptionWithTokens.ts`
- Tracks audio duration and estimates tokens
- Calculates Whisper API costs
- Returns token usage alongside transcription

#### `useBriefGenerationWithTokens.ts`
- Monitors token usage across OpenAI, Claude, and Gemini
- Extracts actual usage from API responses
- Provides fallback estimation for non-OpenAI services

### 3. Database Integration

#### Updated `useIntegratedBriefStorage.ts`
- Saves token data when creating/updating briefs
- Supports both auto-save and manual save operations
- Includes token information in Supabase operations

**New Parameters:**
```typescript
autoSaveBrief(
  briefData: any, 
  transcription?: string, 
  audioUri?: string,
  tokensUsed?: number,
  tokensBreakdown?: Record<string, number>,
  estimatedCost?: number
)
```

### 4. UI Components

#### `TokenUsageDisplay.tsx`
- Shows token usage and cost information
- Compact mode for list views
- Detailed breakdown for individual briefs
- Responsive formatting for different token amounts

#### Updated `SavedBriefsList.tsx`
- Displays compact token usage for Supabase briefs
- Shows cost information alongside brief details
- Only appears when token data is available

## Current Pricing Support (per 1K tokens)

| Model | Input Cost | Output Cost |
|-------|------------|-------------|
| GPT-4o | $0.005 | $0.015 |
| GPT-4o-mini | $0.00015 | $0.0006 |
| GPT-4-turbo | $0.01 | $0.03 |
| Claude-3-Opus | $0.015 | $0.075 |
| Claude-3-Haiku | $0.00025 | $0.00125 |
| Gemini-1.5-Flash | $0.00025 | $0.001 |
| Whisper | $0.006 | N/A |

## Implementation Steps

### 1. Run Database Migration
```sql
-- Execute the migration script
\i supabase/migrations/add_token_tracking_to_briefs.sql
```

### 2. Update Main App Hook Usage

Replace existing hooks in `app/(tabs)/index.tsx`:

```typescript
// Old
import { useWhisperTranscription } from '../../hooks/useWhisperTranscription';
import { useBriefGeneration } from '../../hooks/useBriefGeneration';

// New
import { useWhisperTranscriptionWithTokens } from '../../hooks/useWhisperTranscriptionWithTokens';
import { useBriefGenerationWithTokens } from '../../hooks/useBriefGenerationWithTokens';
```

### 3. Update Auto-Save Integration

```typescript
// In the auto-save effect
const briefId = await autoSaveBrief(
  brief, 
  transcription, 
  audioUri,
  tokensUsed,
  tokensBreakdown,
  estimatedCost
);
```

### 4. Enable Token Display

The `SavedBriefsList` component automatically shows token usage for briefs with token data. No additional configuration needed.

## Monitoring and Analytics

### Session Tracking
- Track total tokens and costs per user session
- Monitor which services consume the most tokens
- Identify expensive operations for optimization

### Cost Management
- Set up alerts for high token usage
- Monitor daily/monthly spending trends
- Optimize prompts based on token consumption data

### Database Queries

**Get total tokens by user:**
```sql
SELECT user_id, SUM(tokens_used) as total_tokens, SUM(estimated_cost) as total_cost
FROM briefs 
GROUP BY user_id 
ORDER BY total_cost DESC;
```

**Get most expensive services:**
```sql
SELECT 
  service_data.key as service,
  AVG((service_data.value)::int) as avg_tokens
FROM briefs,
     LATERAL jsonb_each(tokens_breakdown) as service_data(key, value)
WHERE tokens_breakdown != '{}'
  AND service_data.value IS NOT NULL
  AND service_data.value::text ~ '^\d+$'  -- Ensure value is numeric
GROUP BY service_data.key 
ORDER BY avg_tokens DESC;
```

## Future Enhancements

1. **Real-time Cost Alerts**: Notify users when approaching spending limits
2. **Token Usage Analytics**: Dashboard showing usage patterns and trends
3. **Optimization Suggestions**: Recommend ways to reduce token consumption
4. **Budget Controls**: Set spending limits per user or organization
5. **API Rate Limiting**: Prevent excessive usage based on token budgets

## Testing

1. **Generate a new brief** and verify token tracking appears
2. **Check the database** to confirm tokens_used, tokens_breakdown, and estimated_cost are populated
3. **View saved briefs** to see token usage display in the UI
4. **Monitor console logs** for detailed token tracking information

## Troubleshooting

**Issue**: Token counts seem too high/low
- **Solution**: Check token counting logic and API response parsing

**Issue**: Costs don't match expected rates
- **Solution**: Verify pricing table in `useTokenTracking.ts`

**Issue**: Token data not saving to database
- **Solution**: Check Supabase table schema and RLS policies

**Issue**: UI not showing token information
- **Solution**: Ensure briefs have token data and check component props