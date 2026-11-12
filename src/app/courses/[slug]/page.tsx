export const instant = false;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SessionRow } from '@/components/SessionRow';
import { EnquiryForm } from '@/components/EnquiryForm';
import { getCourseBySlug, isSupabaseConfigured } from '@/lib/data';

export async function generateMetadata({ params }: PageProps<'/courses/[slug]'>) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  return { title: course?.title ?? 'Course' };
}

export default async function CourseDetailPage({ params }: PageProps<'/courses/[slug]'>) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    if (!isSupabaseConfigured()) {
      return (
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h1 className="text-3xl font-black">Course not found</h1>
          <p className="mt-3 text-blue-900">
            Supabase is not configured yet — copy .env.example to .env.local and apply the migration.
          </p>
          <Link href="/courses" className="mt-6 inline-block font-bold text-blue-900 hover:text-orange-700 hover:underline">
            ← Back to courses
          </Link>
        </div>
      );
    }
    notFound();
  }

  const sessions = (course.course_sessions ?? [])
    .filter((s) => s.status !== 'cancelled')
    .sort((a, b) => a.start_date.localeCompare(b.start_date));

  const inr = (v: number | null) => (v == null ? null : `₹${v.toLocaleString('en-IN')}`);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <Link href="/courses" className="text-sm font-bold text-blue-900 hover:text-orange-700 hover:underline">
        ← All courses
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_.8fr]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {course.standards && (
              <span className="rounded-md bg-orange-50 px-2 py-1 text-xs font-extrabold text-orange-700">
                {course.standards.code}
              </span>
            )}
            {course.categories && (
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-extrabold text-blue-900">
                {course.categories.name}
              </span>
            )}
          </div>
          <h1 className="mt-3 text-4xl font-black tracking-tight">{course.title}</h1>
          {course.summary && <p className="mt-3 text-lg text-blue-900">{course.summary}</p>}
          {course.description && (
            <p className="mt-6 whitespace-pre-line text-blue-900">{course.description}</p>
          )}

          <h2 className="mt-10 text-2xl font-black">Upcoming sessions</h2>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-6">
            {sessions.length === 0 ? (
              <p className="py-8 text-sm text-blue-900">No sessions scheduled yet.</p>
            ) : (
              sessions.map((s) => <SessionRow key={s.id} session={s} />)
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
          <div className="text-2xl font-black">
            {inr(course.price_inr) ?? 'Enquire for pricing'}
            {inr(course.mrp_inr) && inr(course.mrp_inr) !== inr(course.price_inr) && (
              <span className="ml-2 text-base font-medium text-blue-900 line-through">
                {inr(course.mrp_inr)}
              </span>
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm text-blue-900">
            {course.duration_days && <li>Duration: <b>{course.duration_days} days</b></li>}
            <li>Mode: <b className="capitalize">{course.mode.replace('_', ' ')}</b></li>
            {course.certificate && <li>Certificate included</li>}
          </ul>
          <div className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="font-bold">Interested?</h3>
            <div className="mt-3">
              <EnquiryForm />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
