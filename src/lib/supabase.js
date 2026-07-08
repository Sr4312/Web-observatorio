import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// ponytail: sin credenciales el sitio corre con el seed local (src/lib/data.js).
// Crear el proyecto Supabase, cargar .env.local y este export deja de ser null.
export const supabase = url && key ? createClient(url, key) : null
