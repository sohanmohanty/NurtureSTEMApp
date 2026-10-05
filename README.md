# NurtureSTEM Ops

Internal operations platform for NurtureSTEM, a student-led STEM education initiative founded in 2024. High-school volunteers tutor elementary and middle-school students in math and science; this dashboard coordinates student rosters, volunteer tutors, assignments, training, tutoring hours, teaching resources, and aggregate impact reporting.

The app intentionally collects minimal student information: display name, level, subject focus, status, and assignment only. No contact details, addresses, meeting locations, or other sensitive data are stored.

## Domains

- Management platform: [platform.nurturestem.org](https://platform.nurturestem.org)
- Public NurtureSTEM website: [nurturestem.org](https://nurturestem.org)

This repository contains the management platform. The public website is maintained separately. Production URLs are defined in `lib/constants.ts`; internal navigation uses relative paths so local development still works.

## Tech stack

- Next.js (App Router) + TypeScript
- Tailwind CSS with shadcn/ui-style components
- Supabase (Auth + Postgres with row-level security)
- Recharts
- Deploys to Vercel

## Setup

### 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run `supabase/migrations/0001_schema.sql`. This creates all tables, security policies, and the default volunteer training checklist.
3. For local development, in Authentication → Sign In / Providers, consider disabling "Confirm email" so signups can proceed without an email step.

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project's API settings.

In Supabase, under Authentication > URL Configuration, set:

- Site URL: `https://platform.nurturestem.org`
- Redirect URLs: `https://platform.nurturestem.org/login` and `http://localhost:3000/login` (add the actual local port if different).

Signup confirmation emails return to the platform's sign-in page in production and the current local origin during development. If you customized the confirmation email template, ensure its confirmation link uses `{{ .ConfirmationURL }}` rather than a hardcoded old domain. See [Supabase redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls).

### 3. Run

```bash
npm install
npm run dev
```

### 4. Create the founder/admin account

1. Sign up through the app (new accounts default to the volunteer role).
2. In the Supabase SQL Editor, promote your account:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

3. Sign out and back in. The founder account also gets a volunteer tutor profile during setup, so it can be assigned students and log tutoring hours while keeping admin access.

## Roles

- **Admin (founder)** — full access: students, volunteers, assignments, hour approvals, training, resources, reports, settings, plus a personal tutoring dashboard under My Tutoring.
- **Volunteer** — sees only their own assignments, hour logs, training checklist, and the resource library.
- **Advisor** — read-only access to aggregate impact reports; no individual student records.

Role changes are managed by admins under Settings → User roles. Row-level security enforces all access rules in the database, not just in the UI.

## Public impact page

[platform.nurturestem.org/impact](https://platform.nurturestem.org/impact) shows only aggregate numbers (students reached, volunteer tutors, approved hours, subjects supported). It can be toggled and edited under Settings and never exposes names or individual records.

## Deploying to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the Vercel project environment.
4. In the Vercel project's Domains settings, attach `platform.nurturestem.org` to the production environment and complete the DNS setup shown by Vercel.
5. Apply the Supabase authentication URL settings above and deploy.

Vercel Cron calls `/api/keepalive` daily. The GitHub Actions backup calls `https://platform.nurturestem.org/api/keepalive` every six hours.
