export const instant = false;

import { getAllSessions } from '@/lib/data';
import type { CourseSession } from '@/types/database';

type SessionWithCourse = CourseSession & { courses: { title: string; slug: string } | null };

export const metadata = { title: 'Admin — Sessions' };

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default async function AdminSessionsPage() {
  const sessions = (await getAllSessions()) as SessionWithCourse[];

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight">Sessions</h1>
      <p className="mt-1 text-slate-600">{sessions.length} scheduled session{sessions.length === 1 ? '' : 's'}.</p>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Start</th>
              <th className="px-5 py-3">Location</th>
              <th className="px-5 py-3">Seats</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-600">No sessions yet.</td></tr>
            ) : (
              sessions.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-bold">{s.courses?.title ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">{formatDate(s.start_date)}</td>
                  <td className="px-5 py-3 text-slate-600">{s.location ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {s.seats_filled}{s.capacity != null ? ` / ${s.capacity}` : ''}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold capitalize text-slate-600">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
