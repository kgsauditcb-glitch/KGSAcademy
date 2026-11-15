import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { getAllCourses } from '@/lib/data';

import { createSession } from '../actions';
import SessionForm from '../SessionForm';

export const metadata = {
  title: 'Admin — New Session',
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

function SessionPageFallback() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-4 w-32 rounded bg-(--border)" />
      <div className="mt-6 h-9 w-64 rounded bg-(--border)" />
      <div className="mt-8 h-64 rounded-2xl bg-(--bg-card)" />
    </div>
  );
}

async function NewSessionContent({ searchParams }: PageProps) {
  await connection();

  const [{ error }, courses] = await Promise.all([
    searchParams,
    getAllCourses(),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/sessions"
        className="text-sm font-bold text-(--text-secondary) hover:text-orange-500"
      >
        ← Back to sessions
      </Link>

      <h1 className="mt-5 text-3xl font-black tracking-tight">
        Create Session
      </h1>

      <p className="mt-1 text-sm text-(--text-secondary)">
        Schedule a new training session for a course.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
          {error}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-(--border) bg-(--bg-card) p-8">
          <p className="font-bold">No courses available.</p>

          <p className="mt-2 text-sm text-(--text-secondary)">
            Create a course before scheduling a session.
          </p>

          <Link
            href="/admin/courses/new"
            className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <SessionForm
            courses={courses}
            action={createSession}
            submitLabel="Create Session"
          />
        </div>
      )}
    </div>
  );
}

export default function NewSessionPage(props: PageProps) {
  return (
    <Suspense fallback={<SessionPageFallback />}>
      <NewSessionContent {...props} />
    </Suspense>
  );
}