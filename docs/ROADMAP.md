# KGS Academy — Roadmap

Current state: project scaffold with Supabase schema, auth guard, public
catalogue pages and read-only admin views. Everything below is planned work.

## Phase 1 — Admin CRUD (make the panel functional)

- [ ] Course create/edit forms (`/admin/courses/new`, `/admin/courses/[id]/edit`)
  - Server Actions or Route Handlers calling Supabase with the session client
  - Slug auto-generation, image upload to `course-thumbnails` bucket
  - Publish/draft/archive status control
- [ ] Session management
  - Create/edit sessions per course, capacity & seat counts
  - Status transitions: scheduled → open → full → completed
- [ ] Enquiry workflow
  - Status updates (new → in_progress → converted → closed)
  - Internal notes column on `enquiries` (add migration)
  - Optional email notification on new enquiry (Supabase Edge Function + Resend/SES)

## Phase 2 — Public experience

- [ ] Course detail page polish: syllabus, trainer info, downloadable materials
  from `course-materials` bucket
- [ ] Search with debounced input hitting `courses` full-text search
  (add a `tsvector` column + GIN index via migration)
- [ ] Filters UI on `/courses` (mode, location, date range)
- [ ] "Register interest" per session → creates an `enquiries` row with
  `course_interest` prefilled, or a proper `bookings` table if self-serve
  registration is wanted
- [ ] Student/trainer roles: extend `profiles.role` usage, add
  `/dashboard` for logged-in students

## Phase 3 — Operations

- [ ] Payments (Razorpay/Stripe) for course fees — webhook → booking status
- [ ] Email templates (welcome, session reminder, certificate issued)
- [ ] CSV export of enquiries/sessions for the admin team
- [ ] Audit log table for admin actions
- [ ] Role-based access: `staff` role for non-admin operators (view enquiries,
  manage sessions but not users)

## Phase 4 — Quality & launch

- [ ] Regenerate `src/types/database.ts` from the live project
  (`npx supabase gen types typescript`)
- [ ] E2E tests (Playwright): enquiry submit, admin login, course CRUD
- [ ] CI: typecheck + lint + build on push (GitHub Actions)
- [ ] Deploy to Vercel; set env vars in project settings
- [ ] Custom domain + SSL

## Schema additions likely needed

- `enquiries.internal_notes text`
- `bookings` table (user_id, session_id, status, payment_id) if self-serve
  registration is added
- `course_materials` table or metadata column for files in `course-materials`
- `audit_log` table (actor_id, action, entity, entity_id, created_at)
