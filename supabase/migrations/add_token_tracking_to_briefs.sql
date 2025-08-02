-- Add token tracking columns to briefs table
ALTER TABLE public.briefs 
ADD COLUMN IF NOT EXISTS tokens_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tokens_breakdown JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10, 4) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.briefs.tokens_used IS 'Total number of tokens used for this brief across all API calls';
COMMENT ON COLUMN public.briefs.tokens_breakdown IS 'Detailed breakdown of token usage by service/step';
COMMENT ON COLUMN public.briefs.estimated_cost IS 'Estimated cost in USD based on token usage';

-- Create an index for querying by token usage
CREATE INDEX IF NOT EXISTS idx_briefs_tokens_used ON public.briefs(tokens_used);

-- Example of tokens_breakdown structure:
-- {
--   "whisper_transcription": 1500,
--   "gpt4_generation": 3200,
--   "gpt4_improvements": 2100,
--   "gpt4_analysis": 1800,
--   "claude_chat": 1500,
--   "total": 10100
-- }