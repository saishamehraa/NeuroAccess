 'use client'

import { createClient } from '@supabase/supabase-js'

// Mirror the NeuroVault approach: support NEXT_PUBLIC_ envs and provide
// explicit fallbacks so local dev works without editing many files.
const FALLBACK_SUPABASE_URL = 'https://vlbuwyelhardsrhrprym.supabase.co'
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsYnV3eWVsaGFyZHNyaHJwcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzOTQxOTcsImV4cCI6MjA3NDk3MDE5N30.8Sjnj5k7q3y0J7aSx5LEOB888Y0T0cXTpoOK1IZTj-I'

const meta: any = typeof import.meta !== 'undefined' ? (import.meta as any).env ?? {} : {}
const SUPABASE_URL = meta.NEXT_PUBLIC_SUPABASE_URL || meta.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? (process.env as any).NEXT_PUBLIC_SUPABASE_URL : undefined) || FALLBACK_SUPABASE_URL
const SUPABASE_ANON_KEY = meta.NEXT_PUBLIC_SUPABASE_ANON_KEY || meta.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? (process.env as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined) || FALLBACK_SUPABASE_ANON_KEY

function createStubClient() {
  // Provides a readable error only when the client is actually used.
  const msg = '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Configure your environment variables (e.g., in .env.local or Vercel Project Settings).'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({}, {
    get() {
      throw new Error(msg)
    },
    apply() {
      throw new Error(msg)
    },
  }) as any
}

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local or Vercel Project Settings.')
}

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createStubClient()
