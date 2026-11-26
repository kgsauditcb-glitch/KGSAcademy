
import Link from 'next/link';
import type { CourseWithRelations } from '@/lib/data';
import { offerBadgeLabel, offerDiscount } from '@/lib/data';
import type { Offer } from '@/types/database';

function formatPrice(value: number | null, currency: string) {
  if (value == null) return null;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CourseCard({
  course,
  offer,
}: {
  course: CourseWithRelations;
  offer?: Offer | null;
}) {
  const currency = course.currency_code || 'INR';

  const price = formatPrice(course.price_inr, currency);
  const mrp = formatPrice(course.mrp_inr, currency);

  const finalPrice =
    offer && course.price_inr != null
      ? formatPrice(
          Math.max(
            0,
            course.price_inr - offerDiscount(offer, course.price_inr),
          ),
          currency,
        )
      : price;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card) shadow-sm transition hover:shadow-md"
    >
      {/* Course Thumbnail */}
      <div className="relative h-32 overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-end bg-gradient-to-br from-orange-900 to-amber-900 p-4">
            <span className="text-xs font-extrabold uppercase tracking-wide text-orange-300">
              {course.categories?.name ?? 'Course'}
              {course.featured && ' • Featured'}
            </span>
          </div>
        )}

        {offer && !course.on_demand && (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow">
            {offerBadgeLabel(offer)}
          </span>
        )}

        {course.thumbnail_url && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
            <span className="text-xs font-extrabold uppercase tracking-wide text-white">
              {course.categories?.name ?? 'Course'}
              {course.featured && ' • Featured'}
            </span>
          </div>
        )}
      </div>

      {/* Course Details */}
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

        {course.on_demand ? (
          <div className="mt-4 font-extrabold text-orange-400">
            Price on Request
          </div>
        ) : finalPrice ? (
          <div className="mt-4 font-extrabold">
            {finalPrice}

            {mrp && (
              <span className="ml-2 text-sm font-medium text-(--text-secondary) line-through">
                {mrp}
              </span>
            )}

            {offer?.code && (
              <span className="ml-2 rounded bg-(--bg-subtle) px-1.5 py-0.5 text-[10px] font-bold text-(--text-secondary)">
                {offer.code}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
