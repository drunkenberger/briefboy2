-- Crear tabla de briefs
CREATE TABLE IF NOT EXISTS public.briefs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    transcription TEXT,
    brief_data JSONB NOT NULL,
    audio_url TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para mejorar rendimiento
    CONSTRAINT briefs_title_length CHECK (length(title) >= 1 AND length(title) <= 500),
    CONSTRAINT briefs_status_valid CHECK (status IN ('draft', 'completed', 'archived'))
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS briefs_user_id_idx ON public.briefs(user_id);
CREATE INDEX IF NOT EXISTS briefs_created_at_idx ON public.briefs(created_at DESC);
CREATE INDEX IF NOT EXISTS briefs_status_idx ON public.briefs(status);
CREATE INDEX IF NOT EXISTS briefs_title_search_idx ON public.briefs USING gin(to_tsvector('spanish', title));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_briefs_updated_at 
    BEFORE UPDATE ON public.briefs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios briefs
CREATE POLICY "Users can view their own briefs" 
    ON public.briefs 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propios briefs
CREATE POLICY "Users can insert their own briefs" 
    ON public.briefs 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propios briefs
CREATE POLICY "Users can update their own briefs" 
    ON public.briefs 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propios briefs
CREATE POLICY "Users can delete their own briefs" 
    ON public.briefs 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Crear vista para estadísticas de briefs (opcional)
CREATE OR REPLACE VIEW public.brief_stats AS
SELECT 
    user_id,
    COUNT(*) as total_briefs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_briefs,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_briefs,
    MAX(created_at) as last_brief_created,
    MIN(created_at) as first_brief_created
FROM public.briefs
WHERE user_id = auth.uid()  -- Filtrar directamente en la vista por seguridad
GROUP BY user_id;

-- Nota: Las vistas no pueden tener políticas RLS, pero la seguridad está garantizada
-- porque la vista filtra por auth.uid() y la tabla base tiene RLS habilitado