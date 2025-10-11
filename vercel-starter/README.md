# Vercel Starter (Next.js)

Minimal Next.js starter optimized for Vercel deployments.

Getting started:

1. Install dependencies

   npm install

2. Run development server

   npm run dev

3. Build for production

   npm run build

Deploy:

- Push this repository to GitHub and import to Vercel.
- Or install the Vercel CLI and run `vercel` to deploy from your machine.

Detailed deploy steps

1. Deploy via Vercel (GitHub)

   - Commit and push this project to a Git provider (GitHub, GitLab, Bitbucket).
   - On vercel.com click "New Project" → Import from Git repository → select this repo.
   - Configure project (Framework should auto-detect Next.js) and click Deploy.

2. Deploy via Vercel CLI

   - Install Vercel CLI: `npm i -g vercel`
   - From project root run: `vercel` and follow the interactive prompts.

Local checks

- Start dev server: `npm run dev` (open http://localhost:3000)
- Build locally: `npm run build` then `npm start` to run the optimized server.

Next steps

- Add environment variables in Vercel dashboard if needed.
- Connect analytics or add extra routes/api endpoints.

Storage options (local development)

1. Browser-based storage (recommended for client-only data)

   - The app includes a demo page at `/store` which saves and reads data from `localStorage` in the browser.
   - This works in dev and production but is stored per-user in their browser.

2. Local disk persistence (development only)

   - For local development there's a simple API at `/api/local/save` and `/api/local/list` which writes JSON files into a `data/` folder in the project root.
   - Important: Vercel's serverless runtime uses an ephemeral filesystem — writes to disk will not persist across deployments or be shared between instances. The disk-based API is suitable for local testing only.

How to use the demo

- Run `npm run dev` and open http://localhost:3000/store
- Use "Save to localStorage" to keep data in the browser.
- Use "Save to local disk (dev)" to write a JSON file to `data/` and "Load saved items (dev)" to read them.

Shared (multi-user) storage with Supabase

If you want data to be shared between users (persisted server-side), the easiest production-ready option is Supabase.

1. Create a Supabase project at https://app.supabase.com
2. Create a table named `kv` with columns:
   - `id` (uuid, primary key, default: gen_random_uuid())
   - `key` (text)
   - `value` (jsonb)
   - `created_at` (timestamp with time zone, default: now())
3. Get your `SUPABASE_URL` and `SUPABASE_KEY` (anon or service role as needed).
4. In Vercel dashboard (or locally via `.env.local`) set `SUPABASE_URL` and `SUPABASE_KEY`.

When those env vars are present, the API endpoints will send writes to Supabase so saved items are visible to all users.
