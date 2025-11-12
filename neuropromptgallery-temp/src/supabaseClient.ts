// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vlbuwyelhardsrhrprym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnV3eWVsaGFyZHNyaHJwcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTQxOTcsImV4cCI6MjA3NDk3MDE5N30.8Sjnj5k7q3y0J7aSx5LEOB888Y0T0cXTpoOK1IZTj-I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);