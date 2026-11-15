import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllCourses } from '@/lib/data';
import type { CourseSession } from '@/types/database';

import { updateSession, deleteSession } from '../../actions';
import SessionForm from '../../SessionForm';

export const metadata = { title: 'Admin — Edit Session' };

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

function EditSessionFallback() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="h-4 w-32 rounded bg-(--border)" />
      <div className="mt-6 h-9 w-64 rounded bg-(--border)" />
      <div className="mt-8 h-64 rounded-2xl bg-(--bg-card)" />
    </div>
  );
}

async function EditSessionContent({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const [{ id }, { error }] = await Promise.all([
    params,
    searchParams,
  ]);

  const supabase = await createClient();

  const [{ data, error: fetchError }, courses] = await Promise.all([
    supabase
      .from('course_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle(),
    getAllCourses(),
  ]);

  if (fetchError || !data) notFound();

  const session = data as CourseSession;
  const updateAction = updateSession.bind(null, id);

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/admin/sessions"
        className="text-sm font-bold text-(--text-secondary) hover:text-orange-500"
      >
        ← Back to sessions
      </Link>

      <h1 className="mt-5 text-3xl font-black tracking-tight">
        Edit Session
      </h1>

      <p className="mt-1 text-sm text-(--text-secondary)">
        Update session schedule, capacity and enrollment.
      </p>

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-500">
          {error}
        </div>
      )}

      <div className="mt-8">
        <SessionForm
          courses={courses}
          session={session}
          action={updateAction}
          submitLabel="Save Changes"
        />
      </div>

      <div className="mt-8 rounded-2xl border border-red-500/20 bg-(--bg-card) p-6">
        <h2 className="font-black text-red-500">Delete Session</h2>

        <p className="mt-2 text-sm text-(--text-secondary)">
          Permanently delete this session. This action cannot be undone.
        </p>

        <form action={deleteSession} className="mt-5">
          <input type="hidden" name="id" value={id} />

          <button
            type="submit"
            className="rounded-xl border border-red-500/40 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
          >
            Delete Session
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EditSessionPage(props: PageProps) {
  return (
    <Suspense fallback={<EditSessionFallback />}>
      <EditSessionContent {...props} />
    </Suspense>
  );
}