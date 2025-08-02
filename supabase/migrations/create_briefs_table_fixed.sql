-- Script corregido para crear la tabla de briefs
-- Ejecutar este script completo en el SQL Editor de Supabase

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
    
    -- Restricciones
    CONSTRAINT briefs_title_length CHECK (length(title) >= 1 AND length(title) <= 500)
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
DROP TRIGGER IF EXISTS update_briefs_updated_at ON public.briefs;
CREATE TRIGGER update_briefs_updated_at 
    BEFORE UPDATE ON public.briefs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes si las hay
DROP POLICY IF EXISTS "Users can view their own briefs" ON public.briefs;
DROP POLICY IF EXISTS "Users can insert their own briefs" ON public.briefs;
DROP POLICY IF EXISTS "Users can update their own briefs" ON public.briefs;
DROP POLICY IF EXISTS "Users can delete their own briefs" ON public.briefs;

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

-- Crear vista para estadísticas de briefs (segura)
DROP VIEW IF EXISTS public.brief_stats;
CREATE VIEW public.brief_stats AS
SELECT 
    user_id,
    COUNT(*) as total_briefs,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_briefs,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_briefs,
    MAX(created_at) as last_brief_created,
    MIN(created_at) as first_brief_created
FROM public.briefs
WHERE user_id = auth.uid()  -- Filtro de seguridad directo en la vista
GROUP BY user_id;

-- Verificación final
DO $$
BEGIN
    -- Verificar que la tabla se creó correctamente
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'briefs' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Tabla briefs creada exitosamente';
    ELSE
        RAISE EXCEPTION '❌ Error: Tabla briefs no fue creada';
    END IF;
    
    -- Verificar que RLS está habilitado
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'briefs' AND rowsecurity = true) THEN
        RAISE NOTICE '✅ Row Level Security habilitado';
    ELSE
        RAISE EXCEPTION '❌ Error: RLS no está habilitado';
    END IF;
    
    -- Verificar políticas
    IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'briefs') THEN
        RAISE NOTICE '✅ Políticas de seguridad creadas';
    ELSE
        RAISE EXCEPTION '❌ Error: Políticas no fueron creadas';
    END IF;
    
    RAISE NOTICE '🎉 Configuración completada exitosamente!';
END
$$;