export const instant = false;

import Link from 'next/link';
import { CourseCard } from '@/components/CourseCard';
import { getCourses, getCategories, getStandards, getActiveOffers, offerForCourse, isSupabaseConfigured } from '@/lib/data';

export const metadata = { title: 'Courses' };

export default async function CoursesPage({
  searchParams,
}: PageProps<'/courses'>) {
  const params = await searchParams;
const categoriesSelected = Array.isArray(params.category)
  ? params.category
  : params.category
    ? [params.category]
    : [];

const standardsSelected = Array.isArray(params.standard)
  ? params.standard
  : params.standard
    ? [params.standard]
    : [];

const q = typeof params.q === 'string' ? params.q : undefined;

  const [courses, categories, standards, offers] = await Promise.all([
    getCourses({
  categorySlugs: categoriesSelected,
  standardSlugs: standardsSelected,
  search: q,
}),
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

const chipClear =
  'ml-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ' +
  'text-xs font-bold text-(--text-secondary) ' +
  'border border-(--border) hover:bg-(--bg-card) ' +
  'hover:text-red-500 hover:border-red-400 transition-all';

    const filterHref = (
  selectedCategories: string[],
  selectedStandards: string[]
) => {
  const search = new URLSearchParams();

  selectedCategories.forEach((slug) => search.append('category', slug));
  selectedStandards.forEach((slug) => search.append('standard', slug));

  if (q) search.set('q', q);

  return `/courses?${search.toString()}`;
};

const toggleFilter = (selected: string[], slug: string) =>
  selected.includes(slug)
    ? selected.filter((item) => item !== slug)
    : [...selected, slug];

    
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
  <div className="mt-8 flex flex-wrap items-center gap-2">
    <Link
      href={filterHref([], standardsSelected)}
      className={categoriesSelected.length === 0 ? chipActive : chip}
    >
      All
    </Link>

    {visibleCategories.map((c) => {
      const isSelected = categoriesSelected.includes(c.slug);

      return (
        <Link
          key={c.id}
          href={filterHref(
            toggleFilter(categoriesSelected, c.slug),
            standardsSelected
          )}
          className={isSelected ? chipActive : chip}
        >
          {c.name}
        </Link>
      );
    })}

    {categoriesSelected.length > 0 && (
      <Link
  href={filterHref([], standardsSelected)}
  className={chipClear}
>
  <span className="inline-flex items-center gap-1.5">
    
    Clear
  </span>
</Link>
    )}
  </div>
)}

{/* Standard filter */}
{visibleStandards.length > 0 && (
  <div className="mt-4 flex flex-wrap items-center gap-2">
    <span className="text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
      Standard:
    </span>

    {visibleStandards.map((s) => {
      const isSelected = standardsSelected.includes(s.slug);

      return (
        <Link
          key={s.id}
          href={filterHref(
            categoriesSelected,
            toggleFilter(standardsSelected, s.slug)
          )}
          className={isSelected ? chipActive : chip}
        >
          {s.code}
        </Link>
      );
    })}

    {standardsSelected.length > 0 && (
     <Link
  href={filterHref(categoriesSelected, [])}
  className={chipClear}
>
   Clear
</Link>
    )}
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
