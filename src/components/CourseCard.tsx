import Link from 'next/link';
import type { CourseWithRelations } from '@/lib/data';

function inr(value: number | null) {
  if (value == null) return null;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function CourseCard({ course }: { course: CourseWithRelations }) {
  const price = inr(course.price_inr);
  const mrp = inr(course.mrp_inr);

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="h-32 bg-gradient-to-br from-violet-100 to-blue-100 flex items-end p-4">
        <span className="text-xs font-extrabold uppercase tracking-wide text-violet-700">
          {course.categories?.name ?? 'Course'}
          {course.featured && ' • Featured'}
        </span>
      </div>
      <div className="p-5">
        <span className="inline-block rounded-md bg-violet-50 px-2 py-1 text-[11px] font-extrabold text-violet-700">
          {course.standards?.code ?? course.mode.replace('_', ' ')}
        </span>
        <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-violet-700">
          {course.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-800">
          {course.duration_days && <span>{course.duration_days} days</span>}
          <span className="capitalize">{course.mode.replace('_', ' ')}</span>
          {course.certificate && <span>Certificate</span>}
        </div>
        {price && (
          <div className="mt-4 font-extrabold">
            {price}
            {mrp && mrp !== price && (
              <span className="ml-2 text-sm font-medium text-slate-800 line-through">{mrp}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
