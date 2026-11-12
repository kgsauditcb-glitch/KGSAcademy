export const instant = false;

import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';
import { SessionRow } from '@/components/SessionRow';
import { EnquiryForm } from '@/components/EnquiryForm';
import {
  getFeaturedCourses,
  getUpcomingSessions,
  getStandards,
  isSupabaseConfigured,
} from '@/lib/data';

export default async function Home() {
  const [courses, sessions, standards] = await Promise.all([
    getFeaturedCourses(),
    getUpcomingSessions(5),
    getStandards(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 via-violet-950 to-violet-700 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-violet-200">
              Professional learning • Live & classroom
            </p>
            <h1 className="mt-3 text-5xl font-black leading-[1.05] tracking-tight">
              Find the right course. At the right time.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-200">
              Auditor and management-system training from KGS Academy — ISO 9001,
              ISO 14001, ISO 45001, ESG and more.
            </p>
            <div className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-1.5">
              <input
                placeholder="What do you want to learn? e.g. Internal Audit, ISO 9001, ESG…"
                className="flex-1 rounded-xl px-4 py-3 text-sm text-slate-900 outline-none"
              />
              <Link
                href="/courses"
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700"
              >
                Explore courses
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
            <h3 className="font-bold">Academy at a glance</h3>
            <div className="mt-4 divide-y divide-white/10 text-sm">
              <div className="flex justify-between py-3"><span>Courses & programmes</span><b>{courses.length || '—'}</b></div>
              <div className="flex justify-between py-3"><span>Upcoming sessions</span><b>{sessions.length || '—'}</b></div>
              <div className="flex justify-between py-3"><span>Standards covered</span><b>{standards.length || '—'}</b></div>
              <div className="flex justify-between py-3"><span>Delivery modes</span><b>Classroom • Live Online</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's sessions */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">What&apos;s happening</h2>
            <p className="mt-1 text-slate-600">Upcoming sessions across the academy.</p>
          </div>
          <Link href="/calendar" className="text-sm font-bold text-violet-600 hover:underline">
            View full calendar →
          </Link>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          {sessions.length === 0 ? (
            <EmptyState
              title={isSupabaseConfigured() ? 'No upcoming sessions' : 'Connect Supabase to load live data'}
              hint={isSupabaseConfigured() ? 'Check back soon or browse all courses.' : 'Copy .env.example to .env.local and run the migration.'}
            />
          ) : (
            sessions.map((s) => (
              <SessionRow
                key={s.id}
                session={s}
                courseTitle={s.courses?.title}
                courseSlug={s.courses?.slug}
              />
            ))
          )}
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Explore the Academy</h2>
            <p className="mt-1 text-slate-600">Featured courses from the catalogue.</p>
          </div>
          <Link href="/courses" className="text-sm font-bold text-violet-600 hover:underline">
            View all courses →
          </Link>
        </div>
        {courses.length === 0 ? (
          <EmptyState
            title={isSupabaseConfigured() ? 'No courses published yet' : 'Connect Supabase to load the catalogue'}
            hint={isSupabaseConfigured() ? undefined : 'Copy .env.example to .env.local, run supabase/migrations, then restart dev.'}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Standards */}
      {standards.length > 0 && (
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl font-black tracking-tight">Browse by standard</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {standards.map((s) => (
                <Link
                  key={s.id}
                  href={`/courses?standard=${s.slug}`}
                  className="rounded-2xl border border-slate-200 p-5 hover:border-violet-400 hover:shadow-sm"
                >
                  <p className="font-extrabold">{s.code}</p>
                  <p className="mt-1 text-sm text-slate-600">{s.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Enquiry */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Talk to us</h2>
            <p className="mt-3 text-slate-600">
              Individual enrolment, corporate group training or a custom programme —
              send us an enquiry and we will get back to you.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <p className="font-bold text-slate-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
    </div>
  );
}
