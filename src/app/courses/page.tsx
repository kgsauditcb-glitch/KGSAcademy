export const instant = false;

import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';
import { getCourses, getCategories, getStandards, isSupabaseConfigured } from '@/lib/data';

export const metadata = { title: 'Courses' };

export default async function CoursesPage({
  searchParams,
}: PageProps<'/courses'>) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const standard = typeof params.standard === 'string' ? params.standard : undefined;
  const q = typeof params.q === 'string' ? params.q : undefined;

  const [courses, categories, standards] = await Promise.all([
    getCourses({ categorySlug: category, standardSlug: standard, search: q }),
    getCategories(),
    getStandards(),
  ]);

  const chip =
    'rounded-full border px-4 py-1.5 text-sm font-bold whitespace-nowrap ' +
    'border-slate-200 bg-white text-slate-800 hover:border-orange-400';
  const chipActive =
    'rounded-full border px-4 py-1.5 text-sm font-bold whitespace-nowrap ' +
    'border-slate-900 bg-slate-900 text-white';

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Courses</h1>
      <p className="mt-2 text-slate-800">
        Browse the full KGS Academy catalogue by category, standard or delivery mode.
      </p>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <Link href="/courses" className={!category ? chipActive : chip}>All</Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/courses?category=${c.slug}`}
              className={category === c.slug ? chipActive : chip}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Standard filter */}
      {standards.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          <span className="self-center text-xs font-extrabold uppercase tracking-wide text-slate-800">
            Standard:
          </span>
          {standards.map((s) => (
            <Link
              key={s.id}
              href={`/courses?standard=${s.slug}`}
              className={standard === s.slug ? chipActive : chip}
            >
              {s.code}
            </Link>
          ))}
        </div>
      )}

      {q && (
        <p className="mt-6 text-sm text-slate-800">
          Results for <b>&ldquo;{q}&rdquo;</b> — {courses.length} course{courses.length === 1 ? '' : 's'}
        </p>
      )}

      {courses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="font-bold text-slate-800">
            {isSupabaseConfigured() ? 'No courses match your filters' : 'Connect Supabase to load the catalogue'}
          </p>
          {!isSupabaseConfigured() && (
            <p className="mt-1 text-sm text-slate-800">
              Copy .env.example to .env.local and apply supabase/migrations/0001_init.sql.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}
