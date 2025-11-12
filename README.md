# NeuroAccess — Monorepo

This repository (NeuroAccess) is a monorepo containing several frontend applications and shared libraries focused on AI demos, prompt galleries, and dataset visualizations. Each package can be developed independently and built into static assets that the included `server.js` serves for a unified deployment.

This README is a consolidated reference. For package-specific details, see each package's README: `Neuroaicomparison/`, `Neuropromptgallery/`, `Neurovault/`.

## Quick overview

/NeuroAccess
- Neuroaicomparison — multi-model chat playground (Next.js App Router + TypeScript). Uses Supabase for auth and persistence.
- Neuropromptgallery — prompt gallery and examples (Vite + React).
- Neurovault — dataset viewer / visualizations (Vite + React).
- server.js # Express static server
- package.json # Root-level dependencies

## 🧰 Tech Stack
- **Frameworks:** Next.js, Vite, React, TypeScript  
- **Backend & Auth:** Supabase  
- **Server:** Node.js (Express static server)  
- **Versioning:** Monorepo (NPM Workspaces)


## Common quick start (PowerShell)

Install root-level deps and run a package locally:

```powershell
npm install
# run one package at a time
cd Neurovault; npm run dev
# in a separate shell
cd ..\Neuropromptgallery; npm run dev
# in another shell
cd ..\Neuroaicomparison; npm run dev
```

## Build and serve (using `node server.js`)

To produce production builds for all packages and serve them via the included `server.js`:

```powershell
npm install
npm run build

### Example `.env`

# optionally set env vars used by server.js (PORT, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GITHUB_TOKEN, etc.)
$env:PORT = '3000'
$env:NEXT_PUBLIC_SUPABASE_URL = 'https://your-supabase-url'
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key'


### Supabase Client 'supabaseClient.js'

import { createClient, SupabaseClient } from '@supabase/supabase-js'
{const SUPABASE_URL = ""
const SUPABASE_ANON_KEY = ""} //optional and not recommended for production but will solve the .env loading issue.
// Create and export the client
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export default supabase

### Running Command 

node server.js
# open http://localhost:3000
```

Notes:
- `server.js` serves the root build at `/` and sub-app builds at `/neurovault`, `/neuropromptgallery`, and `/neuroaicomparison`.
- Set provider keys and Supabase env vars before running if you rely on authentication or remote model providers.

## Per-package features and DB tables

- Neuroaicomparison
	- Features: multi-provider model comparison UI, model catalog, web-search toggle, image attachments, conversation sharing and persistence.
	- Server APIs: prompt enhancement (`/api/enhance-prompt`), open-provider proxy (`/api/open-provider`), GitHub stars (`/api/github/stars`), metrics ingestion (`/api/metrics`), Supabase auth callback (`/auth/callback`).
	- DB tables (Supabase): `public.chats`, `public.messages`, `public.profiles` (see package README for full SQL).

- Neuropromptgallery
	- Features: browse/save prompts, interactive examples that send prompts to configured providers, categories/tags search.
	- DB tables (Supabase): `public.prompts`, `public.user_saved_prompts`.

- Neurovault
	- Features: dataset listing and visualization, carousel and chart components, static assets support for datasets.

## Contributing

1. Fork and clone.
2. Create a branch (e.g., `feat/...` or `fix/...`).
3. Run the package(s) locally and add tests/linting when relevant.
4. Open a PR with a description and testing notes.

Thank you for contributing to NeuroAccess!
