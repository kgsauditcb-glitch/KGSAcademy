export const instant = false;

import { getAllCourses } from '@/lib/data';

export const metadata = { title: 'Admin — Courses' };

const MODE_LABELS: Record<string, string> = {
  classroom: 'Classroom',
  live_online: 'Live online',
  hybrid: 'Hybrid',
  self_paced: 'Self-paced',
};

export default async function AdminCoursesPage() {
  const courses = await getAllCourses();

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Courses</h1>
          <p className="mt-1 text-blue-200">{courses.length} course{courses.length === 1 ? '' : 's'} in the catalogue.</p>
        </div>
        {/* TODO: "New course" button → /admin/courses/new form */}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-blue-800 bg-blue-900">
        <table className="w-full text-sm">
          <thead className="bg-blue-950 text-left text-xs font-extrabold uppercase tracking-wide text-blue-200">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Mode</th>
              <th className="px-5 py-3">Price</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-800">
            {courses.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-blue-200">No courses yet.</td></tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} className="hover:bg-blue-950">
                  <td className="px-5 py-3 font-bold">{c.title}</td>
                  <td className="px-5 py-3 text-blue-200">{c.categories?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-blue-200">{MODE_LABELS[c.mode] ?? c.mode}</td>
                  <td className="px-5 py-3 text-blue-200">
                    {c.price_inr != null ? `₹${Number(c.price_inr).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                      c.status === 'published' ? 'bg-emerald-950 text-emerald-300'
                      : c.status === 'draft' ? 'bg-amber-950 text-amber-300'
                      : 'bg-blue-800 text-blue-200'
                    }`}>
                      {c.status}
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
