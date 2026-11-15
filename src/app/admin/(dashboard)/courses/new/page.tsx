
export const instant = false;

import Link from 'next/link';
import { createCourseAction } from '../actions';
import { CourseForm } from '../CourseForm';
import { getCategories, getStandards } from '@/lib/data';

export const metadata = {
  title: 'Create Course',
};

type PageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewCoursePage({ searchParams }: PageProps) {
  const params = await searchParams;

  const [categories, standards] = await Promise.all([
    getCategories(),
    getStandards(),
  ]);

  return (
    <div>
      <Link
        href="/admin/courses"
        className="text-sm font-bold text-(--text-secondary) hover:text-orange-500"
      >
        ← Back to courses
      </Link>

      <div className="mb-8 mt-5">
        <h1 className="text-3xl font-black tracking-tight">
          Create new course
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Add a new training course to the KGS Academy catalogue.
        </p>
      </div>

      {params.error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {params.error}
        </div>
      )}

      <CourseForm
        categories={categories}
        standards={standards}
        action={createCourseAction}
        submitLabel="Create course"
      />
    </div>
  );
}
