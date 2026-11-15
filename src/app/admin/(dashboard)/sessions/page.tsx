
export const instant = false;

import { connection } from 'next/server';
import Link from 'next/link';
import { getAllSessions } from '@/lib/data';
import type { CourseSession } from '@/types/database';

type SessionWithCourse = CourseSession & {
  courses: { title: string; slug: string } | null;
};

export const metadata = { title: 'Admin — Sessions' };

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-500',
  open: 'bg-green-500/10 text-green-500',
  full: 'bg-orange-500/10 text-orange-500',
  completed: 'bg-purple-500/10 text-purple-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

type PageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function AdminSessionsPage({
  searchParams,
}: PageProps) {
  // Force request-time rendering before accessing dynamic values.
  await connection();

  const [sessionsData, params] = await Promise.all([
    getAllSessions(),
    searchParams,
  ]);

  const sessions = sessionsData as SessionWithCourse[];

  const successMessages: Record<string, string> = {
    created: 'Session created successfully.',
    updated: 'Session updated successfully.',
    deleted: 'Session deleted successfully.',
  };

  const totalSeats = sessions.reduce(
    (sum, session) => sum + session.seats_filled,
    0,
  );

  const openSessions = sessions.filter(
    (session) => session.status === 'open',
  ).length;

  const fullSessions = sessions.filter(
    (session) => session.status === 'full',
  ).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Sessions</h1>
          <p className="mt-1 text-sm text-(--text-secondary)">
            Manage course schedules, capacity and enrollment.
          </p>
        </div>

        <Link
          href="/admin/sessions/new"
          className="rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800"
        >
          + Create Session
        </Link>
      </div>

      {params.success && successMessages[params.success] && (
        <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm font-bold text-green-500">
          {successMessages[params.success]}
        </div>
      )}

      {params.error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500">
          {params.error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-2xl border border-(--border) bg-(--bg-card)">
        <div className="flex items-center justify-between border-b border-(--border) px-5 py-4">
          <h2 className="font-black">All Sessions</h2>
          <span className="text-xs font-bold text-(--text-secondary)">
            {sessions.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-(--bg-page) text-left text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
              <tr>
                <th className="px-5 py-4">Course</th>
                <th className="px-5 py-4">Start</th>
                <th className="px-5 py-4">End</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Seats</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-(--border)">
              {sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-(--text-secondary)"
                  >
                    <p className="font-bold">No sessions yet.</p>
                    <p className="mt-1 text-xs">
                      Create your first course session to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  const availableSeats =
                    session.capacity == null
                      ? null
                      : Math.max(
                          0,
                          session.capacity - session.seats_filled,
                        );

                  return (
                    <tr
                      key={session.id}
                      className="transition hover:bg-(--bg-page)"
                    >
                      <td className="px-5 py-4 font-bold">
                        {session.courses?.title ?? '—'}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-(--text-secondary)">
                        {formatDate(session.start_date)}
                        {session.start_time && (
                          <span className="mt-1 block text-xs">
                            {session.start_time.slice(0, 5)}
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-(--text-secondary)">
                        {session.end_date
                          ? formatDate(session.end_date)
                          : '—'}
                      </td>

                      <td className="px-5 py-4 text-(--text-secondary)">
                        {session.location ?? '—'}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="font-bold">
                          {session.seats_filled}
                          {session.capacity != null
                            ? ` / ${session.capacity}`
                            : ''}
                        </p>
                        {availableSeats !== null && (
                          <p className="mt-1 text-xs text-(--text-secondary)">
                            {availableSeats} available
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-extrabold capitalize ${
                            STATUS_STYLES[session.status] ??
                            'bg-(--bg-subtle) text-(--text-secondary)'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/sessions/${session.id}/edit`}
                          className="inline-flex rounded-lg border border-(--border) px-3 py-2 text-xs font-bold transition hover:border-orange-500 hover:text-orange-500"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
