export const instant = false;

import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';
import { getCourses, getCategories, getStandards, getActiveOffers, offerForCourse, isSupabaseConfigured } from '@/lib/data';

export const metadata = { title: 'Courses' };

export default async function CoursesPage({
  searchParams,
}: PageProps<'/courses'>) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const standard = typeof params.standard === 'string' ? params.standard : undefined;
  const q = typeof params.q === 'string' ? params.q : undefined;

  const [courses, categories, standards, offers] = await Promise.all([
    getCourses({ categorySlug: category, standardSlug: standard, search: q }),
    getCategories(),
    getStandards(),
    getActiveOffers(),
  ]);

  const chip =
    'rounded-full border px-4 py-1.5 text-sm font-bold whitespace-nowrap ' +
    'border-(--border) bg-(--bg-card) text-(--text-secondary) hover:border-orange-400';
  const chipActive =
    'rounded-full border px-4 py-1.5 text-sm font-bold whitespace-nowrap ' +
    'border-orange-700 bg-orange-700 text-white';

    
const visibleCategories = q
  ? categories.filter((category) =>
      courses.some(
        (course) => course.categories?.slug === category.slug
      )
    )
  : categories;

const visibleStandards = q
  ? standards.filter((standard) =>
      courses.some(
        (course) => course.standards?.slug === standard.slug
      )
    )
  : standards;
    

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Courses</h1>
      <p className="mt-2 text-(--text-secondary)">
        Browse the full KGS Academy catalogue by category, standard or delivery mode.
      </p>

    {/* Category filter */}
{visibleCategories.length > 0 && (
  <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
    <Link href="/courses" className={!category ? chipActive : chip}>
      All
    </Link>

    {visibleCategories.map((c) => (
      <Link
        key={c.id}
        href={`/courses?category=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
        className={category === c.slug ? chipActive : chip}
      >
        {c.name}
      </Link>
    ))}
  </div>
)}

    {/* Standard filter */}
{visibleStandards.length > 0 && (
  <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
    <span className="self-center text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
      Standard:
    </span>

    {visibleStandards.map((s) => (
      <Link
        key={s.id}
        href={`/courses?standard=${s.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
        className={standard === s.slug ? chipActive : chip}
      >
        {s.code}
      </Link>
    ))}
  </div>
)}

      {q && (
        <p className="mt-6 text-sm text-(--text-secondary)">
          Results for <b>&ldquo;{q}&rdquo;</b> — {courses.length} course{courses.length === 1 ? '' : 's'}
        </p>
      )}

    {courses.length === 0 ? (
  <div className="mt-10 rounded-2xl border border-dashed border-(--border-strong) bg-(--bg-card) p-12 text-center">
    {!isSupabaseConfigured() ? (
      <>
        <p className="font-bold text-(--text-secondary)">
          Connect Supabase to load the catalogue
        </p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Copy .env.example to .env.local and apply supabase/migrations/0001_init.sql.
        </p>
      </>
    ) : q ? (
      <>
        <h2 className="text-2xl font-black tracking-tight">
          Course Coming Soon!
        </h2>

        <p className="mt-3 text-(--text-secondary)">
          The course "{q}" is coming up in the next release.
        </p>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Interested in this course? Send us an enquiry and our team will
          get back to you.
        </p>

        <Link
          href="/enquiry"
          className="mt-6 inline-block rounded-xl bg-orange-700 px-6 py-3 text-sm font-bold text-white hover:bg-orange-800"
        >
          Enquire Now
        </Link>
      </>
    ) : (
      <>
        <p className="font-bold text-(--text-secondary)">
          No courses match your filters
        </p>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Try selecting another category or standard.
        </p>
      </>
    )}
  </div>
) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} offer={offerForCourse(offers, c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
