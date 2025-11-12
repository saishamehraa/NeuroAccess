import { createClient, SupabaseClient } from '@supabase/supabase-js'

// --- Hard-coded Supabase credentials ---
// This is not recommended for production but will solve the .env loading issue.

const SUPABASE_URL = "https://vlbuwyelhardsrhrprym.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnV3eWVsaGFyZHNyaHJwcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTQxOTcsImV4cCI6MjA3NDk3MDE5N30.8Sjnj5k7q3y0J7aSx5LEOB888Y0T0cXTpoOK1IZTj-I"

// --- End of credentials ---


// Create and export the client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase