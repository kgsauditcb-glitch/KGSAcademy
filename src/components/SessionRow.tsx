import Link from 'next/link';
import type { CourseSession } from '@/types/database';

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function SessionRow({
  session,
  courseTitle,
  courseSlug,
}: {
  session: CourseSession;
  courseTitle?: string | null;
  courseSlug?: string | null;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="w-24 shrink-0 text-sm font-extrabold text-slate-800">
        {formatDate(session.start_date)}
      </div>
      <div className="min-w-0 flex-1">
        {courseSlug ? (
          <Link href={`/courses/${courseSlug}`} className="font-bold hover:text-orange-700">
            {courseTitle}
          </Link>
        ) : (
          <p className="font-bold">{courseTitle}</p>
        )}
        <p className="mt-0.5 text-sm text-slate-800">
          {session.location ?? 'TBA'}
          {session.start_time && ` • ${session.start_time.slice(0, 5)}`}
          {session.capacity != null && ` • ${session.seats_filled}/${session.capacity} seats`}
        </p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-800">
        {session.status}
      </span>
    </div>
  );
}
