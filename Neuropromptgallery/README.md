
  # Moving Prompt Gallery

  NeuroPromptGallery

  ## Running the code

  NeuroAccess — Prompt Gallery
  # NeuroAccess — Prompt Gallery

  This package provides the Prompt Gallery UI used by NeuroAccess. It's a Vite + React app intended for local development (port 3002 by default) and can read/write prompts from Supabase when configured.

  ## Features

  - Browse curated prompts, categories, tags and example outputs
  - Interactive prompt editor: open a prompt, edit, and run it against configured providers
  - Save/unsave prompts per user (requires Supabase)

  ## Quick start (development)

  ```powershell
  npm install
  cd Neuropromptgallery
  npm install
  npm run dev
  # open http://localhost:3002
  ```

  ## Environment variables

  Set provider keys and Supabase variables in `.env` or `.env.local` as needed:

  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

  ## Build & serve (node server.js)

  After building from the repo root (`npm run build`), `server.js` serves this app at `/neuropromptgallery`.

  ```powershell
  npm run build
  $env:PORT = '3000'
  node server.js
  # open http://localhost:3000/neuropromptgallery
  ```

  ## Database tables (prompts)

  If you store prompts in Supabase, the following tables are useful (run in your Supabase SQL editor):

  ```sql
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

  This package can read from and write to these tables when Supabase is configured.
    prompt_id character varying(255) not null,
