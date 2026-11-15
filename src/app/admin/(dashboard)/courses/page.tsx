
export const instant = false;

import Link from 'next/link';
import { connection } from 'next/server';
import { getAllCourses } from '@/lib/data';

export const metadata = {
  title: 'Admin — Courses',
};

type PageProps = {
  searchParams: Promise<{
    success?: string;
  }>;
};

const MODE_LABELS: Record<string, string> = {
  classroom: 'Classroom',
  live_online: 'Live online',
  hybrid: 'Hybrid',
  self_paced: 'Self-paced',
};

export default async function AdminCoursesPage({
  searchParams,
}: PageProps) {
  await connection();

  const [courses, params] = await Promise.all([
    getAllCourses(),
    searchParams,
  ]);

  const successMessage =
    params.success === 'created'
      ? 'Course created successfully.'
      : params.success === 'updated'
        ? 'Course updated successfully.'
        : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            Courses
          </h1>
          <p className="mt-1 text-(--text-secondary)">
            {courses.length} course{courses.length === 1 ? '' : 's'} in the catalogue.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          className="rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white hover:bg-orange-800"
        >
          + Create course
        </Link>
      </div>

      {successMessage && (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-400">
          {successMessage}
        </div>
      )}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-(--border) bg-(--bg-card)">
        <table className="w-full text-sm">
          <thead className="bg-(--bg-page) text-left text-xs font-extrabold uppercase tracking-wide text-(--text-secondary)">
            <tr>
              <th className="px-5 py-4">Course</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Mode</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-(--border)">
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-(--text-secondary)"
                >
                  No courses yet. Create your first course.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr
                  key={course.id}
                  className="transition hover:bg-(--bg-page)"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold">{course.title}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      /{course.slug}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-(--text-secondary)">
                    {course.categories?.name ?? '—'}
                  </td>

                  <td className="px-5 py-4 text-(--text-secondary)">
                    {MODE_LABELS[course.mode] ?? course.mode}
                  </td>

                  <td className="px-5 py-4 text-(--text-secondary)">
                    {course.price_inr != null
                      ? `₹${Number(course.price_inr).toLocaleString('en-IN')}`
                      : '—'}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                        course.status === 'published'
                          ? 'bg-emerald-950 text-emerald-300'
                          : course.status === 'draft'
                            ? 'bg-amber-950 text-amber-300'
                            : 'bg-(--bg-subtle) text-(--text-secondary)'
                      }`}
                    >
                      {course.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/courses/${course.id}/edit`}
                      className="inline-block rounded-lg border border-(--border) px-4 py-2 text-xs font-bold transition hover:border-orange-500 hover:text-orange-500"
                    >
                      Edit
                    </Link>
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
