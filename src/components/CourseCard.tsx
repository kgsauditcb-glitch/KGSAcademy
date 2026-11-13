import Link from 'next/link';
import type { CourseWithRelations } from '@/lib/data';
import { offerBadgeLabel, offerDiscount } from '@/lib/data';
import type { Offer } from '@/types/database';

function inr(value: number | null) {
  if (value == null) return null;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function CourseCard({
  course,
  offer,
}: {
  course: CourseWithRelations;
  offer?: Offer | null;
}) {
  const price = inr(course.price_inr);
  const finalPrice =
    offer && course.price_inr != null
      ? inr(Math.max(0, course.price_inr - offerDiscount(offer, course.price_inr)))
      : price;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group rounded-2xl border border-(--border) bg-(--bg-card) shadow-sm overflow-hidden hover:shadow-md transition"
    >
      <div className="relative h-32 bg-gradient-to-br from-orange-900 to-amber-900 flex items-end p-4">
        {offer && (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow">
            {offerBadgeLabel(offer)}
          </span>
        )}
        <span className="text-xs font-extrabold uppercase tracking-wide text-orange-300">
          {course.categories?.name ?? 'Course'}
          {course.featured && ' • Featured'}
        </span>
      </div>
      <div className="p-5">
        <span className="inline-block rounded-md bg-orange-950 px-2 py-1 text-[11px] font-extrabold text-orange-300">
          {course.standards?.code ?? course.mode.replace('_', ' ')}
        </span>
        <h3 className="mt-2 text-lg font-bold leading-snug group-hover:text-orange-300">
          {course.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--text-secondary)">
          {course.duration_days && <span>{course.duration_days} days</span>}
          <span className="capitalize">{course.mode.replace('_', ' ')}</span>
          {course.certificate && <span>Certificate</span>}
        </div>
        {finalPrice && (
          <div className="mt-4 font-extrabold">
            {finalPrice}
            {price && finalPrice !== price && (
              <span className="ml-2 text-sm font-medium text-(--text-secondary) line-through">
                {price}
              </span>
            )}
            {offer?.code && (
              <span className="ml-2 rounded bg-(--bg-subtle) px-1.5 py-0.5 text-[10px] font-bold text-(--text-secondary)">
                {offer.code}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
