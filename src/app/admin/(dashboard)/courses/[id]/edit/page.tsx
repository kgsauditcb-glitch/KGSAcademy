
export const instant = false;

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { updateCourseAction } from '../../actions';
import { CourseForm } from '../../CourseForm';
import { getCategories, getStandards } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Edit Course',
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function EditCoursePage({
  params,
  searchParams,
}: PageProps) {
  // Force request-time rendering before accessing dynamic data.
  await connection();

  const { id } = await params;
  const search = await searchParams;

  const supabase = await createClient();

  const [
    { data: course, error },
    categories,
    standards,
  ] = await Promise.all([
    supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single(),
    getCategories(),
    getStandards(),
  ]);

  if (error || !course) {
    notFound();
  }

  const updateAction = updateCourseAction.bind(null, id);

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
          Edit course
        </h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          Update the details and publishing settings for {course.title}.
        </p>
      </div>

      {search.error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-400">
          {search.error}
        </div>
      )}

      <CourseForm
        categories={categories}
        standards={standards}
        initialData={course}
        action={updateAction}
        submitLabel="Save changes"
      />
    </div>
  );
}
