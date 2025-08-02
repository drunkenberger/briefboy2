# Configuración de Supabase para BriefBoy

## 📋 Resumen

Este documento explica cómo configurar la base de datos de Supabase para el sistema de guardado de briefs de BriefBoy.

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. Anota la URL del proyecto y la clave anónima (ya las tienes en tu `.env`)

### 2. Ejecutar el Script SQL

1. Ve a la sección **SQL Editor** en tu dashboard de Supabase
2. Crea una nueva query
3. **IMPORTANTE**: Copia y pega el contenido del archivo `supabase/migrations/create_briefs_table_fixed.sql` (versión corregida)
4. Ejecuta el script

**Nota**: Si obtuviste el error `"brief_stats" is not a table`, usa la versión `_fixed.sql` que corrige el problema con las políticas RLS en vistas.

### 3. Verificar la Configuración

Después de ejecutar el script, deberías ver:

#### Tabla `briefs`:
```sql
SELECT * FROM briefs LIMIT 5;
```

#### Políticas RLS activas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'briefs';
```

#### Vista de estadísticas:
```sql
SELECT * FROM brief_stats LIMIT 5;
```

## 🔧 Características Implementadas

### ✅ Tabla de Briefs

- **`id`**: UUID único generado automáticamente
- **`user_id`**: Referencia al usuario autenticado
- **`title`**: Título del brief (requerido)
- **`transcription`**: Transcripción del audio (opcional)
- **`brief_data`**: Contenido completo del brief en formato JSONB
- **`audio_url`**: URL del archivo de audio (opcional)
- **`status`**: Estado del brief (draft, completed, archived)
- **`created_at`** / **`updated_at`**: Timestamps automáticos

### ✅ Seguridad (Row Level Security)

- Los usuarios solo pueden ver sus propios briefs
- Los usuarios solo pueden crear, editar y eliminar sus propios briefs
- Políticas automáticas basadas en `auth.uid()`

### ✅ Índices Optimizados

- Índice por `user_id` para consultas rápidas
- Índice por `created_at` para ordenamiento
- Índice por `status` para filtrado
- Índice de búsqueda full-text en títulos (español)

### ✅ Funcionalidades Automáticas

- **Auto-update de `updated_at`**: Trigger que actualiza automáticamente
- **Vista de estadísticas**: `brief_stats` con conteos por usuario
- **Validaciones**: Restricciones en longitud de título y valores de status

## 🔄 Funcionalidades de la App

### Auto-guardado
- Los briefs se guardan automáticamente en Supabase cuando el usuario está autenticado
- Fallback a almacenamiento local si no hay conexión
- Migración automática de briefs locales a Supabase al iniciar sesión

### Gestión de Briefs
- **Crear**: Briefs se marcan como 'draft' en auto-save, 'completed' en guardado manual
- **Leer**: Lista todos los briefs del usuario ordenados por fecha
- **Actualizar**: Edición de título, transcripción y estado
- **Eliminar**: Eliminación individual o en lote

### Estados de Brief
- **`draft`**: Brief guardado automáticamente, en progreso
- **`completed`**: Brief terminado y guardado manualmente
- **`archived`**: Brief archivado para referencia

## 🚨 Solución de Problemas

### Error: "relation briefs does not exist"
```sql
-- Verificar que la tabla existe
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'briefs';
```

### Error: "RLS policy violation"
```sql
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'briefs';

-- Verificar que el usuario está autenticado
SELECT auth.uid();
```

### Error: "JSON invalid"
```sql
-- Verificar estructura de brief_data
SELECT brief_data FROM briefs LIMIT 1;
```

## 📊 Queries Útiles

### Ver todos los briefs de un usuario:
```sql
SELECT * FROM briefs 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### Estadísticas de usuario:
```sql
SELECT * FROM brief_stats 
WHERE user_id = auth.uid();
```

### Búsqueda por título:
```sql
SELECT * FROM briefs 
WHERE user_id = auth.uid() 
AND to_tsvector('spanish', title) @@ to_tsquery('spanish', 'marketing');
```

### Briefs por estado:
```sql
SELECT status, COUNT(*) 
FROM briefs 
WHERE user_id = auth.uid() 
GROUP BY status;
```

## 🔗 Recursos Adicionales

- [Documentación de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Documentación de PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [Documentación de Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)

## ✅ Checklist de Configuración

- [ ] Proyecto de Supabase creado
- [ ] Script SQL ejecutado sin errores
- [ ] Tabla `briefs` creada
- [ ] Políticas RLS configuradas
- [ ] Vista `brief_stats` disponible
- [ ] Variables de entorno configuradas en `.env`
- [ ] App conectada y funcionando

---

Una vez completada la configuración, tu app de BriefBoy podrá guardar y sincronizar briefs en la nube automáticamente! 🎉