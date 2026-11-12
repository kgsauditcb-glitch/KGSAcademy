# KGS Academy

Course discovery platform and admin panel for KGS Academy — auditor and
management-system training (ISO 9001, ISO 14001, ISO 45001, ESG & more).

**Stack:** Next.js (App Router, TypeScript, Tailwind) · Supabase (Postgres, Auth, Storage, RLS)

## Project structure

```
.
├── docs/
│   └── ROADMAP.md               # Feature roadmap & next steps
├── public/                      # Static assets
├── src/
│   ├── app/
│   │   ├── api/enquiries/       # POST /api/enquiries — enquiry submissions
│   │   ├── admin/
│   │   │   ├── login/           # Admin sign-in (Supabase Auth)
│   │   │   └── (dashboard)/     # Protected admin area (RLS: role = 'admin')
│   │   │       ├── courses/     # Course list (CRUD TODO)
│   │   │       ├── sessions/    # Session list (CRUD TODO)
│   │   │       └── enquiries/   # Enquiry inbox
│   │   ├── calendar/            # Session calendar
│   │   ├── courses/             # Course catalogue + [slug] detail
│   │   ├── enquiry/             # Public enquiry form
│   │   ├── standards/           # Browse by standard
│   │   ├── layout.tsx           # Header/footer shell
│   │   └── page.tsx             # Homepage
│   ├── components/              # CourseCard, SessionRow, EnquiryForm, …
│   ├── lib/
│   │   ├── data.ts              # Server-side Supabase queries
│   │   └── supabase/            # client.ts / server.ts / admin.ts factories
│   ├── middleware.ts            # Session refresh + /admin route guard
│   └── types/database.ts        # Row types (regenerate with supabase gen types)
├── supabase/
│   ├── migrations/0001_init.sql # Full schema + RLS + storage buckets
│   └── seed.sql                 # Sample catalogue data
├── .env.example                 # Required environment variables
└── package.json
```

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Note your **project URL** and **anon key** (Project Settings → API).

### 3. Apply the database schema

Either via the CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase db reset --linked   # applies migrations + seed.sql
```

Or paste `supabase/migrations/0001_init.sql` and `supabase/seed.sql` into the
Supabase dashboard **SQL Editor** and run them in order.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API).

### 5. Create an admin user

In the Supabase dashboard → **Authentication → Users → Add user** (check
*Auto Confirm User*). Then set their role to admin in the SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel at
`/admin` (requires the admin user above).

## Architecture notes

- **RLS-first:** all data access goes through Supabase with Row Level
  Security. Public users can only read `published` courses/sessions and
  insert enquiries. Admins (role in `profiles`) get full access.
- **Three Supabase clients** in `src/lib/supabase/`:
  - `client.ts` — browser (anon key, respects RLS)
  - `server.ts` — Server Components / Route Handlers (session-aware)
  - `admin.ts` — service role, **server-only**, bypasses RLS
- **Middleware** (`src/middleware.ts`) refreshes the auth session on every
  request and redirects unauthenticated users away from `/admin`.
- **Storage buckets** created by the migration: `course-materials`,
  `session-documents`, `course-thumbnails`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx supabase gen types typescript --project-id <ref> > src/types/database.ts` | Regenerate DB types |
