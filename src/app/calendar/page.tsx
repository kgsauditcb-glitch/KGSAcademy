export const instant = false;

import { SessionRow } from '@/components/SessionRow';
import { getUpcomingSessions, isSupabaseConfigured } from '@/lib/data';

export const metadata = { title: 'Course Calendar' };

export default async function CalendarPage() {
  const sessions = await getUpcomingSessions(50);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="text-4xl font-black tracking-tight">Course calendar</h1>
      <p className="mt-2 text-(--text-secondary)">All upcoming sessions across the academy.</p>

      <div className="mt-8 rounded-2xl border border-(--border) bg-(--bg-card) px-6">
        {sessions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-bold text-(--text-secondary)">
              {isSupabaseConfigured() ? 'No upcoming sessions' : 'Connect Supabase to load the calendar'}
            </p>
            {!isSupabaseConfigured() && (
              <p className="mt-1 text-sm text-(--text-secondary)">
                Copy .env.example to .env.local and apply supabase/migrations/0001_init.sql.
              </p>
            )}
          </div>
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
    </div>
  );
}
