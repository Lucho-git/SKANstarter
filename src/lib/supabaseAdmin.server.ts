import { createClient } from '@supabase/supabase-js'
import {
    PUBLIC_SUPABASE_URL,
} from "$env/static/public"
import { PRIVATE_SUPABASE_SERVICE_ROLE } from "$env/static/private"

// Client for server-side operations with elevated privileges
export const supabaseServiceRole = createClient(
    PUBLIC_SUPABASE_URL,
    PRIVATE_SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
)