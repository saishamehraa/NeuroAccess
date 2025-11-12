# NeuroAccess — AI Comparison App (Neuroaicomparison)

This package is the AI comparison web application inside the NeuroAccess monorepo. It provides a multi-model chat playground where you can switch providers, select multiple models for side-by-side comparisons, enable web-search per message, attach images, and persist/share conversations via Supabase.

## Features (short)

- Multi-provider model support (OpenRouter, Gemini, Ollama, etc.)
- Selectable model catalog — pick multiple models to compare outputs
- Per-message web search toggle
- Image attachments (Gemini)
- Conversation persistence and sharing using Supabase
- Local model / Ollama integration for on-host models

## Tech stack

- Next.js App Router (TypeScript)
- Tailwind CSS
- Supabase (auth + persistence)
- Server helper APIs (see Build & APIs sections)

## Quick start (development)

From the monorepo root (PowerShell):

```powershell
npm install
cd Neuroaicomparison
npm install
npm run dev
# open the configured dev URL (check package.json for exact port)
```

## Environment variables

Set provider and service keys as needed. Typical env vars used by this app:

- `OPENROUTER_API_KEY` — for OpenRouter provider access
- `GEMINI_API_KEY` — for Gemini models (images/web)
- `OLLAMA_URL` or `OLLAMA_HOST` — base URL for Ollama local server
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `NEXT_PUBLIC_BYPASS_AUTH` — set to `1` in development to bypass auth (dev-only)

Copy any `.env.example` to `.env.local` and fill secrets locally.

## Database (Supabase) schema

The app persists chats, messages and profiles in Supabase. Run the SQL below in the Supabase SQL editor to create the recommended schema.

```sql
-- Chats table
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  project_id uuid null,
  title text not null default 'New Chat',
  page_type text not null default 'home',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  owner_id uuid not null,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  model text null,
  content_json jsonb null,
  metadata jsonb null,
  created_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_chats_owner on public.chats(owner_id);
create index if not exists idx_msgs_chat on public.messages(chat_id);
create index if not exists idx_msgs_owner on public.messages(owner_id);

-- Row Level Security (optional; tighten as needed)
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Simple owner-based policies (adjust to your auth strategy)
do $$ begin
  if not exists (
    select 1 from pg_policy where polname = 'chats_owner_policy'
  ) then
    create policy chats_owner_policy on public.chats
      using (owner_id::text = auth.uid()::text)
      with check (owner_id::text = auth.uid()::text);
  end if;

  if not exists (
    select 1 from pg_policy where polname = 'messages_owner_policy'
  ) then
    create policy messages_owner_policy on public.messages
      using (owner_id::text = auth.uid()::text)
      with check (owner_id::text = auth.uid()::text);
  end if;
end $$;
```

Below is a more explicit SQL schema (equivalent) including prompts and profile tables if you want exact types and indexes:

```sql
create table public.chats (
  id uuid not null default gen_random_uuid (),
  owner_id uuid not null,
  project_id uuid null,
  title text not null default 'New Chat'::text,
  page_type text not null default 'home'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint chats_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_chats_owner on public.chats using btree (owner_id) TABLESPACE pg_default;

create table public.messages (
  id uuid not null default gen_random_uuid (),
  chat_id uuid not null,
  owner_id uuid not null,
  role text not null,
  content text not null,
  model text null,
  content_json jsonb null,
  metadata jsonb null,
  created_at timestamp with time zone not null default now(),
  constraint messages_pkey primary key (id),
  constraint messages_chat_id_fkey foreign KEY (chat_id) references chats (id) on delete CASCADE,
  constraint messages_role_check check (
    (
      role = any (
        array['system'::text, 'user'::text, 'assistant'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_msgs_chat on public.messages using btree (chat_id) TABLESPACE pg_default;

create index IF not exists idx_msgs_owner on public.messages using btree (owner_id) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  email text null,
  full_name text null,
  avatar_url text null,
  metadata jsonb null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger profiles_set_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION set_updated_at ();

create table public.prompts (
  id character varying(255) not null,
  text text null,
  fullprompt text null,
  category character varying(255) null,
  tags character varying(255) null,
  color character varying(255) null,
  difficulty character varying(255) null,
  usecase text null,
  owner_id uuid null,
  constraint prompts_pkey primary key (id),
  constraint prompts_owner_id_fkey foreign KEY (owner_id) references auth.users (id)
) TABLESPACE pg_default;

create table public.user_saved_prompts (
  user_id uuid not null,
  prompt_id character varying(255) not null,
  created_at timestamp with time zone null default now(),
  constraint user_saved_prompts_pkey primary key (user_id, prompt_id),
  constraint user_saved_prompts_prompt_id_fkey foreign KEY (prompt_id) references prompts (id) on delete CASCADE,
  constraint user_saved_prompts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
```

> Note: the `set_updated_at()` trigger function referenced above must exist in your DB. If it doesn't, add a simple function to update `updated_at` on row updates.

## Server APIs (light overview)

The repo includes a small Node server (`server.js`) that serves the static builds and exposes minimal APIs used by the apps:

- `GET /api/github/stars` — returns GitHub star count for repo
- `GET /auth/callback` — handles Supabase auth redirect exchange
- `POST /api/metrics` — metrics ingestion endpoint (no-op by default)
- `POST /api/enhance-prompt` — prompt enhancement helper
- `POST /api/open-provider` — proxy/normalizer for provider requests (text, image, audio handlers)

## Build & serve (production)

To build static outputs and serve them with the included server:

```powershell
npm install
npm run build
# optionally set env vars
$env:PORT = '3000'
$env:NEXT_PUBLIC_SUPABASE_URL = 'https://your-supabase-url'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key'
node server.js
# open http://localhost:3000/neuroaicomparison
```

## Bypass auth (development only)

To develop without signing in, you can enable the bypass:

```powershell
# in .env.local
NEXT_PUBLIC_BYPASS_AUTH=1
```

This sets a mock user and disables the Supabase auth listener (only when `NODE_ENV !== 'production'`).

## Troubleshooting

- If Supabase fails during build, ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set for preview or production builds.
- For RLS errors, confirm the policies created above are present and the `owner_id` value matches `auth.uid()` for inserts.
- If `set_updated_at()` is missing, create a small trigger function to update timestamps.

## Contributing

- Fork and open a PR against the monorepo.
- Keep UI changes isolated and include screenshots and testing steps.
- Run `npm run lint` and ensure `npm run build` succeeds for the package you modified.

---

If you'd like, I can also:
- Add a `db/` folder with these SQL files as migrations and scaffold a `npm run db:migrate` script.
- Add the `set_updated_at()` function SQL to this README or to a `db/functions.sql` file.

